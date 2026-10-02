import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from google import genai
from dotenv import load_dotenv

# Automatically load environment variables from .env file
load_dotenv()

app = FastAPI(title="Campus AI Chatbot (Gemini) Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Securely load credentials from environment variables with safety checks
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing from environment variables!")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing from environment variables!")

client = MongoClient(MONGO_URI)
db = client.get_database("cvai_db")
faqs_collection = db["faqs"]

client_ai = genai.Client(api_key=GEMINI_API_KEY)

# Simple built-in cache
chat_cache = {}
CACHE_TTL = 3600  # Cache expires after 1 hour (3600 seconds)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_with_campus_bot(request: ChatRequest):
    user_msg = request.message.strip().lower()
    
    # 1. Handle quick greetings instantly (English & Tagalog)
    greetings_en = ["hi", "hey", "good morning", "good afternoon", "good evening", "hello", "hi there", "greetings"]
    greetings_tl = ["kumusta", "kamusta", "hi po", "hello po", "magandang umaga", "magandang hapon", "magandang gabi"]
    
    if any(g in user_msg for g in greetings_en):
        return {"reply": "Hello there! How can I assist you with campus information today?"}
    
    if any(g in user_msg for g in greetings_tl):
        return {"reply": "Kumusta! Paano po kita matutulungan tungkol sa mga impormasyon sa campus ngayon?"}

    # 2. Check built-in cache
    current_time = time.time()
    if user_msg in chat_cache:
        cached_entry = chat_cache[user_msg]
        if current_time - cached_entry["timestamp"] < CACHE_TTL:
            print(f"Cache hit! Returning saved response for: '{user_msg}' (0 API tokens used)")
            return {"reply": cached_entry["reply"]}
        else:
            del chat_cache[user_msg]

    # 3. Fetch live FAQs safely from MongoDB
    faqs = list(faqs_collection.find(
        {"status": "published"}, 
        {"_id": 0, "category": 1, "question": 1, "answer": 1}
    ))
    
    if not faqs:
        context_text = "No campus FAQs are currently available."
    else:
        context_text = "\n".join([
            f"Category: {faq.get('category', 'General')}\nQuestion: {faq.get('question', '')}\nAnswer: {faq.get('answer', '')}\n"
            for faq in faqs if faq.get('question') and faq.get('answer')
        ])
    
    # 4. Multilingual Dynamic Prompt
    full_prompt = (
        "You are an official, friendly AI assistant for the campus. "
        "Your job is to answer student questions accurately using ONLY the provided Campus FAQs context below.\n\n"
        "LANGUAGE & COMMUNICATION RULES:\n"
        "- The user may ask questions in English, Tagalog, or Taglish (mixed Tagalog-English). You must fully understand queries in any of these languages.\n"
        "- If the user asks in Tagalog or Taglish, respond back in polite Tagalog or Taglish while keeping facts strictly tied to the context.\n"
        "- If the user uses vulgar, disrespectful, offensive, or inappropriate language (in any language), do not lecture them. Instead, respond politely: "
        "'Please let's keep our conversation respectful and polite! How can I help you with campus information today?' (or in Tagalog: 'Mangyaring panatilihin nating magalang at maayos ang ating usapan! Paano ko po kayo matutulungan tungkol sa campus ngayon?').\n"
        "- If a question cannot be answered using the context, politely state that you don't know "
        "and suggest they reach out directly to the campus administration office.\n\n"
        f"--- CAMPUS KNOWLEDGE BASE ---\n{context_text}\n\n"
        f"--- STUDENT INPUT ---\n{request.message}"
    )

    # 5. Retry logic for high-demand 503 errors
    max_retries = 4
    backoff_delay = 1.5

    for attempt in range(max_retries):
        try:
            response = client_ai.models.generate_content(
                model="gemini-flash-latest",  # Uses the most robust and stable routing endpoint
                contents=full_prompt,
            )
            
            ai_reply = response.text

            chat_cache[user_msg] = {
                "reply": ai_reply,
                "timestamp": time.time()
            }

            return {"reply": ai_reply}
            
        except Exception as e:
            error_str = str(e)
            print(f"Attempt {attempt + 1} failed: {error_str}")
            
            if "503" in error_str or "UNAVAILABLE" in error_str:
                if attempt < max_retries - 1:
                    time.sleep(backoff_delay)
                    backoff_delay *= 2 
                    continue
                else:
                    # Graceful fallback instead of returning a hard 500 server error
                    return {"reply": "Our AI service is experiencing high traffic right now. Please try sending your message again in a few seconds!"}
            
            raise HTTPException(status_code=500, detail=error_str)

@app.get("/")
async def root():
    return {"status": "Gemini Campus Chatbot API is running!"}