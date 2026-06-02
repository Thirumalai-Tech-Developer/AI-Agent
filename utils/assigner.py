import os
import subprocess
import json
import time


VALID_SHADCN = {
    'accordion','alert','alert-dialog','aspect-ratio','avatar','badge','breadcrumb',
    'button','calendar','card','carousel','chart','checkbox','collapsible','command',
    'context-menu','dialog','drawer','dropdown-menu','form','hover-card','input',
    'input-otp','label','menubar','navigation-menu','pagination','popover','progress',
    'radio-group','resizable','scroll-area','select','separator','sheet','sidebar',
    'skeleton','slider','sonner','switch','table','tabs','textarea','toast','toggle',
    'toggle-group','tooltip'
}

MAX_WORKERS = 4  # tune to your CPU / number of components


# ── Helpers ────────────────────────────────────────────────────────────────────

def load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    while isinstance(data, list):
        if not data:
            raise ValueError(f"Empty list in: {path}")
        data = data[0]
    if isinstance(data, dict) and "steps" not in data and "total_steps" not in data:
        for key in ("result", "output", "data", "plan", "response"):
            if key in data and isinstance(data[key], dict):
                data = data[key]
                break
    if not isinstance(data, dict):
        raise ValueError(f"Could not extract dict from: {path}")
    return data


def sanitize_shadcn_command(command_str: str) -> str:
    if 'shadcn' not in command_str or ' add ' not in command_str:
        return command_str
    parts = command_str.split()
    try:
        add_idx = parts.index('add')
    except ValueError:
        return command_str
    prefix    = parts[:add_idx + 1]
    requested = parts[add_idx + 1:]
    valid   = [p for p in requested if p in VALID_SHADCN]
    invalid = [p for p in requested if p not in VALID_SHADCN and not p.startswith('-')]
    if invalid:
        print(f"[shadcn] Skipping unknown: {invalid}")
    if not valid:
        print("[shadcn] No valid components — skipping.")
        return ""
    return ' '.join(prefix + ['--yes'] + valid)


def run_command(command, cwd=None, input_text=None):
    if isinstance(command, list) and len(command) >= 3:
        sanitized = sanitize_shadcn_command(command[-1])
        if not sanitized:
            print("[run_command] Skipped.")
            return
        command = command[:-1] + [sanitized]
    process = subprocess.Popen(
        command, cwd=cwd,
        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT, text=True, shell=False,
    )
    try:
        output, _ = process.communicate(input=input_text, timeout=60)
        print(output, end="")
    except subprocess.TimeoutExpired:
        print("\n[WARNING] Timed out.")
        for i in range(5, 0, -1):
            print(f"Killing in {i}...", end="\r")
            time.sleep(1)
        process.kill()
        process.communicate()
        raise Exception(f"Timed out: {' '.join(command)}")
    print(f"\nExit Code: {process.returncode}")
    if process.returncode != 0:
        raise Exception(f"Command failed: {' '.join(command)}")


def code_assigner(file_path: str, code: str):
    code = code.replace("\\n", "\n").replace('\\"', '"')
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"  Written: {file_path}")
    except Exception as e:
        print(f"  Error writing {file_path}: {e}")


# ── Task runner (one full task = one step file, runs in a thread) ──────────────

def run_task(i: int, total_tasks: int, project_root: str = "spiderman") -> tuple[int, bool]:
    """
    Execute all steps inside outputs/step/{i}.json sequentially.
    Steps within a task MUST stay sequential (deps → files → code order).
    Safe to run in parallel with other tasks since each writes different files.
    Returns (i, success).
    """
    step_file = f"outputs/step/{i}.json"
    tag = f"[Task {i+1}/{total_tasks}]"

    try:
        task_data = load_json(step_file)
    except Exception as e:
        print(f"{tag} ERROR loading {step_file}: {e}")
        return i, False

    steps       = task_data.get("steps", [])
    total_steps = task_data.get("total_steps", len(steps))

    if not steps:
        print(f"{tag} No steps found — skipping.")
        return i, False

    print(f"\n{'='*50}")
    print(f"{tag} {total_steps} steps")
    print(f"{'='*50}")

    for j, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            print(f"{tag} Step {j}: invalid format — skipping.")
            continue

        step_type   = step.get("type", "")
        target_file = step.get("target_file", "")
        code        = step.get("code", "")
        title       = step.get("title", "")

        print(f"\n{tag} Step {j}/{total_steps}: [{step_type}] {title}")

        try:
            if step_type == "Terminal Command":
                if code.strip():
                    # Dynamic directory context for the command execution
                    run_command(["cmd", "/c", code], cwd=project_root)
                else:
                    print(f"{tag} [SKIP] Empty command.")

            elif step_type == "File Creation":
                if target_file:
                    # Dynamically routes the file path based on project root
                    full_path = os.path.join(project_root, target_file)
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    with open(full_path, "w", encoding="utf-8") as f:
                        pass
                    print(f"{tag} Created: {full_path}")

            else:  # Code / Configuration
                if target_file and code.strip():
                    # Dynamically routes the target write directory
                    full_path = os.path.join(project_root, target_file)
                    code_assigner(full_path, code)
                else:
                    print(f"{tag} [SKIP] Missing target_file or code.")

        except Exception as e:
            print(f"{tag} Step {j} failed: {e} — continuing.")
            continue

        print(f"{tag} Step {j} complete.")

    print(f"\n{tag} All steps done.")
    return i, True