def inline(error):
    return '''
Your should give replacement code for the following error:
thats must in this format

if error is like this:

(env) PS C:/Users/thiru/Documents/AI Agent Frontend> python ./test.py
  File "C:/Users/thiru/Documents/AI Agent Frontend/main.py", line 77
    sub a + b
        ^
SyntaxError: invalid syntax

output should be like this:
{
    path: "C:/Users/thiru/Documents/AI Agent Frontend/main.py",
    error: "SyntaxError: invalid syntax",
    line: 77,
    replacement: "return a + b",
    intendation: 4
}
 '''.strip() + error