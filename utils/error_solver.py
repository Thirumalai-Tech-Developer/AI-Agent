def inline(error, code_context):
    return '''
Your should give replacement code for the following error:
thats must in this format

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include explanations or extra text
- Do Not include 
- Follow the exact structure shown below
- Do NOT change key names
- Ensure all steps are clear and executable
- avoid to generate ```json ```, just return the JSON without markdown formatting
- If same error is repeated multiple times, give one solution.

if error is like this:

(env) PS C:/Users/thiru/Documents/AI Agent Frontend> python ./test.py
  File "C:/Users/thiru/Documents/AI Agent Frontend/main.py", line 77
    sub a + b
        ^
SyntaxError: invalid syntax

CODE:
def add(a, b):
    sub a + b

output should be like this:
{
    path: "C:/Users/thiru/Documents/AI Agent Frontend/main.py",
    error: [
        {
            line: 77,
            replacement: "return a + b",
            intendation: 4
        }       
    ]
    
}
if two error:
{
    path: "C:/Users/thiru/Documents/AI Agent Frontend/main.py",
    error: [
        {
            line: 77,
            replacement: "return a + b",
            intendation: 4
        },
        {
            [Error fixer code]}
    ]
    
}

'''.strip() + error + "\n\nContext: \n" + code_context