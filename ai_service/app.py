from difflib import SequenceMatcher
import hashlib
import json
import os
import re
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import torch
from sentence_transformers import SentenceTransformer, util

# =========================================
# ENVIRONMENT & APP CONFIG
# =========================================
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, "../.env")
if not os.path.exists(dotenv_path):
    dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI(title="Campus AI Chatbot (Production Backend)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL") or "http://localhost:5000"

# =========================================
# MODEL CONFIGURATION
# =========================================
EMBED_MODEL = "all-MiniLM-L6-v2"
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Loading embedding model '{EMBED_MODEL}' on device: {device}...")
embedder = SentenceTransformer(EMBED_MODEL, device=device)
print("Model loaded successfully!")

SIMILARITY_THRESHOLD = 0.45
HIGH_MATCH_THRESHOLD = 0.65

# In-memory FAQ embedding cache
_faq_embedding_cache = {}

# =========================================
# PROFANITY FILTER
# =========================================
BAD_WORD_ROOTS = [
    "gago",
    "tanga",
    "bobo",
    "ulol",
    "hayop",
    "kupal",
    "pota",
    "punyeta",
    "inutil",
    "lecheng",
    "shit",
    "fuck",
    "bitch",
    "asshole",
    "bastard",
    "titi",
    "puki",
    "kingina",
    "tangina",
    "putangina",
    "tarantado",
    "leche",
    "pakyu",
    "inamo",
]


def contains_profanity(text: str) -> bool:
    text_lower = text.lower()
    words = re.findall(r"\w+", text_lower)
    for word in words:
        for bad in BAD_WORD_ROOTS:
            if bad == word or (len(bad) > 3 and bad in word):
                return True
    return False


# =========================================
# HELPERS
# =========================================
def normalize_repeated_chars(text: str) -> str:
    return re.sub(r"(.)\1+", r"\1", text)


def clean_input(text: str) -> str:
    text = text.lower().strip()
    text = normalize_repeated_chars(text)

    fillers = [
        "uhm",
        "umm",
        "uh",
        "err",
        "actually",
        "basically",
        "please",
        "can you tell me",
        "what is",
        "about the",
    ]
    for word in fillers:
        text = text.replace(word, "")

    return re.sub(r"\s+", " ", text).strip()


def has_word(text: str, words: list[str]) -> bool:
    return any(re.search(rf"\b{re.escape(w)}\b", text) for w in words)


def is_greeting(text: str):
    t = clean_input(text)
    words = set(re.findall(r"\w+", t))

    for word in words:
        if (
            SequenceMatcher(None, word, "hello").ratio() >= 0.7
            or word in ["helo", "hallo", "ello", "heol"]
        ):
            return "hello"
        if (
            SequenceMatcher(None, word, "hi").ratio() >= 0.8
            or word in ["hii", "hiii", "hey", "heyy", "hie"]
        ):
            return "hi"

    if has_word(t, ["kumusta", "kamusta", "hiya"]):
        return "kumusta"

    return None


def is_meta_question(text: str) -> bool:
    t = clean_input(text)

    meta_triggers = [
        "i need help",
        "i need help with",
        "help",
        "i want help",
        "i have a problem",
        "i have something",
        "something",
        "shomthing",
        "tell you",
        "i have some questions",
        "i have questions",
        "i have a question",
    ]
    if any(trigger in t for trigger in meta_triggers):
        return True

    patterns = [
        r"\bi have (a |some )?questions?\b",
        r"\bi have (a )?question( again)?\b",
        r"\bi have another question\b",
        r"\bone more question\b",
        r"\bcan i ask\b",
        r"\bmay i ask\b",
        r"\bi want to ask\b",
        r"\bi need help\b",
        r"\bneed help\b",
        r"\bhelp me\b",
        r"\bquestions?\b$",
        r"\bproblem with\b",
        r"\bi have an? issue\b",
        r"\bissue with\b",
        r"\bhelp\b$",
    ]
    return any(re.search(p, t) for p in patterns)


def is_gratitude(text: str) -> bool:
    t = clean_input(text)
    return any(word in t for word in ["thanks", "thank you", "ty", "salamat"])


def is_acknowledgement(text: str) -> bool:
    t = clean_input(text)
    return t in {
        "ok",
        "okay",
        "k",
        "kk",
        "alright",
        "got it",
    }


def build_faq_cache_key(faqs: list) -> str:
    payload = json.dumps(
        [{"question": f["question"], "answer": f["answer"]} for f in faqs],
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.md5(payload.encode("utf-8")).hexdigest()


def get_faq_embeddings(faqs: list):
    key = build_faq_cache_key(faqs)
    cached = _faq_embedding_cache.get(key)
    if cached:
        return cached["faq_texts"], cached["faq_embeddings"]

    faq_texts = [clean_input(f["question"]) for f in faqs]
    faq_embeddings = embedder.encode(faq_texts, convert_to_tensor=True)

    _faq_embedding_cache[key] = {
        "faq_texts": faq_texts,
        "faq_embeddings": faq_embeddings,
    }
    return faq_texts, faq_embeddings


# =========================================
# FAQ RETRIEVAL
# =========================================
def retrieve_faq(message: str, faqs: list):
    if not faqs:
        return None, 0.0

    cleaned_msg = clean_input(message)

    # 1) Fast exact normalized match first
    for faq in faqs:
        if clean_input(faq["question"]) == cleaned_msg:
            return faq, 1.0

    # 2) Only embed user message once exact match fails
    user_embedding = embedder.encode(cleaned_msg, convert_to_tensor=True)

    # 3) Reuse cached FAQ embeddings
    faq_texts, faq_embeddings = get_faq_embeddings(faqs)

    scores = util.cos_sim(user_embedding, faq_embeddings)[0]

    # 4) Keyword overlap boost
    message_words = set(cleaned_msg.split())
    for i, q_text in enumerate(faq_texts):
        q_words = set(q_text.split())
        overlap = len(message_words & q_words)
        if overlap:
            scores[i] += min(0.15, 0.03 * overlap)

    best_score = torch.max(scores).item()
    best_index = torch.argmax(scores).item()

    return faqs[best_index], best_score


# =========================================
# RESPONSE GENERATOR
# =========================================
def generate_response(message: str, faqs: list, role: str, history: list):
    message_clean = message.lower().strip()
    last_bot_msg = history[-1].get("assistant", "") if history else ""

    # 0) META QUESTIONS
    if is_meta_question(message_clean):
        return {
            "answer": "Sure — what would you like to ask or discuss?",
            "follow_up": None,
        }

    # 0.25) APOLOGIES / CONVERSATIONAL FILLERS
    apologies = ["sorry", "sori", "my bad", "mb", "pasensya", "patawad"]
    if has_word(message_clean, apologies) or message_clean in apologies:
        return {
            "answer": "No worries at all! How can I help you with your campus questions?",
            "follow_up": None,
        }

    # 1) GREETINGS
    greeting_type = is_greeting(message_clean)
    if greeting_type == "hello":
        return {
            "answer": f"Hi! I am your {role} assistant. How can I help you today?",
            "follow_up": None,
        }
    elif greeting_type == "hi":
        return {
            "answer": f"Hello! I am your {role} assistant. How can I help you today?",
            "follow_up": None,
        }
    elif greeting_type == "kumusta":
        return {
            "answer": f"Kumusta! Ako ang iyong {role} assistant. Paano kita matutulungan ngayon?",
            "follow_up": None,
        }

    # 2) GOODBYE / STOP / GRATITUDE
    denials = ["no", "nothing", "none", "bye", "stop"]
    if (
        has_word(clean_input(message_clean), denials) 
        or is_gratitude(message_clean)
        or (
            "anything else" in last_bot_msg.lower()
            and has_word(clean_input(message_clean), denials)
        )
    ):
        return {
            "answer": "Glad I could help. Have a great day!",
            "follow_up": None,
        }

    # 2.5) SIMPLE ACKNOWLEDGEMENTS
    if is_acknowledgement(message_clean):
        return {
            "answer": "Alright! Let me know if you need anything else.",
            "follow_up": None,
        }

    # 3) CONFIRMATION
    confirmations = ["yes", "yeah", "yep", "sure"]
    if clean_input(message_clean) in confirmations:
        m = re.search(r"Did you mean:\s*'(.+?)'", last_bot_msg)
        if m:
            message_clean = m.group(1).lower().strip()
        else:
            return {
                "answer": "I'm listening! What is your question?",
                "follow_up": None,
            }

    # 4) SEARCH
    best_faq, faq_score = retrieve_faq(message_clean, faqs)

    if best_faq and faq_score >= HIGH_MATCH_THRESHOLD:
        ans = best_faq["answer"]
        follow = "Is there anything else you'd like to know?"
        return {"answer": f"{ans}\n\n{follow}", "follow_up": follow}

    if best_faq and faq_score >= SIMILARITY_THRESHOLD:
        return {
            "answer": f"Did you mean: '{best_faq['question']}'? (Reply 'Yes' to confirm)\n\n{best_faq['answer']}",
            "follow_up": None,
        }

    return {
        "answer": (
            "I couldn't find a specific answer for that in our database. Please check your spelling or contact administration.\n\n"
            "(Hindi ko po mahanap ang impormasyong iyan sa aming database.)"
        ),
        "follow_up": None,
    }


# =========================================
# API ENDPOINT
# =========================================
class ChatRequest(BaseModel):
    message: str
    history: list = []  # Optional conversation history from frontend


@app.post("/api/chat")
async def chat_with_campus_bot(request: ChatRequest):
    user_msg = request.message.strip()
    role = "campus"

    # 1. Profanity Check
    if contains_profanity(user_msg):
        return {
            "reply": (
                "⚠️ Please maintain respectful language when chatting with the campus assistant. "
                "Pakiusap po na maging magalang sa ating pag-uusap para maayos ko kayong matulungan."
            )
        }

    # 2. Fetch FAQs from Node.js backend
    faqs = []
    try:
        response = requests.get(f"{NODE_BACKEND_URL}/api/faqs/ai-context", timeout=5)
        if response.status_code == 200:
            faqs = response.json()
    except Exception as err:
        print(f"Failed to fetch from Node backend: {err}")

    if not faqs:
        return {
            "reply": (
                "⚠️ The chatbot backend cannot reach the Node.js decryption endpoint. "
                "Please make sure your Node server is running on port 5000."
            )
        }

    # 3. Generate response using updated pipeline
    result = generate_response(user_msg, faqs, role, request.history)
    return {"reply": result["answer"]}


@app.get("/")
async def root():
    return {"status": "Production Campus Chatbot API is running!"}