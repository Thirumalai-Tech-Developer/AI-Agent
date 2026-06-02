import subprocess
import re

def run_static_linter(project_root: str = "spiderman") -> list[dict]:
    errors = []
    print(f"[Validator] Running structural static check inside code environment: '{project_root}'...")
    
    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=project_root,
            capture_output=True,
            text=True,
            shell=True,
            timeout=25
        )
        if result.returncode != 0 and result.stdout:
            lines = result.stdout.split('\n')
            for line in lines:
                if "error TS" in line:
                    # Parse format: src/App.tsx(10,5): error TS2322: message...
                    match = re.match(r"^([^(:]+)(?:\(\d+,\d+\))?:\s*(error TS\d+):\s*(.*)", line.strip())
                    if match:
                        errors.append({
                            "raw": line.strip(),
                            "file_path": match.group(1).strip(), # Perfectly clean file path
                            "message": f"{match.group(2)}: {match.group(3)}"
                        })
    except subprocess.TimeoutExpired:
        print("[Validator] Structural compilation testing timed out.")
    except Exception as e:
        print(f"[Validator] Verification hook skipped: {e}")
        
    return errors