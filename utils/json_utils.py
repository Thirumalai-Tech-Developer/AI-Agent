# utils/json_utils.py
"""
v2 — Robust JSON extraction from raw LLM output.

Strategy (tried in order):
  1. Strip markdown fences
  2. Protect code blocks from repair libraries (preserve TSX/JSX)
  3. Try: stdlib json → dirtyjson → json_repair → dirtyjson(repaired)
  4. Restore original code strings after parse
"""

from __future__ import annotations

import json
import re
from typing import Any

import dirtyjson
from json_repair import repair_json
from pydantic import BaseModel


# ── Result schema ─────────────────────────────────────────────────────────────

class ParseResult(BaseModel):
    success: bool
    method:  str | None = None
    data:    Any        = None
    error:   str | None = None
    raw:     str | None = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_fences(text: str) -> str:
    m = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
    return m.group(1) if m else text


def _protect_code_blocks(text: str) -> tuple[str, dict[str, str]]:
    """
    Replace 'code' field values with opaque placeholders so JSON repair
    libraries don't mangle TSX/JSX syntax inside them.
    """
    placeholders: dict[str, str] = {}
    idx = 0

    def _repl(match: re.Match) -> str:
        nonlocal idx
        key = f"__CODE_BLOCK_{idx}__"
        placeholders[key] = match.group(1)
        idx += 1
        return f'"code":"{key}"'

    protected = re.sub(
        r'"code"\s*:\s*"((?:\\.|[^"\\])*)"',
        _repl,
        text,
        flags=re.DOTALL,
    )
    return protected, placeholders


def _restore_code_blocks(data: Any, placeholders: dict[str, str]) -> Any:
    if isinstance(data, dict):
        return {
            k: (placeholders[v] if isinstance(v, str) and v in placeholders
                else _restore_code_blocks(v, placeholders))
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [_restore_code_blocks(item, placeholders) for item in data]
    return data


# ── Public API ────────────────────────────────────────────────────────────────

def extract_json(text: str) -> ParseResult:
    """
    Parse JSON from raw LLM output, returning a typed ParseResult.

    Example:
        result = extract_json(raw_llm_output)
        if result.success:
            data = result.data
    """
    if not text or not text.strip():
        return ParseResult(success=False, error="empty_input")

    stripped              = _strip_fences(text.strip())
    protected, ph         = _protect_code_blocks(stripped)

    candidates: list[tuple[str, str]] = [
        ("json_raw",      protected),
        ("dirty_raw",     protected),
    ]

    try:
        repaired = repair_json(protected)
        candidates += [("json_repaired", repaired), ("dirty_repaired", repaired)]
    except Exception:
        pass

    for method, candidate in candidates:
        try:
            parsed = (dirtyjson.loads(candidate) if "dirty" in method
                      else json.loads(candidate))
            # Round-trip to normalise types
            normalised = json.loads(json.dumps(parsed))
            restored   = _restore_code_blocks(normalised, ph)
            return ParseResult(success=True, method=method, data=restored)
        except Exception:
            continue

    return ParseResult(success=False, error="unable_to_parse", raw=text)


class JSONRepair:
    """Drop-in utility for callers that just need a clean JSON string."""

    def repair(self, text: str) -> str:
        result = extract_json(text)
        if result.success:
            return json.dumps(result.data, ensure_ascii=False, indent=2)
        return repair_json(text)