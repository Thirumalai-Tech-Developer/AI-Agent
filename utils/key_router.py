"""
utils/key_router.py

Manages multiple API keys per provider with:
  - Key rotation  on: 429, 401, quota exceeded
  - Backoff retry on: 503, 500, overloaded (same key — server issue, not key issue)

.env format:
  GROQ_API_KEY_1=...      GROQ_API_KEY_2=...
  GEMINI_API_KEY_1=...    GEMINI_API_KEY_2=...
  CEREBRAS_API_KEY_1=...  CEREBRAS_API_KEY_2=...
  OPENROUTER_API_KEY_1=...
"""

import os
import time
from typing import Optional


# ─── Error classification ─────────────────────────────────────────────────────

# Rotate key — key is rate-limited or invalid
ROTATE_ON = [
    "429", "rate limit", "rate_limit", "quota", "exceeded",
    "too many requests", "unauthorized", "401",
    "invalid api key", "api key expired",
]

# Retry same key — server overloaded, not a key problem
RETRY_ON = [
    "503", "500", "502", "504",
    "unavailable", "overloaded", "high demand",
    "service unavailable", "temporarily unavailable",
    "server error", "internal server error",
]

def _should_rotate(error: str) -> bool:
    low = error.lower()
    return any(t in low for t in ROTATE_ON)

def _should_retry(error: str) -> bool:
    low = error.lower()
    return any(t in low for t in RETRY_ON)


# ─── Key pool ─────────────────────────────────────────────────────────────────

_ENV_PREFIX = {
    "groq":       "GROQ_API_KEY_",
    "gemini":     "GEMINI_API_KEY_",
    "cerebras":   "CEREBRAS_API_KEY_",
    "openrouter": "OPENROUTER_API_KEY_",
}

def get_keys(provider: str) -> list[str]:
    prefix = _ENV_PREFIX.get(provider)
    if not prefix:
        raise ValueError(f"Unknown provider: {provider}")
    keys, i = [], 1
    while True:
        key = os.getenv(f"{prefix}{i}")
        if not key:
            break
        keys.append(key)
        i += 1
    if not keys:
        raise RuntimeError(
            f"No API keys for '{provider}'. Expected: {prefix}1, {prefix}2, ..."
        )
    return keys


# ─── Key Router ───────────────────────────────────────────────────────────────

class KeyRouter:
    def __init__(self):
        self._index:     dict[str, int]  = {}
        self._exhausted: dict[str, set]  = {}

    def _init(self, provider: str):
        if provider not in self._index:
            self._index[provider]     = 0
            self._exhausted[provider] = set()

    def current(self, provider: str) -> str:
        self._init(provider)
        return get_keys(provider)[self._index[provider]]

    def rotate(self, provider: str, error: str = "") -> Optional[str]:
        self._init(provider)
        keys  = get_keys(provider)
        total = len(keys)
        cur   = self._index[provider]
        self._exhausted[provider].add(cur)
        print(f"[KeyRouter] '{provider}' key {cur+1}/{total} exhausted. {error[:60]}")
        for offset in range(1, total + 1):
            nxt = (cur + offset) % total
            if nxt not in self._exhausted[provider]:
                self._index[provider] = nxt
                print(f"[KeyRouter] Switching '{provider}' → key {nxt+1}/{total}")
                return keys[nxt]
        print(f"[KeyRouter] All {total} keys for '{provider}' exhausted.")
        return None

    def reset(self, provider: str):
        self._init(provider)
        self._exhausted[provider].clear()
        self._index[provider] = 0
        print(f"[KeyRouter] Reset '{provider}'.")

    def status(self, provider: str) -> dict:
        self._init(provider)
        keys = get_keys(provider)
        return {
            "provider":    provider,
            "total_keys":  len(keys),
            "current_key": self._index[provider] + 1,
            "exhausted":   len(self._exhausted[provider]),
            "available":   len(keys) - len(self._exhausted[provider]),
        }


_router = KeyRouter()


# ─── Main wrapper ─────────────────────────────────────────────────────────────

def with_key_rotation(
    provider: str,
    fn,
    *args,
    max_retries: int = None,
    max_server_retries: int = 5,
    **kwargs,
):
    """
    Call fn(api_key, *args, **kwargs) with automatic error handling:

    - 429 / quota / 401  → rotate to next key, exponential backoff
    - 503 / 500 / overloaded → retry SAME key, longer backoff (server issue)
    - other errors        → raise immediately
    """
    keys        = get_keys(provider)
    max_retries = max_retries or len(keys)

    key_attempt    = 0   # counts key rotations
    server_attempt = 0   # counts 503-style retries on same key

    while key_attempt < max_retries:
        api_key = _router.current(provider)
        try:
            return fn(api_key, *args, **kwargs)

        except Exception as e:
            err = str(e)

            if _should_retry(err):
                # Server overloaded — wait longer, retry same key
                server_attempt += 1
                if server_attempt > max_server_retries:
                    raise RuntimeError(
                        f"[KeyRouter] '{provider}' server error after "
                        f"{max_server_retries} retries: {err}"
                    )
                wait = min(10 * server_attempt, 60)  # 10s, 20s, 30s … max 60s
                print(f"[KeyRouter] '{provider}' 503/overloaded — "
                      f"waiting {wait}s (attempt {server_attempt}/{max_server_retries})...")
                time.sleep(wait)
                # Don't increment key_attempt — same key

            elif _should_rotate(err):
                # Rate limit / quota — switch key
                server_attempt = 0
                next_key = _router.rotate(provider, error=err)
                if next_key is None:
                    raise RuntimeError(
                        f"All API keys for '{provider}' exhausted. Last: {err}"
                    )
                wait = min(2 ** key_attempt, 16)
                print(f"[KeyRouter] Backoff {wait}s before retry...")
                time.sleep(wait)
                key_attempt += 1

            else:
                raise  # unrecognised error — don't swallow it

    raise RuntimeError(
        f"[KeyRouter] All {max_retries} key attempts failed for '{provider}'."
    )