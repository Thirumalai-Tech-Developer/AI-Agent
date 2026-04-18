def planner(prompt: str) -> str:
    return rf"""
You are an AI Planner.

USER REQUEST:
{prompt}

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
- Follow the exact structure shown below
- Do NOT change key names
- Ensure all steps are clear and executable
- avoid Initializing the app, it's prebuilt. so, avoid setup-related steps

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
don't copy the styling config as is, it's just an example. you can modify it as per the requirements of the project.

OUTPUT FORMAT:
{{
  "task": "",
  "total_steps": 0,
  "config": {{
    "styling": {{
      "framework": "tailwindcss",

      "tailwind_config": {{
        "darkMode": ["class"],
        "content": [
          "./client/index.html",
          "./client/src/**/*.{{js,jsx,ts,tsx}}"
        ],
        "theme": {{
          "extend": {{
            "borderRadius": {{
              "lg": ".5625rem",
              "md": ".375rem",
              "sm": ".1875rem"
            }},
            "colors": {{
              "background": "hsl(var(--background) / <alpha-value>)",
              "foreground": "hsl(var(--foreground) / <alpha-value>)",
              "primary": {{
                "DEFAULT": "hsl(var(--primary) / <alpha-value>)",
                "foreground": "hsl(var(--primary-foreground) / <alpha-value>)"
              }}
            }}
          }}
        }},
        "plugins": [
          "tailwindcss-animate",
          "@tailwindcss/typography"
        ]
      }},

      "global_css": "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');\\n\\n@tailwind base;\\n@tailwind components;\\n@tailwind utilities;\\n\\n:root {{\\n  --primary: 222 47% 11%;\\n  --primary-foreground: 210 40% 98%;\\n  --secondary: 215 16% 47%;\\n  --secondary-foreground: 222 47% 11%;\\n  --accent: 204 94% 50%;\\n  --accent-foreground: 210 40% 98%;\\n  --background: 0 0% 100%;\\n  --foreground: 222 47% 11%;\\n  --muted: 210 40% 96.1%;\\n  --muted-foreground: 215.4 16.3% 46.9%;\\n  --card: 0 0% 100%;\\n  --card-foreground: 222 47% 11%;\\n  --border: 214.3 31.8% 91.4%;\\n  --input: 214.3 31.8% 91.4%;\\n  --ring: 222 47% 11%;\\n  --radius: 0.5rem;\\n  --font-sans: 'Inter', sans-serif;\\n  --font-display: 'Manrope', sans-serif;\\n}}\\n\\n@layer base {{\\n  * {{ @apply border-border; }}\\n  body {{ @apply bg-background text-foreground antialiased; font-family: var(--font-sans); }}\\n  h1, h2, h3, h4, h5, h6 {{ font-family: var(--font-display); @apply tracking-tight font-bold; }}\\n}}\\n\\nhtml {{ scroll-behavior: smooth; }}"
    }}
  }},
  "steps": [
    {{
      "step": 1,
      "name": "",
      "prompt": "",
      "input": [],
      "output": ""
    }}
  ]
}}
"""