# utils/memory.py
import os
import json
from datetime import datetime

class AgenticMemory:
    def __init__(self, memory_dir: str = "outputs/memory"):
        self.memory_dir = memory_dir
        os.makedirs(self.memory_dir, exist_ok=True)
        self.episodes_path = os.path.join(self.memory_dir, "episodes.json")
        self.system_path = os.path.join(self.memory_dir, "system_state.json")
        
        if not os.path.exists(self.episodes_path):
            self._save_json(self.episodes_path, [])
        if not os.path.exists(self.system_path):
            self._save_json(self.system_path, {"learned_rules": [], "successful_components": []})

    def _save_json(self, path: str, data: dict | list):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def _load_json(self, path: str) -> dict | list:
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return [] if path.endswith("episodes.json") else {}

    def log_episode(self, stage: str, file_target: str, status: str, error_message: str = None, fix_applied: str = None):
        """Logs an evaluation loop episode and reflects on runtime changes."""
        episodes = self._load_json(self.episodes_path)
        episode = {
            "timestamp": datetime.now().isoformat(),
            "stage": stage,
            "target": file_target,
            "status": status,
            "error": error_message,
            "fix": fix_applied
        }
        episodes.append(episode)
        # Sliding history context window
        self._save_json(self.episodes_path, episodes[-15:])

    def learn_rule(self, rule: str):
        """Appends explicit procedural instructions into structural long-term memory."""
        state = self._load_json(self.system_path)
        if rule not in state.get("learned_rules", []):
            state.setdefault("learned_rules", []).append(rule)
            self._save_json(self.system_path, state)

    def compile_memory_prompt(self, target_file: str = "") -> str:
        """Assembles context-aware architectural rules based on past run executions."""
        episodes = self._load_json(self.episodes_path)
        state = self._load_json(self.system_path)
        
        lines = ["\n=== SYSTEM AGENTIC MEMORY & REFLECTION ==="]
        
        # Inject long-term compiled system guidelines
        rules = state.get("learned_rules", [])
        if rules:
            lines.append("Enforced Production Design Patterns:")
            for r in rules[-5:]:
                lines.append(f"  - [RULE] {r}")
                
        # Inject episodic history details matching the current active pipeline
        historical_fixes = [ep for ep in episodes if ep.get("status") == "fixed"]
        if historical_fixes:
            lines.append("\nRecent Resolved Runtime Exceptions (Do not repeat these structural flaws):")
            for fx in historical_fixes[-3:]:
                lines.append(f"  - Prior Error: {fx['error'][:120]}")
                lines.append(f"    Resolution Strategy Applied: {fx['fix']}")
                
        if len(lines) == 1:
            return ""
            
        return "\n".join(lines) + "\n==========================================\n\n"