
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

from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class NavLink(BaseModel):
    label: str
    href: str
    type: Literal["route", "anchor"]


class Section(BaseModel):
    name: str
    id: str


class ComponentRegistry(BaseModel):
    name: str
    filename: str
    export_default: str
    id: str
    route: Optional[str] = None
    type: Literal["page", "section", "persistent"]

    sections: List[Section] = []
    nav_links: List[NavLink] = []


class StylingConfig(BaseModel):
    framework: str = "tailwindcss"
    version: str = "4"
    global_css: str = Field(default_factory=lambda: _CSS_REFERENCE)
    styling_names: List[str]
    hero_gradient: Optional[str] = None


class StepInput(BaseModel):
    component: str
    filename: str

    component_name: str
    filename: str
    export_default: str

    id: str
    route: Optional[str]

class PlannerStep(BaseModel):
    steps: int
    name: str

    prompt: str
    input: List[StepInput]


class ProjectMeta(BaseModel):
    project_name: str
    theme: str
    router: str = "wouter"

    entry_file: str = "src/App.tsx"

    component_registry: List[ComponentRegistry]


class WebsitePlan(BaseModel):
    task: str

    total_steps: int

    meta: ProjectMeta

    config: StylingConfig

    steps: List[PlannerStep]