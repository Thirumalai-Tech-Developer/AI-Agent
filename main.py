import os
import json
import time
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

from utils import extractor
from utils.executor import step_execute
from utils.planner import planner
from utils.json import extract_json
from utils.key_router import with_key_rotation, _router
from utils.error_fixer import run_auto_fix
from utils.assigner import run_task

load_dotenv()

PLAN_PATH = "outputs/plan"
STEP_PATH = "outputs/step"
MAX_WORKERS = 4


# ── Raw provider calls ─────────────────────────────────────────────────────────

def _call_groq_raw(api_key: str, prompt: str, model: str) -> str:
    from groq import Groq
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a strict JSON generator. Always return valid JSON only."},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.6, top_p=1, stream=True,
    )
    full_output = ""
    for chunk in completion:
        token = chunk.choices[0].delta.content or ""
        print(token, end="", flush=True)
        full_output += token
    print()
    return full_output


def _call_gemini_raw(api_key: str, prompt: str, model: str) -> str:
    from google import genai
    from google.genai.types import GenerateContentConfig
    client = genai.Client(api_key=api_key)
    stream = client.models.generate_content_stream(
        model=model,
        contents=prompt,
        config=GenerateContentConfig(
            system_instruction="You are a strict JSON generator. Always return valid JSON only."
        )
    )
    full_output = ""
    for chunk in stream:
        token = chunk.text or ""
        print(token, end="", flush=True)
        full_output += token
    print()
    return full_output


def _call_cerebras_raw(api_key: str, prompt: str, model: str) -> str:
    from cerebras.cloud.sdk import Cerebras
    client = Cerebras(api_key=api_key)
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a strict JSON generator. Always return valid JSON only."},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.6, stream=True,
    )
    full_output = ""
    for chunk in completion:
        token = chunk.choices[0].delta.content or ""
        print(token, end="", flush=True)
        full_output += token
    print()
    return full_output


def _call_openrouter_raw(api_key: str, prompt: str, model: str) -> str:
    from openai import OpenAI
    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a strict JSON generator. Always return valid JSON only."},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.6, stream=True,
    )
    full_output = ""
    for chunk in completion:
        token = chunk.choices[0].delta.content or ""
        print(token, end="", flush=True)
        full_output += token
    print()
    return full_output


# ── Public calls with key rotation ────────────────────────────────────────────

def call_groq(prompt: str, model: str = "meta-llama/llama-4-scout-17b-16e-instruct") -> str:
    return with_key_rotation("groq", _call_groq_raw, prompt, model=model)

def call_gemini(prompt: str, model: str = "gemini-3.5-flash") -> str:
    return with_key_rotation("gemini", _call_gemini_raw, prompt, model=model)

def call_cerebras(prompt: str, model: str = "zai-glm-4.7") -> str:
    return with_key_rotation("cerebras", _call_cerebras_raw, prompt, model=model)

def call_openrouter(prompt: str, model: str = "openai/gpt-oss-120b:free") -> str:
    return with_key_rotation("openrouter", _call_openrouter_raw, prompt, model=model)


PROVIDERS = {
    "groq":       call_groq,
    "gemini":     call_gemini,
    "cerebras":   call_cerebras,
    "openrouter": call_openrouter,
}

def call_llm(prompt: str, provider: str = "gemini") -> str:
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider '{provider}'. Choose from: {list(PROVIDERS)}")
    print(f"\n[LLM] Provider: {provider}  |  {_router.status(provider)}")
    return PROVIDERS[provider](prompt)


# ── Save helpers ───────────────────────────────────────────────────────────────

def save_json(path: str, raw_output: str, label: str = "") -> dict | None:
    result = extract_json(raw_output)
    if not result["success"]:
        print(f"[save] Parse failed {label}: {result.get('error')}")
        with open(f"debug_{label}_raw.txt", "w", encoding="utf-8") as f:
            f.write(raw_output)
        return None
    data = result["data"]
    print(f"[save] Parsed via: {result['method']}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"[save] Saved: {path}")
    return data


# ── Template Initialization ────────────────────────────────────────────────────

def setup_template(template_path: str, destination: str) -> None:
    print("\n" + "="*60)
    print("  STAGE 0: TEMPLATE INITIALIZATION")
    print("="*60)
    
    if not os.path.exists(template_path):
        print(f"[setup] WARNING: Template path '{template_path}' does not exist. Skipping.")
        return
        
    print(f"[setup] Copying '{template_path}' to '{destination}'...")
    try:
        shutil.copytree(template_path, destination, dirs_exist_ok=True)
        print("[setup] ✓ Template copied successfully.")
    except Exception as e:
        print(f"[setup] ✗ Error copying template: {e}")


# ── Context builder ────────────────────────────────────────────────────────────

def _build_step_context(step: dict, plan: dict, is_app_step: bool) -> str:
    styling  = plan["config"]["styling"]
    meta     = plan.get("meta", {})
    registry = meta.get("component_registry", [])
    router   = meta.get("router", "wouter")

    lines = [
        "=== STEP ===",
        json.dumps(step, indent=2),
        "",
        "=== STYLING ===",
        f"styling_name : {styling.get('styling_name', [])}",
        f"gradients    : {json.dumps(styling.get('gradients', {}))}",
        "",
    ]

    if is_app_step:
        lines += [
            "=== APP COMPOSITION (App.tsx only) ===",
            f"router : {router}",
            f"entry  : {meta.get('entry_file', 'src/App.tsx')}",
            "",
            "Import and route ALL components below:",
        ]
        for comp in registry:
            route    = comp.get("route") or "null"
            ctype    = comp.get("type", "")
            nav_l    = comp.get("nav_links", [])
            foot_l   = comp.get("footer_links", [])
            sections = comp.get("sections", [])
            lines.append(
                f"  - {comp['name']} | file: {comp['filename']} "
                f"| export: {comp.get('export_default', comp['name'])} "
                f"| id: {comp.get('id','')} | route: {route} | type: {ctype}"
            )
            if nav_l:   lines.append(f"    nav_links   : {json.dumps(nav_l)}")
            if foot_l:  lines.append(f"    footer_links: {json.dumps(foot_l)}")
            if sections: lines.append(f"    sections    : {json.dumps(sections)}")
        lines += [
            "",
            "RULES:",
            "- persistent (Navbar/Footer) → render OUTSIDE <Switch>",
            "- page type → render inside <Route path=route>",
            "- Navbar anchor links → <a href='#id'>, page links → <Link href='/route'>",
            "- Footer quick links mirror same ids/routes",
            "- Never recreate components — only import and route",
            "- export default App",
        ]
    else:
        lines += ["=== COMPONENT REGISTRY ==="]
        for comp in registry:
            sections = comp.get("sections", [])
            sec_str = f" | sections: {[s['id'] for s in sections]}" if sections else ""
            lines.append(
                f"  - {comp['name']} → {comp['filename']} "
                f"| id: {comp.get('id','')} | route: {comp.get('route') or 'null'}{sec_str}"
            )

    return "\n".join(lines)


def _is_app_step(step: dict) -> bool:
    name   = step.get("name", "").lower()
    inputs = step.get("input", [])
    files  = [i.get("filename", "") for i in inputs]
    return (
        "app" in name
        or any("App.tsx" in f for f in files)
        or any(f.lower().endswith("app.tsx") for f in files)
    )


# ── Single step worker ─────────────────────────────────────────────────────────

def _run_step(i: int, step: dict, plan: dict, provider: str) -> tuple[int, dict | None]:
    is_app  = _is_app_step(step)
    context = _build_step_context(step, plan, is_app_step=is_app)
    prompt  = step_execute(context)
    tag     = f"[Step {i+1}{'  APP' if is_app else ''}]"

    print(f"\n{tag} Starting: {step.get('name', '')}")
    try:
        raw  = call_llm(prompt, provider=provider)
        data = save_json(f"{STEP_PATH}/{i}.json", raw, label=f"step_{i}")
        print(f"{tag} {'✓ Done' if data else '✗ Parse failed'}")
        return i, data
    except Exception as e:
        print(f"{tag} ✗ Error: {e}")
        return i, None


# ── Stage 1: Planning ──────────────────────────────────────────────────────────

def run_planner(
    task: str,
    provider: str = "gemini",
    attachment_path: str = None,
    output_file: str = "outputs/plan/plan.json",
) -> dict | None:
    print("\n" + "="*60)
    print("  STAGE 1: PLANNING")
    print("="*60)

    if attachment_path:
        task += f"\n\nAttachment context:\n{extractor.extract_text_from_pdf(attachment_path)}"

    raw = call_llm(planner(task), provider=provider)
    print("\n##### PLANNER DONE ######")
    return save_json(output_file, raw, label="plan")


# ── Stage 2: Parallel execution ────────────────────────────────────────────────

def run_executor(
    plan_file: str   = "outputs/plan/plan.json",
    provider: str    = "gemini",
    max_workers: int = MAX_WORKERS,
) -> None:
    print("\n" + "="*60)
    print("  STAGE 2: EXECUTION (parallel)")
    print("="*60)

    with open(plan_file, "r") as f:
        plan = json.load(f)

    steps       = plan.get("steps", [])
    total_steps = plan.get("total_steps", len(steps))

    app_indices    = [i for i, s in enumerate(steps) if _is_app_step(s)]
    normal_indices = [i for i in range(len(steps)) if i not in app_indices]

    print(f"Total: {total_steps}  |  Parallel: {len(normal_indices)}  |  App: {len(app_indices)}  |  Workers: {max_workers}")

    t_start = time.time()
    results = {}

    if normal_indices:
        print(f"\n── Parallel batch ──")
        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {pool.submit(_run_step, i, steps[i], plan, provider): i for i in normal_indices}
            for future in as_completed(futures):
                idx, data = future.result()
                results[idx] = data

    if app_indices:
        print(f"\n── App composition ──")
        for i in app_indices:
            idx, data = _run_step(i, steps[i], plan, provider)
            results[idx] = data

    elapsed = time.time() - t_start
    passed  = sum(1 for d in results.values() if d is not None)
    print(f"\n{'='*60}")
    print(f"  Done in {elapsed:.1f}s  |  ✓ {passed}  |  ✗ {total_steps - passed}")
    print(f"  Key status: {_router.status(provider)}")
    print("="*60)

# ── Stage 2.5: Code Assignment ─────────────────────────────────────────────────

def run_assigner(project_root: str = "spiderman", step_dir: str = STEP_PATH, max_workers: int = MAX_WORKERS):
    print("\n" + "="*60)
    print("  STAGE 2.5: CODE & FILE ASSIGNMENT")
    print("="*60)

    # Check if the folder exists before scanning it
    if not os.path.exists(step_dir):
        print(f"[assigner] ✗ Cannot find step directory: {step_dir}")
        return

    # FIX 1: Count the JSON step files directly instead of relying on an undefined 'plan' dict
    step_files = [f for f in os.listdir(step_dir) if f.endswith('.json')]
    total_tasks = len(step_files)
    
    if total_tasks == 0:
        print(f"[assigner] No tasks found in {step_dir}.")
        return

    print(f"Total tasks to assign: {total_tasks} | Workers: {max_workers}\n")

    t_start = time.time()
    results = []

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        # FIX 2: Pass project_root into run_task so it writes to your custom folder
        futures = {pool.submit(run_task, i, total_tasks, project_root): i for i in range(total_tasks)}
        
        for future in as_completed(futures):
            try:
                idx, success = future.result()
                results.append(success)
            except Exception as e:
                print(f"[assigner] ✗ Unhandled exception in task thread: {e}")
                results.append(False)

    elapsed = time.time() - t_start
    passed = sum(1 for r in results if r)
    print(f"\n{'='*60}")
    print(f"  Assignment done in {elapsed:.1f}s  |  ✓ {passed}  |  ✗ {total_tasks - passed}")
    print("="*60)

# ── Stage 3: Auto-fix loop ─────────────────────────────────────────────────────

def run_fixer(
    provider: str    = "gemini",
    url: str         = "http://localhost:5173",
    project_root: str = "spiderman",
    max_cycles: int  = 5,
):
    print("\n" + "="*60)
    print("  STAGE 3: AUTO-FIX")
    print("="*60)
    run_auto_fix(
        call_llm     = lambda prompt: call_llm(prompt, provider=provider),
        extract_json = extract_json,
        url          = url,
        project_root = project_root,
        max_cycles   = max_cycles,
    )


# ── Full pipeline ──────────────────────────────────────────────────────────────

MODES = ("scratch", "build", "assigner", "fix")

def run_pipeline(
    task: str,
    mode: str            = "scratch",
    provider: str        = "gemini",
    attachment_path: str = None,
    plan_file: str       = "outputs/plan/plan.json",
    max_workers: int     = MAX_WORKERS,
    fix_cycles: int      = 5,
    project_root: str    = "spiderman",
    template_path: str   = "template/web"
):
    """
    mode = "scratch"   →  Plan + Build LLM Outputs + Assign Code
    mode = "build"     →  Build LLM Outputs + Assign Code (Reuses existing plan.json)
    mode = "assigner"  →  Assign Code only (Reuses existing plan.json & step.json files)
    mode = "fix"       →  Run auto-fix loop only on existing project
    """
    if mode not in MODES:
        raise ValueError(f"Invalid mode '{mode}'. Choose from: {MODES}")

    print(f"\n[pipeline] Mode: {mode.upper()}  |  Provider: {provider}")

    # Copy template for everything except fix mode
    if mode in ("scratch", "build", "assigner"):
        setup_template(template_path, project_root)

    if mode == "scratch":
        plan = run_planner(task, provider=provider, attachment_path=attachment_path, output_file=plan_file)
        if plan is None:
            print("[ERROR] Planning failed — aborting.")
            return
        run_executor(plan_file=plan_file, provider=provider, max_workers=max_workers)
        run_assigner(plan_file=plan_file, max_workers=max_workers)

    elif mode == "build":
        print(f"[pipeline] Reusing plan: {plan_file}")
        run_executor(plan_file=plan_file, provider=provider, max_workers=max_workers)
        run_assigner(plan_file=plan_file, max_workers=max_workers)

    elif mode == "assigner":
        print(f"[pipeline] Skipping LLM execution. Directly building code from JSON step files...")
        run_assigner(project_root=project_root, step_dir="outputs/step", max_workers=max_workers)

    elif mode == "fix":
        print(f"[pipeline] Running auto-fixer only.")
        run_fixer(provider=provider, max_cycles=fix_cycles, project_root=project_root)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    run_pipeline(
        task="create a stunning spiderman website. web marquee and modern theme. "
             "separate pages with proper routing.",
        provider="cerebras", 
        mode="assigner",   # "scratch" | "build" | "assigner" | "fix"
        max_workers=4,
        fix_cycles=5,
        project_root="spider",   
        template_path="template/web" 
    )