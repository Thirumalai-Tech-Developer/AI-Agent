from typing import List, Literal
from pydantic import BaseModel

class Step(BaseModel):
    step: int
    title: str
    purpose: str
    type: Literal[
        "Terminal Command",
        "File Creation",
        "Code",
        "Configuration"
    ]
    target_file: str = ""
    dependencies: List[str] = []
    code: str

class Task(BaseModel):
    task: str
    total_steps: int
    steps: List[Step]