from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from utils.planner import planner
from utils import extractor, executor

load_dotenv()
PLAN_PATH = 'outputs/plan'
STEP_PATH = 'outputs/step'
ATTACHMENTS = True
api_key = os.getenv("API_KEY_1")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

prompt = "create a portfolio website use theme(dark git + purple). using these theme"

attachments_text = ""
if ATTACHMENTS:
    attachments_text = extractor.extract_text_from_pdf("./Thirumalai.pdf")

prompt += "\n\nHere are some attachments that might be useful:\n" + attachments_text
planned_task = planner(prompt)

# with open('outputs/full.json', 'r') as f:
#     planned_task = json.load(f)

# total_steps = planned_task['total_steps']
# styling_name = planned_task['config']['styling']['styling_name']
# step = planned_task['steps'][1]

# step = f"{step}"
# print(type(step))
# prompt = executor.step_execute(step)

completion = client.chat.completions.create(
    model="deepseek/deepseek-v4-flash:free",
    messages=[
        {
            "role": "system",
            "content": "You are a strict JSON generator. Always return valid JSON only."
        },
        {
            "role": "user",
            "content": planned_task
        }
    ],
    temperature=0.6,
    stream=True
)

full_output = ""

for chunk in completion:
    if chunk.choices[0].delta.content:
        token = chunk.choices[0].delta.content
        print(token, end="", flush=True)
        full_output += token

print("\n\n--- DONE ---")


try:
    json_start = full_output.find("{")
    json_end = full_output.rfind("}") + 1
    clean_json = full_output[json_start:json_end]

    parsed = json.loads(clean_json)

except Exception as e:
    print("JSON parsing failed:", e)
    parsed = {"error": "invalid_json", "raw": full_output}

# # SAVE OUTPUT
os.makedirs(STEP_PATH, exist_ok=True)
filename = f"{STEP_PATH}/output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

with open(filename, "w", encoding="utf-8") as f:
    json.dump(parsed, f, indent=2)

print("Saved:", filename)

