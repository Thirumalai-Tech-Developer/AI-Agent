import json
import difflib


def inline_fixer(path):

    with open(path, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    file_path = json_data["path"]

    with open(file_path, "r", encoding="utf-8") as f:
        original_lines = f.readlines()

    modified_lines = original_lines.copy()

    all_original_code = []
    all_modified_code = []
    all_errors = []

    for error in json_data["error"]:

        line_index = error["line"] - 1

        old_line = original_lines[line_index]

        indent = " " * error["intendation"]

        new_line = indent + error["replacement"] + "\n"

        modified_lines[line_index] = new_line

        all_original_code.append(old_line.strip())
        all_modified_code.append(new_line.strip())

        all_errors.append({
            "line": error.get("line"),
            "error": error.get("error", "Unknown error")
        })

    diff = difflib.unified_diff(
        original_lines,
        modified_lines,
        fromfile="before.py",
        tofile="after.py",
        lineterm=""
    )

    diff_text = "\n".join(list(diff))

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(modified_lines)

    return {
        "file_path": file_path,
        "original_code": all_original_code,
        "modified_code": all_modified_code,
        "diff_text": diff_text,
        "error": all_errors
    }