# utils/llm_router.py
"""
v2 — LangChain-unified LLM router with multi-key rotation.

Wraps Groq, Gemini, Cerebras (OpenAI-compat), and OpenRouter behind a single
`call_llm(prompt, provider)` interface using LangChain chat models.

Key-rotation logic:
  - 429 / quota / 401  → rotate to next key, exponential backoff
  - 503 / 500 / overloaded → retry same key with longer backoff
"""

from __future__ import annotations

import os
import time
import json
from typing import Iterator
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

load_dotenv()

# ── Error classification ──────────────────────────────────────────────────────

_ROTATE_ON = [
    "429", "rate limit", "rate_limit", "quota", "exceeded",
    "too many requests", "unauthorized", "401",
    "invalid api key", "api key expired",
]
_RETRY_ON = [
    "503", "500", "502", "504",
    "unavailable", "overloaded", "high demand",
    "service unavailable", "temporarily unavailable",
    "server error", "internal server error",
]

def _should_rotate(err: str) -> bool:
    low = err.lower()
    return any(t in low for t in _ROTATE_ON)

def _should_retry(err: str) -> bool:
    low = err.lower()
    return any(t in low for t in _RETRY_ON)


# ── Key pool ──────────────────────────────────────────────────────────────────

_ENV_PREFIX: dict[str, str] = {
    "groq":       "GROQ_API_KEY_",
    "gemini":     "GEMINI_API_KEY_",
    "cerebras":   "CEREBRAS_API_KEY_",
    "openrouter": "OPENROUTER_API_KEY_",
}

def _get_keys(provider: str) -> list[str]:
    prefix = _ENV_PREFIX.get(provider)
    if not prefix:
        raise ValueError(f"Unknown provider: {provider!r}")
    keys, i = [], 1
    while key := os.getenv(f"{prefix}{i}"):
        keys.append(key)
        i += 1
    if not keys:
        raise RuntimeError(f"No API keys found for '{provider}'. Set {prefix}1, {prefix}2, ...")
    return keys


# ── LangChain model factory ───────────────────────────────────────────────────

_DEFAULT_MODELS: dict[str, str] = {
    "groq":       "meta-llama/llama-4-scout-17b-16e-instruct",
    "gemini":     "gemini-2.0-flash",
    "cerebras":   "zai-glm-4.7",
    "openrouter": "openai/gpt-oss-120b:free",
}

def _build_model(provider: str, api_key: str, model: str | None = None) -> BaseChatModel:
    m = model or _DEFAULT_MODELS[provider]

    if provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(api_key=api_key, model=m, temperature=0.6, streaming=True)

    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(google_api_key=api_key, model=m, temperature=0.6, streaming=True)

    if provider in ("cerebras", "openrouter"):
        from langchain_openai import ChatOpenAI
        base_url = (
            "https://api.cerebras.ai/v1" if provider == "cerebras"
            else "https://openrouter.ai/api/v1"
        )
        return ChatOpenAI(api_key=api_key, model=m, base_url=base_url,
                          temperature=0.6, streaming=True)

    raise ValueError(f"No model factory for provider: {provider!r}")


_SYSTEM_MSG = SystemMessage(content="You are a strict JSON generator. Always return valid JSON only.")


# ── Dataset logger ────────────────────────────────────────────────────────────

def _log_dataset(prompt: str, response: str, provider: str) -> None:
    path = "outputs/dataset/distilled_sessions.jsonl"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    record = {"timestamp": time.time(), "provider": provider,
               "prompt": prompt, "response": response}
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")


# ── Key-rotating call ─────────────────────────────────────────────────────────

class LLMRouter:
    """
    Single entry-point for all LLM calls.
    Handles key rotation, retries, streaming to stdout, and dataset logging.
    """

    def __init__(self):
        self._index:     dict[str, int]  = {}
        self._exhausted: dict[str, set]  = {}

    def _init(self, provider: str) -> None:
        if provider not in self._index:
            self._index[provider]     = 0
            self._exhausted[provider] = set()

    def _current_key(self, provider: str) -> str:
        self._init(provider)
        return _get_keys(provider)[self._index[provider]]

    def _rotate(self, provider: str, error: str = "") -> str | None:
        self._init(provider)
        keys  = _get_keys(provider)
        total = len(keys)
        cur   = self._index[provider]
        self._exhausted[provider].add(cur)
        print(f"[LLMRouter] '{provider}' key {cur+1}/{total} exhausted. {error[:60]}")
        for offset in range(1, total + 1):
            nxt = (cur + offset) % total
            if nxt not in self._exhausted[provider]:
                self._index[provider] = nxt
                print(f"[LLMRouter] Switching '{provider}' → key {nxt+1}/{total}")
                return keys[nxt]
        print(f"[LLMRouter] All {total} keys for '{provider}' exhausted.")
        return None

    def call(
        self,
        prompt:           str,
        provider:         str  = "gemini",
        model:            str | None = None,
        max_key_retries:  int  = None,
        max_srv_retries:  int  = 5,
    ) -> str:
        keys           = _get_keys(provider)
        max_key_retries = max_key_retries or len(keys)
        key_attempt    = 0
        srv_attempt    = 0

        messages = [_SYSTEM_MSG, HumanMessage(content=prompt)]

        while key_attempt < max_key_retries:
            api_key = self._current_key(provider)
            try:
                llm    = _build_model(provider, api_key, model)
                output = ""
                for chunk in llm.stream(messages):
                    token = chunk.content or ""
                    print(token, end="", flush=True)
                    output += token
                print()
                _log_dataset(prompt, output, provider)
                return output

            except Exception as e:
                err = str(e)

                if _should_retry(err):
                    srv_attempt += 1
                    if srv_attempt > max_srv_retries:
                        raise RuntimeError(
                            f"[LLMRouter] '{provider}' server error after {max_srv_retries} retries: {err}"
                        )
                    wait = min(10 * srv_attempt, 60)
                    print(f"[LLMRouter] Server error — waiting {wait}s ({srv_attempt}/{max_srv_retries})...")
                    time.sleep(wait)

                elif _should_rotate(err):
                    srv_attempt = 0
                    if not self._rotate(provider, err):
                        raise RuntimeError(f"All API keys for '{provider}' exhausted. Last: {err}")
                    wait = min(2 ** key_attempt, 16)
                    print(f"[LLMRouter] Backoff {wait}s before retry...")
                    time.sleep(wait)
                    key_attempt += 1

                else:
                    raise

        raise RuntimeError(f"[LLMRouter] All {max_key_retries} key attempts failed for '{provider}'.")

    def status(self, provider: str) -> dict:
        self._init(provider)
        keys = _get_keys(provider)
        return {
            "provider":    provider,
            "total_keys":  len(keys),
            "current_key": self._index[provider] + 1,
            "exhausted":   len(self._exhausted[provider]),
            "available":   len(keys) - len(self._exhausted[provider]),
        }


# Module-level singleton
_router = LLMRouter()

def call_llm(prompt: str, provider: str = "gemini", model: str | None = None) -> str:
    """Public convenience wrapper around the LLMRouter singleton."""
    return _router.call(prompt, provider=provider, model=model)