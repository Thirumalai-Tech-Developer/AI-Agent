# utils/error_fixer.py
"""
v2 — Auto-fix pipeline using LangChain chains.

Pipeline per browser error:
  1. Capture SEVERE browser console errors (Selenium)
  2. Parse each error → structured info  (LangChain chain)
  3. Read broken file + generate fix steps (LangChain chain + Memory)
  4. Apply fix steps via assigner
"""

from __future__ import annotations

import os
import time

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from utils.memory import AgenticMemory
from utils.json_utils import extract_json


# ── Prompt templates ──────────────────────────────────────────────────────────

_PARSE_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", "You are a frontend error parser. Output ONLY raw JSON — no markdown, no explanation."),
    ("human", """Extract structured info from this browser console error.

RULES:
- file_path: starts from src/... — strip protocol, domain, query params, line/col numbers
- name: one of: lucide | shadcn | import | syntax | runtime | type | missing_export | other
- error: the actual error message only — no URLs, no line numbers

OUTPUT SCHEMA:
{{
  "file_path": "src/components/Footer.tsx",
  "name": "lucide",
  "error": "Uncaught SyntaxError: does not provide an export named 'Github'"
}}

If no file path found → "file_path": null
If no clear message → "error": copy original input

INPUT:
{raw_error}"""),
])

_FIX_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", "You are a senior frontend debugging engine. Output ONLY raw JSON — no markdown, no explanation."),
    ("human", """{memory_context}TASK: Fix the error in the file below.
STACK: React + TypeScript + TailwindCSS + shadcn/ui + lucide-react

ERROR FILE : {file_path}
ERROR      : {error_message}

FILE CONTENT:
{file_content}

OUTPUT SCHEMA:
{{
  "task": "string",
  "total_steps": number,
  "steps": [
    {{
      "step": number,
      "title": "string",
      "type": "Terminal Command | Code | Configuration",
      "purpose": "string",
      "target_file": "string",
      "dependencies": [],
      "code": "full corrected code string"
    }}
  ]
}}

RULES:
- Output the COMPLETE corrected file in the Code step — not just the diff
- For lucide errors: replace missing icon with a valid lucide-react export
- For missing shadcn: add the correct import path from @/components/ui/...
- Never truncate code — always return the full file content"""),
])


# ── Chain builders ────────────────────────────────────────────────────────────

def _make_parse_chain(llm):
    """LangChain chain: raw error string → ParseResult JSON string."""
    return _PARSE_TEMPLATE | llm | StrOutputParser()


def _make_fix_chain(llm):
    """LangChain chain: file info + memory → fix plan JSON string."""
    return _FIX_TEMPLATE | llm | StrOutputParser()


# ── Apply fixes ───────────────────────────────────────────────────────────────

def _apply_fix(fix_data: dict, project_root: str = "spiderman") -> None:
    from utils.assigner import run_command, code_assigner
    for step in fix_data.get("steps", []):
        stype  = step.get("type", "")
        target = step.get("target_file", "")
        code   = step.get("code", "")
        if stype == "Terminal Command" and code.strip():
            run_command(["cmd", "/c", code], cwd=project_root)
        elif stype in ("Code", "Configuration") and target and code.strip():
            code_assigner(f"{project_root}/{target}", code)


# ── Main auto-fix loop ────────────────────────────────────────────────────────

def run_auto_fix(
    llm,                          # Any LangChain BaseChatModel
    url:          str = "http://localhost:5173",
    project_root: str = "spiderman",
    max_cycles:   int = 5,
    poll_interval: int = 3,
    memory:       AgenticMemory | None = None,
) -> None:
    """
    Watch `url` for SEVERE browser errors and auto-fix them using LangChain chains.

    Args:
        llm:          Instantiated LangChain chat model (e.g. ChatGroq, ChatGoogleGenerativeAI).
        url:          Dev server URL to watch.
        project_root: Root folder of the target project.
        max_cycles:   Maximum fix iterations.
        poll_interval: Seconds to wait between captures.
        memory:       AgenticMemory instance for rule learning / context injection.
    """
    print(f"\n[AutoFix] Watching {url} — max {max_cycles} cycles")
    os.makedirs("outputs/error", exist_ok=True)

    if memory is None:
        memory = AgenticMemory()

    parse_chain = _make_parse_chain(llm)
    fix_chain   = _make_fix_chain(llm)

    for cycle in range(1, max_cycles + 1):
        print(f"\n[AutoFix] Cycle {cycle}/{max_cycles} — capturing browser errors...")

        # ── Capture errors ────────────────────────────────────────────────────
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            opts = Options()
            opts.add_argument("--headless")
            opts.add_argument("--no-sandbox")
            opts.add_argument("--disable-dev-shm-usage")
            opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
            driver = webdriver.Chrome(options=opts)
            driver.get(url)
            time.sleep(2)
            logs   = driver.get_log("browser")
            errors = [log["message"] for log in logs if log["level"] == "SEVERE"]
            driver.quit()
        except Exception as e:
            print(f"[AutoFix] Selenium bridge unavailable: {e}")
            break

        if not errors:
            print("[AutoFix] No SEVERE errors. ✓")
            break

        print(f"[AutoFix] Found {len(errors)} runtime error(s).")

        for raw_error in errors:
            # ── Parse ─────────────────────────────────────────────────────────
            parse_raw = parse_chain.invoke({"raw_error": raw_error})
            parsed    = extract_json(parse_raw)
            if not parsed.success:
                continue

            info       = parsed.data
            file_path  = info.get("file_path")
            error_msg  = info.get("error", raw_error)
            error_name = info.get("name", "unknown")

            if not file_path:
                continue
            full_path = f"{project_root}/{file_path}"
            if not os.path.exists(full_path):
                continue

            with open(full_path, "r", encoding="utf-8") as f:
                file_content = f.read()

            # ── Fix ───────────────────────────────────────────────────────────
            mem_context = memory.compile_memory_prompt(target_file=file_path)
            fix_raw = fix_chain.invoke({
                "memory_context": mem_context,
                "file_path":      file_path,
                "error_message":  error_msg,
                "file_content":   file_content,
            })
            fix = extract_json(fix_raw)

            if fix.success:
                _apply_fix(fix.data, project_root=project_root)

                memory.log_episode(
                    stage="autofix",
                    file_target=file_path,
                    status="fixed",
                    error_message=error_msg,
                    fix_applied=f"Resolved '{error_name}' failure in {file_path}.",
                )
                if error_name in ("lucide", "shadcn"):
                    memory.learn_rule(
                        f"Strict verification required for all imported UI modules under '{error_name}'."
                    )
                print(f"[AutoFix] ✓ Fixed: {file_path}")

        time.sleep(poll_interval)