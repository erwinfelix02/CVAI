from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

from model import generate_response

app = FastAPI()


class FAQItem(BaseModel):
    question: str
    answer: str


class HistoryItem(BaseModel):
    user: Optional[str] = ""
    assistant: Optional[str] = ""


class ChatRequest(BaseModel):
    message: str
    faqs: List[FAQItem]
    role: str
    history: List[HistoryItem] = Field(default_factory=list)


@app.post("/generate")
def generate(req: ChatRequest):
    faq_dicts = [faq.dict() for faq in req.faqs]
    history_dicts = [h.dict() for h in req.history]

    return generate_response(
        message=req.message,
        faqs=faq_dicts,
        role=req.role,
        history=history_dicts,
    )