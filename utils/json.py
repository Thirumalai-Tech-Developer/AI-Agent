import json
import re
import dirtyjson
from json_repair import repair_json


def _strip_fences(text: str) -> str:
    m = re.search(
        r"```(?:json)?\s*(.*?)\s*```",
        text,
        re.DOTALL | re.IGNORECASE,
    )
    return m.group(1) if m else text


def _protect_code_blocks(text: str):
    """
    Replace code field contents temporarily so repair libraries
    don't destroy TSX/JSX syntax.
    """

    placeholders = {}

    pattern = re.compile(
        r'"code"\s*:\s*"((?:\\.|[^"\\])*)"',
        re.DOTALL,
    )

    idx = 0

    def repl(match):
        nonlocal idx

        raw = match.group(1)

        key = f"__CODE_BLOCK_{idx}__"
        idx += 1

        placeholders[key] = raw

        return f'"code":"{key}"'

    protected = pattern.sub(repl, text)

    return protected, placeholders


def _restore_code_blocks(data, placeholders):
    """
    Restore original code safely after JSON parsing.
    """

    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, str) and v in placeholders:
                data[k] = placeholders[v]
            else:
                _restore_code_blocks(v, placeholders)

    elif isinstance(data, list):
        for item in data:
            _restore_code_blocks(item, placeholders)

    return data


def extract_json(text: str) -> dict:

    if not text or not text.strip():
        return {
            "success": False,
            "data": "empty_input",
        }

    stripped = _strip_fences(text.strip())

    # Protect code field before repair
    protected, placeholders = _protect_code_blocks(stripped)

    candidates = []

    # raw
    candidates.append(("json_raw", protected))
    candidates.append(("dirty_raw", protected))

    # repaired
    try:
        repaired = repair_json(protected)
        candidates.append(("json_repaired", repaired))
        candidates.append(("dirty_repaired", repaired))
    except Exception:
        pass

    for method, candidate in candidates:

        try:

            if "dirty" in method:
                parsed = dirtyjson.loads(candidate)
            else:
                parsed = json.loads(candidate)

            # normalize
            data = json.loads(json.dumps(parsed))

            # restore original TSX/code
            data = _restore_code_blocks(data, placeholders)

            return {
                "success": True,
                "method": method,
                "data": data,
            }

        except Exception:
            continue

    return {
        "success": False,
        "error": "unable_to_parse",
        "raw": text,
    }


class JSONRepair:
    def repair(self, text: str) -> str:
        result = extract_json(text)

        if result["success"]:
            return json.dumps(
                result["data"],
                ensure_ascii=False,
                indent=2,
            )

        return repair_json(text)