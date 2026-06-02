# utils/planner.py

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
    "  --radius-2xl: calc(var(--radius)*1.8); --radius-3xl: calc(var(--radius)*2.2); --radius-4xl: calc(var(--radius)*2.6);\n"
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
    "  --chart-1:oklch(0.72 0.20 285); --chart-2:oklch(0.65 0.16 260);\n"
    "  --chart-3:oklch(0.58 0.13 240); --chart-4:oklch(0.50 0.10 220); --chart-5:oklch(0.42 0.08 200);\n"
    "  --sidebar:oklch(0.96 0.01 280); --sidebar-foreground:oklch(0.18 0.01 280);\n"
    "  --sidebar-primary:oklch(0.62 0.23 285); --sidebar-primary-foreground:oklch(0.98 0 0);\n"
    "  --sidebar-accent:oklch(0.92 0.03 285); --sidebar-accent-foreground:oklch(0.22 0.03 285);\n"
    "  --sidebar-border:oklch(0.88 0.01 280); --sidebar-ring:oklch(0.62 0.23 285);\n"
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
    "  --chart-1:oklch(0.78 0.22 285); --chart-2:oklch(0.70 0.18 265);\n"
    "  --chart-3:oklch(0.62 0.14 245); --chart-4:oklch(0.54 0.11 225); --chart-5:oklch(0.46 0.09 205);\n"
    "  --sidebar:oklch(0.16 0.025 285); --sidebar-foreground:oklch(0.96 0.01 285);\n"
    "  --sidebar-primary:oklch(0.72 0.24 285); --sidebar-primary-foreground:oklch(0.12 0.01 285);\n"
    "  --sidebar-accent:oklch(0.24 0.04 285); --sidebar-accent-foreground:oklch(0.96 0.01 285);\n"
    "  --sidebar-border:oklch(1 0 0/8%); --sidebar-ring:oklch(0.72 0.24 285);\n"
    "}\n\n"
    "@layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; } html { @apply font-sans; } }"
)

code = """
import { Hash, Link2, ExternalLink, Share2 } from "lucide-react";

const socials = [
  { icon: ExternalLink, label: "GitHub",   href: "#" },
  { icon: Link2,        label: "LinkedIn", href: "#" },
  { icon: Hash,         label: "Twitter",  href: "#" },
  { icon: Share2,       label: "Facebook", href: "#" },
];


"""

# Injected into the final App.tsx step prompt
_APP_ROUTING_INSTRUCTIONS = """
FINAL STEP — App.tsx ROUTING & COMPOSITION

App.tsx handles routing only. Never recreate or re-implement any component.

STRICT RULES:
1. Import every component/page by its EXACT filename stem:
     import Navbar   from './components/Navbar'
     import Footer   from './components/Footer'
     import HomePage from './pages/HomePage'

2. Use the declared export_default name for each import.

3. Route paths MUST match the "route" field in the registry.

4. Navbar and Footer are persistent — render them OUTSIDE <Switch>.

5. Navbar links:
   - Page routes  → use wouter <Link href="/route">
   - Same-page sections → use anchor <a href="#section-id">
   The "nav_links" field in the registry lists every link the navbar needs.

6. Footer quick links mirror the same section ids:
   - Page links  → <Link href="/route">
   - Section anchors → <a href="#section-id">
   The "footer_links" field lists every quick link the footer needs.

7. Every page/section root element already has its id applied inside its
   own file — App.tsx does NOT add ids. It only composes and routes.

8. export default App at the bottom.

EXAMPLE:
import { Router, Route, Switch } from 'wouter'
import Navbar    from './components/Navbar'     // id="navbar"
import Footer    from './components/Footer'     // id="footer"
import HomePage  from './pages/HomePage'        // id="home",  route="/"
import AboutPage from './pages/AboutPage'       // id="about", route="/about"

export default function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/"      component={HomePage}  />
        <Route path="/about" component={AboutPage} />
      </Switch>
      <Footer />
    </Router>
  )
}

Navbar uses:
  <a href="#hero">Hero</a>          ← same-page anchor
  <Link href="/about">About</Link>  ← page route

Footer uses:
  <a href="#hero">Back to top</a>
  <Link href="/about">About</Link>
  <a href="#contact">Contact</a>
"""


def planner(prompt: str) -> str:
    return f"""You are an AI Website Planner. Output ONLY raw JSON — no markdown, no explanation.

TASK: {prompt}

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
- no need to generate the entire tsx file code thats will do by your giving prompt

ID RULES:
- Navbar root:   id="navbar"
- Footer root:   id="footer"
- Every page/section root: id matching its registry entry
- Navbar nav links use href="#section-id" for same-page, href="/route" for pages
- Footer quick links mirror the same ids/routes
- in links like github, linkedin, twitter, facebook means use this {code}. just metion in using placing. in prompt


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
          {{"label": "Home",    "href": "/",        "type": "route"}},
          {{"label": "Hero",    "href": "#hero",    "type": "anchor"}},
          {{"label": "About",   "href": "/about",   "type": "route"}},
          {{"label": "Contact", "href": "#contact", "type": "anchor"}}
        ]
      }},
      {{
        "name": "Footer",
        "filename": "src/components/Footer.tsx",
        "export_default": "Footer",
        "id": "footer",
        "route": null,
        "type": "persistent",
        "footer_links": [
          {{"label": "Home",    "href": "/",        "type": "route"}},
          {{"label": "Hero",    "href": "#hero",    "type": "anchor"}},
          {{"label": "About",   "href": "/about",   "type": "route"}},
          {{"label": "Contact", "href": "#contact", "type": "anchor"}}
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
          {{"name": "Hero",    "id": "hero"}},
          {{"name": "Contact", "id": "contact"}}
        ]
      }}
    ]
  }},
  "config": {{
    "styling": {{
      "framework": "tailwindcss",
      "version": "4",
      "global_css": "FULL CSS — no placeholders",
      "styling_name": ["bg-background","text-foreground","bg-card","text-card-foreground",
        "bg-primary","text-primary-foreground","bg-secondary","text-secondary-foreground",
        "bg-muted","text-muted-foreground","bg-accent","text-accent-foreground",
        "bg-destructive","border-border","ring-ring"],
      "gradients": {{
        "hero": "bg-gradient-to-br from-primary to-secondary",
        "cta":  "bg-gradient-to-r from-primary via-accent to-secondary",
        "card": "bg-gradient-to-b from-card to-muted"
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
          {{"label":"Home","href":"/","type":"route"}},
          {{"label":"Hero","href":"#hero","type":"anchor"}}
        ],
        "bg": "bg-background",
        "text": "text-foreground",
        "shadcn": ["navigation-menu","button","sheet"]
      }}]
    }}
  ]
}}

LAST STEP — App.tsx prompt MUST include this registry table:

| name      | filename                       | export_default | id      | route   | type       |
|-----------|--------------------------------|----------------|---------|---------|------------|
| Navbar    | src/components/Navbar.tsx      | Navbar         | navbar  | null    | persistent |
| Footer    | src/components/Footer.tsx      | Footer         | footer  | null    | persistent |
| HomePage  | src/pages/HomePage.tsx         | HomePage       | home    | /       | page       |
| AboutPage | src/pages/AboutPage.tsx        | AboutPage      | about   | /about  | page       |

Section ids inside pages (for anchor links):
| page      | section name | section id |
|-----------|-------------|------------|
| HomePage  | Hero         | hero       |
| HomePage  | Contact      | contact    |

{_APP_ROUTING_INSTRUCTIONS}"""