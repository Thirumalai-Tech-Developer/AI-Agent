[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework Core](https://img.shields.io/badge/Stack-React%20%2B%20TS-61dafb.svg)](https://react.dev/)
[![Styling Engine](https://img.shields.io/badge/CSS-Tailwind%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![Pipeline Status](https://img.shields.io/badge/Pipeline-Active-success.svg)](#)

---

## 📊 Code Statistics

<!-- LOC_STATS_START -->
| Language | Code Lines |
|----------|-----------:|
| Python | 1,594 |
| CSS | 295 |
| JSON | 137 |
| SVG | 27 |
| TypeScript | 26 |
| JavaScript | 21 |
| TSX | 19 |
| HTML | 13 |
| **Total** | **2,132** |

<!-- LOC_STATS_END -->

---

## 📺 Demo Walkthrough

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assert/video.webp">
    <img src="./assert/video.webp" alt="AI Scaffolding Pipeline Demo" width="60%">
  </picture>
</p>

---

```python
readme_content = """# AI Front-End Scaffolding Pipeline 🚀

An agentic, multi-stage orchestration engine engineered to accelerate front-end development lifecycles. The system automates architectural design planning, structured UI layout layout generation, race-condition-free file assignment, pre-flight static verification, and closed-loop browser-driven runtime self-healing.

---

## 💡 System Scope & Philosophy

> [!IMPORTANT]  
> **CRITICAL AUTOMATION SCOPE ASSIGNMENT** > This engine is strictly engineered as a **Workload Reduction Tool, NOT a complete 100% human-free automation replacement.**
> 
> **Objective:** Its core value is to eliminate setup friction, handle routine plumbing, boilerplate layouts, dependency resolution, and initial debugging loop iterations. It moves projects from a raw conceptual prompt to a compilation-verified baseline scaffolding in minutes (saving up to **70%+** of project initialization overhead). Human design review, final optimization, and complex business-logic tracking remain essential.

---

## 🗺️ Pipeline Architecture Matrix

The execution flow processes natural language prompts through isolated, deterministic engineering nodes:

```crud
   [ User Prompt ]
          │
          ▼
┌──────────────────┐
│ STAGE 1: Plan    │ ──► Generates standardized application state & blueprints
└─────────┬────────┘     (utils/planner.py)
          │
          ▼
┌──────────────────┐
│ STAGE 2: Execute │ ──► Translates blueprints into atomic module tasks
└─────────┬────────┘     (utils/executor.py)
          │
          ▼
┌──────────────────┐
│ STAGE 2.5: Assign│ ──► Sequential, safe physical code generation with live feedback
└─────────┬────────┘     (utils/assigner.py + tqdm)
          │
          ▼
┌──────────────────┐
│ STAGE 3: Validate│ ──► Pre-flight verification (tsc --noEmit)
└─────────┬────────┘
          │
          ├─────────────── (Compilation Mismatch / Errors Found) ──────────────┐
          │                                                                    ▼
          ▼ (Passes Validation)                                      ┌──────────────────┐
┌──────────────────┐                                                 │ STAGE 4: Heal    │
│ STABLE FRONTEND  │ ◄────────── (Applies Clean Code Patches) ───────┤ (Selenium + LLM) │
│   SCAFFOLDING    │                                                 └──────────────────┘
└──────────────────┘                                                  (utils/error_fixer)

```

### Module Breakdown

| Pipeline Stage | Module Reference | Processing Pattern | Core Functionality |
| --- | --- | --- | --- |
| **1. Strategic Planning** | `utils/planner.py` | Isolated Block | Transforms plain text inputs into standardized structural system JSON specifications. Maps routing grids (`wouter`), UI layouts, state containers, and strict **OKLCH** color systems. |
| **2. Task Compilation** | `utils/executor.py` | LLM Mapping | Parses individual components out of the macro plan object. Creates environment flags, target generation trees, and sets explicit layout boundaries. Includes list-unwrapping defenses. |
| **2.5. Sequential Assignment** | `utils/assigner.py` | **Sequential (Safe)** | Provisions concrete paths, downloads atomic tracking assets, and writes component blocks. Eliminates multi-threaded race conditions or stream clipping. Features a clean terminal `tqdm` gauge. |
| **3. Static Validation** | `utils/validator.py` | Local Engine | Triggers automated silent TypeScript checking passes (`tsc --noEmit`) straight inside the generated root directory to identify broken absolute paths or syntax exceptions. |
| **4. Closed-Loop Healing** | `utils/error_fixer.py` | Runtime Loop | Drives a headless Selenium browser watcher to scrape console issues. Cross-references target stacks with active memories, prompting immediate corrective structural adjustments. |

---

## 🧠 Dual-Layer Agentic Memory Engine

To prevent the pipeline from trapping itself in repetitive execution loops or falling into duplicate debugging sequences, `utils/memory.py` implements a synchronized memory engine:

```
  ┌────────────────────────────────────────────────────────┐
  │              Episodic Window (Short-Term)              │
  │  - Holds past 15 logs, target files & patch traces.   │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼ Synthesis Process
  ┌────────────────────────────────────────────────────────┐
  │             Rules Base Matrix (Long-Term)             │
  │  - Hardens recurring platform configurations.          │
  │  - Mitigates breaking ecosystem updates automatically.  │
  └────────────────────────────────────────────────────────┘

```

* **Episodic Context Tracker (Short-Term):** Manages a rolling history buffer tracking active iteration logs, file pointers, and code changes during a single pipeline run.
* **Architectural Rule Matrix (Long-Term):** Evaluates recurring configuration patterns over time. If a dependency error triggers repeatedly (e.g., specific library export gaps or asset configurations), the pipeline logs a permanent rule asset that modifies subsequent planning steps.

---

## 🏗️ Supported Environment System Grid

The generation engine outputs code built exclusively around a verified, optimized modern technology stack:

* **Runtime Core:** React 19 + TypeScript (Vite-optimized setup)
* **Styling Architecture:** Tailwind CSS v4 Engine + Inter/Geist Variable Web Fonts
* **Design Tokens:** OKLCH Functional Color Space (Accessible Contrast Metrics)
* **Component Foundation:** Radix UI primitives initialized via `shadcn/ui`
* **Icon Elements:** `lucide-react`
* **Routing System:** `wouter` (Zero-config, high-performance hash/path engine)

---

## 📦 Directory Structure Blueprint

```text
.
├── main.py                   # Master Pipeline Entry point & orchestration manager
├── .env                      # API keys and orchestration flags
├── templates/                # Structural layout baselines for compilation references
│   └── web/                  # Vite + React + TS base blueprint templates
├── outputs/                  # Runtime tracking logs and assets
│   ├── plan/                 # Extracted application architecture blueprint (plan.json)
│   ├── step/                 # Individual components operational task files
│   └── error/                # Selenium debugging crash reports
└── utils/                    # Core pipeline functional modules
    ├── planner.py            # Stage 1: Macro JSON architecture configuration
    ├── executor.py           # Stage 2: Prompt execution context builder
    ├── assigner.py           # Stage 2.5: Safe sequential component writer (tqdm driven)
    ├── json.py               # Robust regex JSON processing and syntax reconstruction
    ├── key_router.py         # Multi-provider rate limit balancing & token rotation
    ├── error_fixer.py        # Stage 4: Headless runtime debugging manager
    └── memory.py             # Active memory state matrix layer

```

---

## 🚀 Usage Profiles (`main.py`)

Run the master controller function using explicit execution parameter objects:

```python
from main import run_pipeline

run_pipeline(
    task="create a stunning dashboard tracking cryptocurrency metrics with light/dark toggle",
    provider="cerebras",           # Target LLM provider engine: 'gemini' | 'groq' | 'cerebras'
    mode="scratch",                # Target workflow profile
    project_root="crypto_tracker", # Output compilation path name
    max_workers=4                  # Execution bounds configuration
)

```

### Mode Dictionary:

* `scratch` — Execution from absolute zero. Spins up planners, maps step nodes, populates configurations, tests typing, and resolves initial compilation issues.
* `build` — Standardizes execution using an existing `plan.json` configuration profile, skipping the generation phase of Step 1.
* `assigner` — Offline construction profile. Skips all LLM generation endpoints entirely and directly feeds pre-existing step JSON chunks sequentially into the repository path with progress bars.
* `fix` — Target optimization loop. Freezes development blocks, attaches the Selenium watcher tracking environment, and executes self-healing patches to fix unexpected application crashes.
"""

## 👤 Author

* **thirumalai G** — *Core Architecture & Pipeline Development*