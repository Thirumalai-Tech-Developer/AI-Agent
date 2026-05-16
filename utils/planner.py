def planner(prompt: str) -> str:
    return f"""
You are an AI Planner.

USER REQUEST:
{prompt} \n
"""+"""

TASK:
Convert the user request into a structured execution plan for an AI builder system.

HARD CONSTRAINTS:
- NEVER include steps related to:
  - git, version control
  - project structure or file creation
  - Tailwind or CSS configuration
  - dependencies or setup

- These are handled by the system automatically.

- ONLY generate steps related to:
  - UI components
  - layout
  - user-facing features

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include explanations or extra text
- Do Not include 
- Follow the exact structure shown below
- Do NOT change key names
- Ensure all steps are clear and executable
- avoid Initializing the app, it's prebuilt. so, avoid setup-related steps
- avoid to generate ```json ```, just return the JSON without markdown formatting

INVALID STEPS (DO NOT GENERATE):
- Initialize git repository
- Create folders/files
- Configure Tailwind
- Install dependencies

VALID STEPS:
- Create homepage UI
- Build navigation
- Generate sections
- Assemble layout

IMPORTANT:
The styling configuration may include a global CSS (index.css) which should be used as the base design system before building components.

STEP RULES:
- Each step must have a unique snake_case name
- Each step must produce a reusable output
- Avoid generic instructions

COLOR CONSISTENCY RULE:
- Ensure color variables reflect user-requested theme (e.g., purple, dark)
- Do not default to generic colors if theme is specified

DATA FLOW RULES:
- Steps should be sequential
- Use previous outputs as inputs wherever applicable

THEME RULES:
- Ensure styling matches the requested theme in both config and steps

CONFIG RULES:
- Do NOT repeat styling or setup inside steps

OUTPUT RULES:
- Outputs must be meaningful and reusable

FINAL CHECK:
- No setup, git, or config steps
- Only UI-related steps
- Valid JSON only

Note:
@import \"tailwindcss\";\n@import \"tw-animate-css\";\n@plugin \"@tailwindcss/typography Must use this. Because im using TailwindCSS v4
don't copy the styling config as is, it's just an example. you can modify it as per the requirements of the project.
All components the useful components i have already no need to give as steps

INPUT: Create a portfolio website use theme(dark git + purple). with some attachments of link, details, conact details and more...

NOTE: if user doesnt specify a theme, you can use a any theme you want, but if they do specify a theme, make sure to reflect that in the styling config and steps.
the ouput formte theme is just an example, its not purpule and dark git theme, you can modify the colors as per the requirements of the project, but make sure to reflect the theme in the styling config and steps.

OUTPUT FORMAT(THIS IS ONLY AN EXAMPLES, DO NOT COPY AS IS, MODIFY AS PER THE REQUIREMENTS OF THE PROJECT):
{{
  "task": "Create a portfolio website",
  "total_steps": 2,
  "config": {{
    "styling": {{
      "framework": "tailwindcss",
      "global_css": "@import \"tailwindcss\";\n@import \"tw-animate-css\";\n@plugin \"@tailwindcss/typography\";\n\nbody {\n\tfont-family: Inter, system-ui, -apple-system, sans-serif;\n}\n\n@custom-variant dark (&:is(.dark *));\n\n@theme inline {\n\t--color-background: hsl(var(--background));\n\t--color-foreground: hsl(var(--foreground));\n\t--color-border: hsl(var(--border));\n\t--color-input: hsl(var(--input));\n\t--color-ring: hsl(var(--ring));\n\t--color-card: hsl(var(--card));\n\t--color-card-foreground: hsl(var(--card-foreground));\n\t--color-primary: hsl(var(--primary));\n\t--color-primary-foreground: hsl(var(--primary-foreground));\n\t--color-secondary: hsl(var(--secondary));\n\t--color-secondary-foreground: hsl(var(--secondary-foreground));\n\t--color-muted: hsl(var(--muted));\n\t--color-muted-foreground: hsl(var(--muted-foreground));\n\t--color-accent: hsl(var(--accent));\n\t--color-accent-foreground: hsl(var(--accent-foreground));\n\t--font-sans: var(--app-font-sans);\n\t--font-serif: var(--app-font-serif);\n\t--font-mono: var(--app-font-mono);\n\t--radius-sm: calc(var(--radius) - 4px);\n\t--radius-md: calc(var(--radius) - 2px);\n\t--radius-lg: var(--radius);\n\t--radius-xl: calc(var(--radius) + 4px);\n}\n\n:root {\n\t--background: 0 0% 100%;\n\t--foreground: 0 0% 4.3%;\n\t--border: 0 0% 90%;\n\t--card: 0 0% 98%;\n\t--card-foreground: 0 0% 4.3%;\n\t--primary: 28.7 100% 50%;\n\t--primary-foreground: 0 0% 100%;\n\t--secondary: 0 0% 96%;\n\t--secondary-foreground: 0 0% 9%;\n\t--muted: 0 0% 96%;\n\t--muted-foreground: 0 0% 45.1%;\n\t--accent: 28.7 100% 50%;\n\t--accent-foreground: 0 0% 100%;\n\t--input: 0 0% 89.8%;\n\t--ring: 28.7 100% 50%;\n\t--app-font-sans: 'Inter', sans-serif;\n\t--app-font-serif: Georgia, serif;\n\t--app-font-mono: Menlo, monospace;\n\t--radius: .5rem;\n}\n\n.dark {\n\t--background: 0 0% 4.3%;\n\t--foreground: 0 0% 100%;\n\t--border: 0 0% 16.5%;\n\t--card: 0 0% 10.6%;\n\t--card-foreground: 0 0% 100%;\n\t--primary: 28.7 100% 50%;\n\t--primary-foreground: 0 0% 100%;\n\t--secondary: 0 0% 16.5%;\n\t--secondary-foreground: 0 0% 100%;\n\t--muted: 0 0% 16.5%;\n\t--muted-foreground: 0 0% 71%;\n\t--accent: 28.7 100% 50%;\n\t--accent-foreground: 0 0% 100%;\n\t--input: 0 0% 16.5%;\n\t--ring: 28.7 100% 50%;\n}\n\n@layer base {\n\t* {\n\t\t@apply border-border;\n\t}\n\n\tbody {\n\t\t@apply font-sans antialiased bg-background text-foreground;\n\t}\n}\n\n@layer utilities {\n\tinput[type=\"search\"]::-webkit-search-cancel-button {\n\t\t@apply hidden;\n\t}\n\n\t.hide-scrollbar {\n\t\tscrollbar-width: none;\n\t\t-ms-overflow-style: none;\n\t}\n\n\t.hide-scrollbar::-webkit-scrollbar {\n\t\tdisplay: none;\n\t}\n\n\t.hover-elevate,\n\t.hover-elevate-2,\n\t.active-elevate,\n\t.active-elevate-2 {\n\t\tposition: relative;\n\t\tz-index: 0;\n\t}\n}"
      "styling_name": [
        bg-background, text-foreground, border-border, bg-card, text-card-foreground, border-card-border, bg-popover, text-popover-foreground, border-popover-border, bg-primary, text-primary-foreground, border-primary-border, bg-secondary, text-secondary-foreground, border-secondary-border, bg-muted, text-muted-foreground, border-muted-border, bg-accent, text-accent-foreground, border-accent-border, bg-destructive, text-destructive-foreground, border-destructive-border, bg-sidebar, text-sidebar-foreground, border-sidebar-border, bg-sidebar-primary, text-sidebar-primary-foreground, border-sidebar-primary-border, bg-sidebar-accent, text-sidebar-accent-foreground, border-sidebar-accent-border, ring-ring, border-input, hover-elevate, hover-elevate-2, active-elevate, active-elevate-2, toggle-elevate, toggle-elevated, hide-scrollbar
      ]
    }}
  }},
  "steps": [
    {{
      "step": 1,
      "name": "Create homepage layout",
      "prompt": "Create a bueatiful homepage layout for a portfolio website with a dark git + purple theme. The homepage should include a header with navigation, a hero section with an introduction, a projects section showcasing work, and a contact form. Use the provided styling config for colors and fonts.",
      "input": [YOU_NEED_GIVE_DETAILS_OF INPUT_FOR_HOME_PAGE_DETAILS_ONLY],
    }},
    {{
      "step": 2,
      "name": "Create project pages",
      "prompt": "Create detailed project pages for each item in the portfolio. Each page should include a description, images, and links to the live project or source code. Use the provided styling config for colors and fonts.",
      "input": [YOU_NEED_GIVE_DETAILS_OF INPUT_FOR_PROJECT_PAGES_ONLY],
    }}
  ]
}
"""