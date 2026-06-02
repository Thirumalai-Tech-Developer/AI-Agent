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

def build_fix_prompt(file_path: str, error_message: str, file_content: str) -> str:
    # Escape the file content so it's safe inside the prompt
    safe_content = file_content.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")

    return f"""You are a senior frontend debugging engine. Output ONLY raw JSON — no markdown, no explanation.

TASK: Fix the error in the file below.
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
- For syntax errors: fix the broken syntax and return full file
- Never truncate code — always return the full file content"""


# ── Step 4: Apply fix steps ────────────────────────────────────────────────────

def apply_fix(fix_data: dict, project_root: str = "spiderman"):
    from utils.assigner import run_command, code_assigner

    steps = fix_data.get("steps", [])
    for step in steps:
        step_type   = step.get("type", "")
        target_file = step.get("target_file", "")
        code        = step.get("code", "")

        if step_type == "Terminal Command":
            if code.strip():
                run_command(["cmd", "/c", code], cwd=project_root)

        elif step_type in ("Code", "Configuration"):
            if target_file and code.strip():
                code_assigner(f"{project_root}/{target_file}", code)


# ── Main auto-fix loop ─────────────────────────────────────────────────────────

def run_auto_fix(
    call_llm,
    extract_json,
    url:          str = "http://localhost:5173",
    project_root: str = "spiderman",
    max_cycles:   int = 5,
    poll_interval: int = 3,
):
    """
    Continuously poll the browser for SEVERE errors and auto-fix them.

    Args:
        call_llm      : callable(prompt) → str  — your call_gemini / call_groq etc.
        extract_json  : callable(raw)    → dict — your extract_json function
        url           : Vite dev server URL
        project_root  : local project folder
        max_cycles    : stop after this many fix attempts (prevents infinite loop)
        poll_interval : seconds between polls
    """
    print(f"\n[AutoFix] Watching {url} — max {max_cycles} cycles")
    os.makedirs("outputs/error", exist_ok=True)

    cycle = 0

    while cycle < max_cycles:
        cycle += 1
        print(f"\n[AutoFix] Cycle {cycle}/{max_cycles} — capturing browser errors...")

        try:
            errors = get_browser_errors(url)
        except Exception as e:
            print(f"[AutoFix] Selenium error: {e}")
            time.sleep(poll_interval)
            continue

        if not errors:
            print("[AutoFix] No SEVERE errors. ✓")
            time.sleep(poll_interval)
            continue

        print(f"[AutoFix] Found {len(errors)} error(s).")
        fixed_any = False

        for raw_error in errors:
            print(f"\n[AutoFix] Error: {raw_error[:120]}...")

            # Step 2 — parse error
            parse_raw = call_llm(build_parse_prompt(raw_error))
            parsed    = extract_json(parse_raw)

            if not parsed["success"]:
                print("[AutoFix] Could not parse error info — skipping.")
                continue

            info       = parsed["data"]
            file_path  = info.get("file_path")
            error_msg  = info.get("error", raw_error)
            error_name = info.get("name", "unknown")

            print(f"[AutoFix] Category : {error_name}")
            print(f"[AutoFix] File     : {file_path}")
            print(f"[AutoFix] Message  : {error_msg[:100]}")

            if not file_path:
                print("[AutoFix] No file path — skipping.")
                continue

            full_path = f"{project_root}/{file_path}"
            if not os.path.exists(full_path):
                print(f"[AutoFix] File not found: {full_path} — skipping.")
                continue

            # Step 3 — generate fix
            with open(full_path, "r", encoding="utf-8") as f:
                file_content = f.read()

            fix_raw = call_llm(build_fix_prompt(file_path, error_msg, file_content))
            fix     = extract_json(fix_raw)

            if not fix["success"]:
                print("[AutoFix] Could not parse fix — skipping.")
                continue

            fix_data = fix["data"]

            # Save fix for debugging
            with open(f"outputs/error/{error_name}_{cycle}.json", "w", encoding="utf-8") as f:
                json.dump(fix_data, f, indent=2)

            # Step 4 — apply fix
            print(f"[AutoFix] Applying fix for {file_path}...")
            apply_fix(fix_data, project_root=project_root)
            fixed_any = True
            print(f"[AutoFix] ✓ Fix applied for {file_path}")

        if not fixed_any:
            print("[AutoFix] No fixable errors found this cycle.")

        time.sleep(poll_interval)

    print(f"\n[AutoFix] Reached max cycles ({max_cycles}). Stopping.")