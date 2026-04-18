from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from utils.planner import planner

load_dotenv()

api_key = os.getenv("API_KEY_1")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

prompt = "create a portfolio website use theme(dark git + purple)"
planned_task = planner(prompt)

# completion = client.chat.completions.create(
#     model="nvidia/nemotron-3-super-120b-a12b:free",
#     messages=[
#         {
#             "role": "system",
#             "content": "You are a strict JSON generator. Always return valid JSON only."
#         },
#         {
#             "role": "user",
#             "content": planned_task
#         }
#     ],
#     temperature=0.6
# )

# output_text = completion.choices[0].message.content.strip()


completion = client.chat.completions.create(
    model="openai/gpt-oss-120b:free",
    messages=[
        {"role": "system", "content": "Return only valid JSON."},
        {"role": "user", "content": planned_task}
    ],
    temperature=0.3,
    stream=True
)

full_output = ""

for chunk in completion:
    if chunk.choices[0].delta.content:
        token = chunk.choices[0].delta.content
        print(token, end="", flush=True)
        full_output += token

print("\n\n--- DONE ---")

# 🔥 CLEAN JSON EXTRACTION (important)
try:
    json_start = full_output.find("{")
    json_end = full_output.rfind("}") + 1
    clean_json = full_output[json_start:json_end]

    parsed = json.loads(clean_json)

except Exception as e:
    print("JSON parsing failed:", e)
    parsed = {"error": "invalid_json", "raw": full_output}

# # SAVE OUTPUT
os.makedirs("outputs", exist_ok=True)
filename = f"outputs/output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

with open(filename, "w", encoding="utf-8") as f:
    json.dump(parsed, f, indent=2)

print("Saved:", filename)