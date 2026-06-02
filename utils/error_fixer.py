# utils/error_fixer.py
"""
Auto-fix pipeline:
  1. Capture SEVERE browser console errors (Selenium)
  2. Parse each error → file_path + error_message  (LLM)
  3. Read the broken file + generate fix steps      (LLM)
  4. Apply fix steps via assigner logic
"""

import json
import os
import time


# ── Step 1: Capture browser errors ────────────────────────────────────────────

def get_browser_errors(url: str = "http://localhost:5173") -> list[str]:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    driver = webdriver.Chrome(options=options)
    try:
        driver.get(url)
        time.sleep(2)  # let page settle
        logs = driver.get_log("browser")
        return [log["message"] for log in logs if log["level"] == "SEVERE"]
    finally:
        driver.quit()


# ── Step 2: Parse error → structured info ─────────────────────────────────────

def build_parse_prompt(raw_error: str) -> str:
    return f"""You are a frontend error parser. Output ONLY raw JSON — no markdown, no explanation.

Extract structured info from this browser console error.

RULES:
- file_path: starts from src/... — strip protocol, domain, query params, line/col numbers
- name: short error category — one of: lucide | shadcn | import | syntax | runtime | type | missing_export | other
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
{raw_error}"""


# ── Step 3: Generate fix steps ────────────────────────────────────────────────

# utils/error_fixer.py
import json
import os
import time
from utils.memory import AgenticMemory

# Modifying step 3 prompt generation hook to ingest memory strings
def build_fix_prompt(file_path: str, error_message: str, file_content: str, memory_context: str = "") -> str:
    safe_content = file_content.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")

    return f"""You are a senior frontend debugging engine. Output ONLY raw JSON — no markdown, no explanation.

{memory_context}TASK: Fix the error in the file below.
STACK: React + TypeScript + TailwindCSS + shadcn/ui + lucide-react

ERROR FILE : {file_path}
ERROR      : {error_message}

FILE CONTENT:
{safe_content}

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
- Never truncate code — always return the full file content"""


def apply_fix(fix_data: dict, project_root: str = "spiderman"):
    from utils.assigner import run_command, code_assigner

    steps = fix_data.get("steps", [])
    for step in steps:
        step_type   = step.get("type", "")
        target_file = step.get("target_file", "")
        code        = step.get("code", "")

        if step_type == "Terminal Command" and code.strip():
            run_command(["cmd", "/c", code], cwd=project_root)
        elif step_type in ("Code", "Configuration") and target_file and code.strip():
            code_assigner(f"{project_root}/{target_file}", code)


def run_auto_fix(
    call_llm,
    extract_json,
    url:          str = "http://localhost:5173",
    project_root: str = "spiderman",
    max_cycles:   int = 5,
    poll_interval: int = 3,
    memory: AgenticMemory = None
):
    print(f"\n[AutoFix] Watching {url} — max {max_cycles} cycles")
    os.makedirs("outputs/error", exist_ok=True)
    if memory is None:
        memory = AgenticMemory()

    cycle = 0
    while cycle < max_cycles:
        cycle += 1
        print(f"\n[AutoFix] Cycle {cycle}/{max_cycles} — capturing browser errors...")

        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        options = Options()
        options.add_argument("--headless")
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

        try:
            driver = webdriver.Chrome(options=options)
            driver.get(url)
            time.sleep(2)
            logs = driver.get_log("browser")
            errors = [log["message"] for log in logs if log["level"] == "SEVERE"]
            driver.quit()
        except Exception as e:
            print(f"[AutoFix] Selenium bridge unavailable: {e}")
            break

        if not errors:
            print("[AutoFix] No SEVERE production engine breaks. ✓")
            break

        print(f"[AutoFix] Found {len(errors)} runtime error(s).")
        for raw_error in errors:
            from utils.error_fixer import build_parse_prompt
            parse_raw = call_llm(build_parse_prompt(raw_error))
            parsed    = extract_json(parse_raw)

            if not parsed["success"]: continue
            info       = parsed["data"]
            file_path  = info.get("file_path")
            error_msg  = info.get("error", raw_error)
            error_name = info.get("name", "unknown")

            if not file_path: continue
            full_path = f"{project_root}/{file_path}"
            if not os.path.exists(full_path): continue

            with open(full_path, "r", encoding="utf-8") as f:
                file_content = f.read()

            # Compile memory patterns and stream to correction model
            mem_context = memory.compile_memory_prompt(target_file=file_path)
            fix_raw = call_llm(build_fix_prompt(file_path, error_msg, file_content, mem_context))
            fix     = extract_json(fix_raw)

            if fix["success"]:
                fix_data = fix["data"]
                apply_fix(fix_data, project_root=project_root)
                
                # Commit successes to long-term memory state
                memory.log_episode(
                    stage="autofix",
                    file_target=file_path,
                    status="fixed",
                    error_message=error_msg,
                    fix_applied=f"Resolved internal structural '{error_name}' failure inside {file_path}."
                )
                
                if error_name in ["lucide", "shadcn"]:
                    memory.learn_rule(f"Strict verification required for all imported UI modules under matching {error_name} structural sets.")
                print(f"[AutoFix] ✓ Ephemeral structural repair complete: {file_path}")
        time.sleep(poll_interval)