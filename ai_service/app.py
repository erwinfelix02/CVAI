from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

from model import generate_response

app = FastAPI()

class FAQItem(BaseModel):
    question: str
    answer: str

class HistoryItem(BaseModel):
    user: str
    assistant: str

class ChatRequest(BaseModel):
    message: str
    faqs: List[FAQItem]
    role: str
    history: Optional[List[HistoryItem]] = []

@app.post("/generate")
def generate(req: ChatRequest):
    # Depending on Pydantic version (v1 uses .dict(), v2 uses .model_dump())
    faq_dicts = [faq.dict() if hasattr(faq, "dict") else faq for faq in req.faqs]
    history_dicts = [h.dict() if hasattr(h, "dict") else h for h in req.history]
    
    return generate_response(req.message, faq_dicts, req.role, history_dicts)