from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from utils.planner import planner
from utils import extractor, executor, key_router
from google import genai

load_dotenv()
PLAN_PATH = 'outputs/plan'
STEP_PATH = 'outputs/step'
ATTACHMENTS = True
BASE_WEB_PATH = 'test/'
CURRENT_KEY = 1
api_key = os.getenv("API_KEY_1")

# prompt = "create a portfolio website use theme(dark + purple). glowing effect in hero section"

# attachments_text = ""
# if ATTACHMENTS:
#     attachments_text = extractor.extract_text_from_pdf("./Thirumalai.pdf")

# prompt += "\n\nHere are some attachments that might be useful:\n" + attachments_text
# prompt += planner(prompt)

gemini_key = os.getenv("GEMINI_API_KEY")

with open('outputs/hello.json', 'r') as f:
    planned_task = json.load(f)

for i in range(2):
    total_steps = planned_task['total_steps']
    styling_name = planned_task['config']['styling']['styling_name']
    print(styling_name)
    step = planned_task['steps'][i+1]

    step = f"{step}"
    print(type(step))
    print(step)
    prompt = executor.step_execute(step)

    client = genai.Client(api_key=gemini_key)

    stream = client.models.generate_content_stream(
        model="gemini-3-flash-preview",
        contents=prompt
    )
    full_output = ""

    for chunk in stream:
        if chunk.text:
            print(chunk.text, end="")
            full_output += chunk.text

    print("##### FINISHER ######")

# def model_response(planned_task):

#     global CURRENT_KEY, api_key

#     while True:
#         try:

#             client = OpenAI(
#                 base_url="https://openrouter.ai/api/v1",
#                 api_key=api_key,
#             )

#             completion = client.chat.completions.create(
#                 model="deepseek/deepseek-v4-flash:free",
#                 messages=[
#                     {
#                         "role": "system",
#                         "content": "You are a strict JSON generator. Always return valid JSON only."
#                     },
#                     {
#                         "role": "user",
#                         "content": planned_task
#                     }
#                 ],
#                 temperature=0.4,
#                 stream=True,
#             )

#             full_output = ""

#             for chunk in completion:
#                 if chunk.choices[0].delta.content:
#                     token = chunk.choices[0].delta.content
#                     print(token, end="", flush=True)
#                     full_output += token

#             print("\n\n--- DONE ---")

#             return full_output

#         except Exception as e:

#             error = str(e)

#             if "429" in error:
#                 print("Rate limit exceeded. Switching API key.", error)

#                 CURRENT_KEY = key_router.key_router(CURRENT_KEY)
#                 api_key = os.getenv(f"API_KEY_{CURRENT_KEY}")

#                 continue

#             raise e

# full_output = model_response(prompt)


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
    filename = f"{STEP_PATH}/{i+1}.json"

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2)

    print("Saved:", filename)

