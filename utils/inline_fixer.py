import json
import difflib

def inline_fixer(path):

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    file_path = data["path"]

    with open(file_path, "r", encoding="utf-8") as f:
        original_lines = f.readlines()

    modified_lines = original_lines.copy()

    line_index = data["line"] - 1

    old_line = original_lines[line_index]

    indent = " " * data["intendation"]

    modified_lines[line_index] = (
        indent + data["replacement"] + "\n"
    )

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
        "original_code": old_line.strip(),
        "modified_code": modified_lines[line_index].strip(),
        "diff_text": diff_text,
        "error": data["error"]
    }