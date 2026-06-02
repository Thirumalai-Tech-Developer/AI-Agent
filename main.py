import os
import json
import time
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
import subprocess
import webbrowser

from utils import extractor
from utils.executor import step_execute
from utils.planner import planner
from utils.json import extract_json
from utils.key_router import with_key_rotation, _router
from utils.error_fixer import run_auto_fix
from utils.assigner import run_task, code_assigner
from utils.memory import AgenticMemory
from utils.validator import run_static_linter

load_dotenv()

PLAN_PATH = "outputs/plan"
STEP_PATH = "outputs/step"
MAX_WORKERS = 4

# ── Dataset Distillation Logger ───────────────────────────────────────────────

def log_to_dataset(prompt: str, response: str, provider: str):
    """Appends session I/O to a JSONL dataset for future AI training."""
    dataset_dir = "outputs/dataset"
    os.makedirs(dataset_dir, exist_ok=True)
    file_path = os.path.join(dataset_dir, "distilled_sessions.jsonl")
    
    record = {
        "timestamp": time.time(),
        "provider": provider,
        "prompt": prompt,
        "response": response
    }
    
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")

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
    log_to_dataset(prompt, full_output, "groq")
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
    log_to_dataset(prompt, full_output, "gemini")
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
    log_to_dataset(prompt, full_output, "cerebras")
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
    log_to_dataset(prompt, full_output, "openrouter")
    return full_output

def global_css(project_root: str, plan_path: str) -> None:
    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)
        
    # Default to an empty string instead of an empty dict {}
    styling = plan["config"]["styling"]
    
    # Defensive check: if the LLM still generated global_css as a dictionary/object
    if isinstance(styling, dict):
        if "global_css" in styling:
            styling = styling["global_css"]
        elif "code" in styling:
            styling = styling["code"]
        elif not styling:
            styling = ""
        else:
            assert False, f"Unexpected styling format: {styling}"
            
    css_path = f"{project_root}/src/index.css"
    code_assigner(css_path, styling)

# ── Public calls with key rotation ────────────────────────────────────────────

def call_groq(prompt: str, model: str = "meta-llama/llama-4-scout-17b-16e-instruct") -> str:
    return with_key_rotation("groq", _call_groq_raw, prompt, model=model)

def call_gemini(prompt: str, model: str = "gemini-3-flash-preview") -> str:
    return with_key_rotation("gemini", _call_gemini_raw, prompt, model=model)

def call_cerebras(prompt: str, model: str = "zai-glm-4.7") -> str:
    return with_key_rotation("cerebras", _call_cerebras_raw, prompt, model=model)

def call_openrouter(prompt: str, model: str = "openai/gpt-oss-120b:free") -> str:
    return with_key_rotation("openrouter", _call_openrouter_raw, prompt, model=model)

PROVIDERS = {
    "groq":       lambda p: with_key_rotation("groq", _call_groq_raw, p, "meta-llama/llama-4-scout-17b-16e-instruct"),
    "gemini":     lambda p: with_key_rotation("gemini", _call_gemini_raw, p, "gemini-3.5-flash"),
    "cerebras":   lambda p: with_key_rotation("cerebras", _call_cerebras_raw, p, "zai-glm-4.7"),
    "openrouter": lambda p: with_key_rotation("openrouter", _call_openrouter_raw, p, "openai/gpt-oss-120b:free"),
}

def call_llm(prompt: str, provider: str = "gemini") -> str:
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider '{provider}'.")
    return PROVIDERS[provider](prompt)

def save_json(path: str, raw_output: str, label: str = "") -> dict | None:
    result = extract_json(raw_output)
    if not result["success"]:
        with open(f"debug_{label}_raw.txt", "w", encoding="utf-8") as f:
            f.write(raw_output)
        return None
    data = result["data"]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return data

def setup_template(template_path: str, destination: str) -> None:
    if os.path.exists(template_path):
        shutil.copytree(template_path, destination, dirs_exist_ok=True)

def _build_step_context(step: dict, plan: dict, is_app_step: bool, memory_str: str = "") -> str:
    # Use safe dict lookups (.get) to prevent KeyErrors on varying plan shapes
    config   = plan.get("config", {})
    styling  = config.get("styling", {}) if isinstance(config, dict) else {}
    meta     = plan.get("meta", {})
    
    lines = [
        memory_str,  
        "=== STEP ===",
        json.dumps(step, indent=2),
        "",
        "=== STYLING ===",
        f"styling_name : {styling.get('styling_name', []) if isinstance(styling, dict) else []}",
        f"gradients    : {json.dumps(styling.get('gradients', {})) if isinstance(styling, dict) else '{}'}",
        ""
    ]
    return "\n".join(lines)


def _is_app_step(step: dict) -> bool:
    name = step.get("name", "").lower()
    files = [i.get("filename", "") for i in step.get("input", [])]
    return "app" in name or any("App.tsx" in f for f in files)

def _run_step(i: int, step: dict, plan: dict, provider: str, memory_str: str = "") -> tuple[int, dict | None]:
    try:
        is_app  = _is_app_step(step)
        context = _build_step_context(step, plan, is_app_step=is_app, memory_str=memory_str)
        prompt  = step_execute(context)
        
        raw  = call_llm(prompt, provider=provider)
        data = save_json(f"{STEP_PATH}/{i}.json", raw, label=f"step_{i}")
        return i, data
    except Exception as e:
        # Explicitly log exactly what went wrong inside the worker thread
        print(f"\n[Executor Error] Step {i} encountered a severe issue: {e}")
        import traceback
        traceback.print_exc()
        return i, None

def run_planner(task: str, provider: str = "gemini", attachment_path: str = None, memory_str: str = "") -> dict | None:
    if attachment_path:
        task += f"\n\nAttachment context:\n{extractor.extract_text_from_pdf(attachment_path)}"
    raw = call_llm(planner(f"{memory_str}\nTask: {task}"), provider=provider)
    return save_json("outputs/plan/plan.json", raw, label="plan")

def run_executor(plan_file: str, provider: str, max_workers: int, memory_str: str = "") -> None:
    # 1. Fresh start: clear out previous stale run artifacts if they exist
    if os.path.exists(STEP_PATH):
        shutil.rmtree(STEP_PATH)
    os.makedirs(STEP_PATH, exist_ok=True)

    if not os.path.exists(plan_file):
        print(f"\n[Executor Error] Plan file not found at path: {plan_file}")
        return

    with open(plan_file, "r") as f:
        try:
            plan = json.load(f)
        except json.JSONDecodeError as e:
            print(f"\n[Executor Error] {plan_file} contains malformed/invalid JSON: {e}")
            return
        
    # ── UNIVERSAL NESTED STEP SCANNER ────────────────────────────────────────
    steps = plan.get("steps", [])

    # If steps are not found on the root, check inside nested objects (like 'config')
    if not steps and isinstance(plan, dict):
        for key, value in plan.items():
            if isinstance(value, dict) and "steps" in value:
                print(f"[Executor] Found nested pipeline steps under key: '{key}'")
                steps = value["steps"]
                break
                
    print(f"[Executor Log] Plan file loaded. Found {len(steps)} pipeline execution steps.")
    
    if not steps:
        print(f"[Executor Error] Bypassing execution! No iterable steps array located.")
        print(f"-> Available top-level keys in your plan.json: {list(plan.keys())}")
        return
    # ──────────────────────────────────────────────────────────────────────────

    # Rest of your worker thread execution code continues here...
    app_indices    = [i for i, s in enumerate(steps) if _is_app_step(s)]
    normal_indices = [i for i in range(len(steps)) if i not in app_indices]

    if normal_indices:
        print(f"[Executor] Dispatching {len(normal_indices)} components across {max_workers} worker threads...")
        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {pool.submit(_run_step, i, steps[i], plan, provider, memory_str): i for i in normal_indices}
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"[Executor Error] Thread pool worker crashed: {e}")
                    
    if app_indices:
        print(f"[Executor] Sequential processing for App components: {app_indices}")
        for i in app_indices:
            _run_step(i, steps[i], plan, provider, memory_str)

def run_assigner(project_root: str = "spiderman", step_dir: str = STEP_PATH, max_workers: int = MAX_WORKERS):
    if not os.path.exists(step_dir): return
    step_files = [f for f in os.listdir(step_dir) if f.endswith('.json')]
    total_tasks = len(step_files)
    if total_tasks == 0: return

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(run_task, i, total_tasks, project_root): i for i in range(total_tasks)}
        for future in as_completed(futures): pass

def run_fixer(provider: str, url: str, project_root: str, max_cycles: int, memory: AgenticMemory):
    print("\n" + "="*60 + "\n  STAGE 3: AUTO-FIX LOOP WITH MEMORY REFLECTION\n" + "="*60)
    run_auto_fix(
        call_llm     = lambda prompt: call_llm(prompt, provider=provider),
        extract_json = extract_json,
        url          = url,
        project_root = project_root,
        max_cycles   = max_cycles,
        memory       = memory
    )

# ── Orchestration Entry Node ──────────────────────────────────────────────────
def run_pipeline(
    task: str,
    mode: str            = "scratch",
    provider: str        = "gemini",
    attachment_path: str = None,
    plan_file: str       = "outputs/plan/plan.json",
    max_workers: int     = MAX_WORKERS,
    fix_cycles: int      = 5,
    project_root: str    = "spiderman",
    template_path: str   = "template/web",
    dev_url: str         = "http://localhost:5173"
):

    # Instantiate memory core
    memory = AgenticMemory()
    mem_str = memory.compile_memory_prompt()

    if mode in ("scratch", "build", "assigner"):
        setup_template(template_path, project_root)

    if mode == "scratch":
        plan = run_planner(task, provider=provider, attachment_path=attachment_path, memory_str=mem_str)
        global_css(project_root, plan_file)
        if plan is None: return
        run_executor(plan_file=plan_file, provider=provider, max_workers=max_workers, memory_str=mem_str)
        run_assigner(project_root=project_root, max_workers=max_workers)

    elif mode == "build":
        global_css(project_root, plan_file)
        run_executor(plan_file=plan_file, provider=provider, max_workers=max_workers, memory_str=mem_str)
        run_assigner(project_root=project_root, max_workers=max_workers)

    elif mode == "assigner":
        run_assigner(project_root=project_root, max_workers=max_workers)

    # Pre-Flight Static Validation loop run before launching test runtime server
    if mode in ("scratch", "build", "assigner"):
        static_errors = run_static_linter(project_root=project_root)
        if static_errors:
            print(f"[Validation Engine] Caught {len(static_errors)} structural breaks. Launching instant self-correction...")
            for err in static_errors:
                memory.log_episode("validator", err["file_path"], "failed", err["raw"])
            
            # Start background dev server so Selenium can attach and check live console errors
            print("[AutoFix] Spin-up background server for Selenium validation...")
            fix_server = subprocess.Popen(
                ["npm", "run", "dev"], 
                cwd=project_root, 
                shell=True if os.name == 'nt' else False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            time.sleep(3) # Give server a brief window to bind to host port
            
            try:
                run_fixer(provider, dev_url, project_root, fix_cycles, memory)
            finally:
                fix_server.terminate() # Tear down temporary background validation instance

    if mode == "fix":
        print("[AutoFix] Spin-up background server for Selenium validation...")
        fix_server = subprocess.Popen(
            ["npm", "run", "dev"], 
            cwd=project_root, 
            shell=True if os.name == 'nt' else False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        time.sleep(3)
        try:
            run_fixer(provider, dev_url, project_root, fix_cycles, memory)
        finally:
            fix_server.terminate()

    # ── Final Action: Serve and Launch the Completed App Runtime ───────────────
    print(f"\n{'='*60}\n[Pipeline] Build pipeline finalized! Serving application...\n{'='*60}")
    
    # Execute full interactive server instance
    runtime_server = subprocess.Popen(
        ["npm", "run", "dev"], 
        cwd=project_root, 
        shell=True if os.name == 'nt' else False
    )
    
    # Allow local system server instantiation time before throwing navigation intent
    time.sleep(2.5)
    print(f"[Pipeline] Project target active. Directing browser environment to: {dev_url}")
    webbrowser.open(dev_url)

    # try:
    #     # Keeps Python context alive so your server stays running until you hit Ctrl+C
    #     runtime_server.wait()
    # except KeyboardInterrupt:
    #     print("\n[Pipeline] Terminating live server runtime environment.")
    #     runtime_server.terminate()


if __name__ == "__main__":
    run_pipeline(
        task="create a spiderman website with proper routing. with black spiderman version and red spiderman version",
        provider="gemini", # gemini | groq | cerebras | openrouter
        mode="assigner",  # scratch | build | assigner | fix
        max_workers=4,
        fix_cycles=5,
        project_root="SpiderMan",   
        template_path="template/web" 
    )