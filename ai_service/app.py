from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from model import generate_response

app = FastAPI()

class FAQItem(BaseModel):
    question: str
    answer: str

class ChatRequest(BaseModel):
    message: str
    faqs: List[FAQItem]
    role: str

@app.post("/generate")
def generate(req: ChatRequest):
    faq_dicts = [faq.dict() for faq in req.faqs]   # 🔥 ADD THIS
    result = generate_response(req.message, faq_dicts, req.role)
    return result

