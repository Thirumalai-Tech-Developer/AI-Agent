# utils/planner.py
"""
v2 — Website planner prompt builder.

`build_plan_prompt(task, memory_str)` returns the full planner prompt.
The actual LLM call is handled by main.py / the pipeline orchestrator,
keeping prompt construction cleanly separated from I/O.
"""

from __future__ import annotations

# ── CSS reference ─────────────────────────────────────────────────────────────

_CSS_REFERENCE = (
    '@import "tailwindcss";\n@import "tw-animate-css";\n@import "shadcn/tailwind.css";\n'
    '@import "@fontsource-variable/geist";\n\n@custom-variant dark (&:is(.dark *));\n\n'
    "@theme inline {\n"
    "  --font-sans: 'Geist Variable', sans-serif;\n"
    "  --color-background: var(--background); --color-foreground: var(--foreground);\n"
    "  --color-card: var(--card); --color-card-foreground: var(--card-foreground);\n"
    "  --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);\n"
    "  --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);\n"
    "  --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);\n"
    "  --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);\n"
    "  --color-destructive: var(--destructive);\n"
    "  --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);\n"
    "  --color-chart-1: var(--chart-1); --color-chart-2: var(--chart-2); --color-chart-3: var(--chart-3);\n"
    "  --color-chart-4: var(--chart-4); --color-chart-5: var(--chart-5);\n"
    "  --color-sidebar: var(--sidebar); --color-sidebar-foreground: var(--sidebar-foreground);\n"
    "  --color-sidebar-primary: var(--sidebar-primary); --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);\n"
    "  --color-sidebar-accent: var(--sidebar-accent); --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);\n"
    "  --color-sidebar-border: var(--sidebar-border); --color-sidebar-ring: var(--sidebar-ring);\n"
    "  --radius-sm: calc(var(--radius)*0.6); --radius-md: calc(var(--radius)*0.8);\n"
    "  --radius-lg: var(--radius); --radius-xl: calc(var(--radius)*1.4);\n"
    "}\n\n"
    ":root {\n"
    "  --background:oklch(0.98 0.002 280); --foreground:oklch(0.18 0.01 280);\n"
    "  --card:oklch(1 0 0); --card-foreground:oklch(0.18 0.01 280);\n"
    "  --primary:oklch(0.62 0.23 285); --primary-foreground:oklch(0.98 0 0);\n"
    "  --secondary:oklch(0.94 0.01 280); --secondary-foreground:oklch(0.24 0.02 280);\n"
    "  --muted:oklch(0.94 0.01 280); --muted-foreground:oklch(0.52 0.02 280);\n"
    "  --accent:oklch(0.92 0.03 285); --accent-foreground:oklch(0.22 0.03 285);\n"
    "  --destructive:oklch(0.65 0.22 25); --border:oklch(0.88 0.01 280);\n"
    "  --input:oklch(0.88 0.01 280); --ring:oklch(0.62 0.23 285); --radius:0.75rem;\n"
    "}\n\n"
    ".dark {\n"
    "  --background:oklch(0.13 0.02 285); --foreground:oklch(0.96 0.01 285);\n"
    "  --card:oklch(0.17 0.025 285); --card-foreground:oklch(0.96 0.01 285);\n"
    "  --primary:oklch(0.72 0.24 285); --primary-foreground:oklch(0.12 0.01 285);\n"
    "  --secondary:oklch(0.22 0.03 285); --secondary-foreground:oklch(0.96 0.01 285);\n"
    "  --muted:oklch(0.20 0.025 285); --muted-foreground:oklch(0.68 0.02 285);\n"
    "  --accent:oklch(0.26 0.05 285); --accent-foreground:oklch(0.98 0 0);\n"
    "  --destructive:oklch(0.68 0.22 25); --border:oklch(1 0 0/8%); --input:oklch(1 0 0/12%);\n"
    "  --ring:oklch(0.72 0.24 285);\n"
    "}\n\n"
    "@layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; } html { @apply font-sans; } }"
)

_SOCIAL_ICON_NOTE = """
import { Hash, Link2, ExternalLink, Share2 } from "lucide-react";

const socials = [
  { icon: ExternalLink, label: "GitHub",   href: "#" },
  { icon: Link2,        label: "LinkedIn", href: "#" },
  { icon: Hash,         label: "Twitter",  href: "#" },
  { icon: Share2,       label: "Facebook", href: "#" },
];
"""

_APP_ROUTING_INSTRUCTIONS = """
FINAL STEP — App.tsx ROUTING & COMPOSITION

App.tsx handles routing only. Never recreate or re-implement any component.

STRICT RULES:
1. Import every component/page by its EXACT filename stem.
2. Use the declared export_default name for each import.
3. Route paths MUST match the "route" field in the registry.
4. Navbar and Footer are persistent — render them OUTSIDE <Switch>.
5. Navbar links: page routes → wouter <Link href="/route">; same-page sections → <a href="#section-id">.
6. Footer quick links mirror the same section ids/routes.
7. Every page/section root element already has its id applied inside its own file — App.tsx does NOT add ids.
8. export default App at the bottom.
"""


def build_plan_prompt(task: str, memory_str: str = "") -> str:
    """
    Return the full planner system prompt for a given website task.
    Inject optional memory context at the top.
    """
    return f"""You are an AI Website Planner. Output ONLY raw JSON — no markdown, no explanation.

{memory_str}
TASK: {task}

STACK (pre-installed): React+TS, TailwindCSS v4, shadcn/ui, wouter, lucide-react, Geist font.
DO NOT generate: installs, git, folder setup, shadcn init, tailwind setup.
GENERATE: layouts, pages, components, routing, UI only.

RULES:
- Every step.prompt is self-contained — no cross-step refs
- Every component/section declares a unique HTML id on its root element
- Navbar links and Footer quick links MUST reference those exact ids
- Every component uses: export default <ComponentName>
- App.tsx is always the LAST step — routing + composition only
- No duplicate files
- global_css must be COMPLETE — adapt colors to match requested theme
- Use oklch() color space
- Use wouter for routing

ID RULES:
- Navbar root:   id="navbar"
- Footer root:   id="footer"
- Every page/section root: id matching its registry entry
- For social icons use: {_SOCIAL_ICON_NOTE}

CSS REFERENCE (adapt hue/lightness to match theme, keep structure):
{_CSS_REFERENCE}

OUTPUT SCHEMA:
{{
  "task": "string",
  "total_steps": number,
  "meta": {{
    "project_name": "string",
    "theme": "string",
    "router": "wouter",
    "entry_file": "src/App.tsx",
    "index_css": "src/index.css",
    "component_registry": [
      {{
        "name": "Navbar",
        "filename": "src/components/Navbar.tsx",
        "export_default": "Navbar",
        "id": "navbar",
        "route": null,
        "type": "persistent",
        "nav_links": [
          {{"label": "Home",  "href": "/",      "type": "route"}},
          {{"label": "Hero",  "href": "#hero",  "type": "anchor"}}
        ]
      }},
      {{
        "name": "HomePage",
        "filename": "src/pages/HomePage.tsx",
        "export_default": "HomePage",
        "id": "home",
        "route": "/",
        "type": "page",
        "sections": [
          {{"name": "Hero", "id": "hero"}}
        ]
      }}
    ]
  }},
  "config": {{
    "styling": {{
      "framework": "tailwindcss",
      "version": "4",
      "global_css": "FULL CSS — no placeholders",
      "styling_name": ["bg-background","text-foreground","bg-primary","text-primary-foreground"],
      "gradients": {{
        "hero": "bg-gradient-to-br from-primary to-secondary"
      }}
    }}
  }},
  "steps": [
    {{
      "step": 1,
      "name": "snake_case",
      "prompt": "Self-contained instruction. State: filename, export default name, root id, section ids inside (if any), layout, colors, content, shadcn components, a11y, responsive.",
      "input": [{{
        "component": "Navbar",
        "filename": "src/components/Navbar.tsx",
        "export_default": "Navbar",
        "id": "navbar",
        "route": null,
        "type": "persistent",
        "nav_links": [
          {{"label":"Home","href":"/","type":"route"}}
        ],
        "bg": "bg-background",
        "text": "text-foreground",
        "shadcn": ["navigation-menu","button","sheet"]
      }}]
    }}
  ]
}}

LAST STEP — App.tsx prompt MUST include this routing registry table:

| name      | filename                       | export_default | id      | route   | type       |
|-----------|--------------------------------|----------------|---------|---------|------------|
| Navbar    | src/components/Navbar.tsx      | Navbar         | navbar  | null    | persistent |
| Footer    | src/components/Footer.tsx      | Footer         | footer  | null    | persistent |
| HomePage  | src/pages/HomePage.tsx         | HomePage       | home    | /       | page       |

{_APP_ROUTING_INSTRUCTIONS}"""