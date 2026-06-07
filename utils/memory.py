# utils/memory.py
"""
v2 — AgenticMemory with Pydantic-validated episode schema and
LangChain-compatible memory summary injection.
"""

from __future__ import annotations

import os
import json
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class Episode(BaseModel):
    timestamp:  str = Field(default_factory=lambda: datetime.now().isoformat())
    stage:      str
    target:     str
    status:     str                    # "fixed" | "failed" | "pending"
    error:      Optional[str] = None
    fix:        Optional[str] = None

class SystemState(BaseModel):
    learned_rules:          list[str] = Field(default_factory=list)
    successful_components:  list[str] = Field(default_factory=list)


# ── Memory core ───────────────────────────────────────────────────────────────

class AgenticMemory:
    """
    Persistent agentic memory with:
      - Episodic history (sliding window of 15)
      - Long-term learned rules
      - LangChain-compatible prompt injection via `as_langchain_messages()`
    """

    WINDOW = 15

    def __init__(self, memory_dir: str = "outputs/memory"):
        self.memory_dir      = memory_dir
        self.episodes_path   = os.path.join(memory_dir, "episodes.json")
        self.system_path     = os.path.join(memory_dir, "system_state.json")
        os.makedirs(memory_dir, exist_ok=True)
        self._bootstrap()

    # ── I/O helpers ───────────────────────────────────────────────────────────

    def _bootstrap(self) -> None:
        if not os.path.exists(self.episodes_path):
            self._write(self.episodes_path, [])
        if not os.path.exists(self.system_path):
            self._write(self.system_path, SystemState().model_dump())

    @staticmethod
    def _write(path: str, data) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    @staticmethod
    def _read(path: str, fallback):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return fallback

    # ── Public API ────────────────────────────────────────────────────────────

    def log_episode(
        self,
        stage:         str,
        file_target:   str,
        status:        str,
        error_message: str | None = None,
        fix_applied:   str | None = None,
    ) -> None:
        """Append a validated episode to the sliding history window."""
        ep = Episode(
            stage=stage,
            target=file_target,
            status=status,
            error=error_message,
            fix=fix_applied,
        )
        episodes: list[dict] = self._read(self.episodes_path, [])
        episodes.append(ep.model_dump())
        self._write(self.episodes_path, episodes[-self.WINDOW:])

    def learn_rule(self, rule: str) -> None:
        """Persist a new procedural rule to long-term memory (deduped)."""
        state = SystemState(**self._read(self.system_path, {}))
        if rule not in state.learned_rules:
            state.learned_rules.append(rule)
            self._write(self.system_path, state.model_dump())

    def mark_component_success(self, component_name: str) -> None:
        state = SystemState(**self._read(self.system_path, {}))
        if component_name not in state.successful_components:
            state.successful_components.append(component_name)
            self._write(self.system_path, state.model_dump())

    # ── Prompt compilation ────────────────────────────────────────────────────

    def compile_memory_prompt(self, target_file: str = "") -> str:
        """
        Returns a plain-text memory context block ready to inject into any prompt.
        Compatible with both raw string templates and LangChain message lists.
        """
        episodes: list[dict] = self._read(self.episodes_path, [])
        state    = SystemState(**self._read(self.system_path, {}))

        lines = ["\n=== SYSTEM AGENTIC MEMORY & REFLECTION ==="]

        if state.learned_rules:
            lines.append("Enforced Production Design Patterns:")
            for r in state.learned_rules[-5:]:
                lines.append(f"  - [RULE] {r}")

        fixed = [ep for ep in episodes if ep.get("status") == "fixed"]
        if fixed:
            lines.append("\nRecent Resolved Runtime Exceptions (do not repeat these):")
            for fx in fixed[-3:]:
                lines.append(f"  - Prior Error: {(fx.get('error') or '')[:120]}")
                lines.append(f"    Resolution : {fx.get('fix', '')}")

        if len(lines) == 1:
            return ""
        return "\n".join(lines) + "\n==========================================\n\n"

    def as_langchain_messages(self) -> list:
        """
        Returns memory context as a LangChain SystemMessage, ready to prepend
        to any ChatModel message list.
        """
        from langchain_core.messages import SystemMessage
        ctx = self.compile_memory_prompt()
        if not ctx:
            return []
        return [SystemMessage(content=ctx)]

    def summary(self) -> dict:
        episodes = self._read(self.episodes_path, [])
        state    = SystemState(**self._read(self.system_path, {}))
        return {
            "episodes":   len(episodes),
            "fixed":      sum(1 for e in episodes if e.get("status") == "fixed"),
            "failed":     sum(1 for e in episodes if e.get("status") == "failed"),
            "rules":      len(state.learned_rules),
            "components": len(state.successful_components),
        }