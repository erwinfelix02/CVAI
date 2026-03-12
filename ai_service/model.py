import json
import hashlib
import re
import torch
from sentence_transformers import SentenceTransformer, util

# =========================================
# MODEL CONFIGURATION
# =========================================
EMBED_MODEL = "all-MiniLM-L6-v2"
device = "cuda" if torch.cuda.is_available() else "cpu"
embedder = SentenceTransformer(EMBED_MODEL, device=device)

SIMILARITY_THRESHOLD = 0.45
HIGH_MATCH_THRESHOLD = 0.65

# In-memory FAQ embedding cache
# key => {
#   "faq_texts": [...],
#   "faq_embeddings": tensor
# }
_faq_embedding_cache = {}


# =========================================
# HELPERS
# =========================================
def normalize_repeated_chars(text: str) -> str:
    return re.sub(r"(.)\1+", r"\1", text)


def clean_input(text: str) -> str:
    text = text.lower().strip()
    text = normalize_repeated_chars(text)

    fillers = [
        "uhm", "umm", "uh", "err", "actually", "basically",
        "please", "can you tell me", "what is", "about the"
    ]
    for word in fillers:
        text = text.replace(word, "")

    return re.sub(r"\s+", " ", text).strip()


def has_word(text: str, words: list[str]) -> bool:
    return any(re.search(rf"\b{re.escape(w)}\b", text) for w in words)


def is_greeting(text: str) -> bool:
    t = clean_input(text)
    if has_word(t, ["hi", "hello", "hey"]):
        return True
    if has_word(t, ["helo", "hiya"]):
        return True
    return False


def is_meta_question(text: str) -> bool:
    t = clean_input(text)
    patterns = [
        r"\bi have (a )?question\b",
        r"\bi have (a )?question again\b",
        r"\bi have another question\b",
        r"\bone more question\b",
        r"\bcan i ask\b",
        r"\bmay i ask\b",
        r"\bi want to ask\b",
        r"\bi need help\b",
        r"\bhelp me\b",
        r"\bquestion\b$",
    ]
    return any(re.search(p, t) for p in patterns)


def is_acknowledgement(text: str) -> bool:
    t = clean_input(text)
    return t in {"ok", "okay", "k", "kk", "alright", "thanks", "thank you", "ty", "got it"}


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
            "answer": "Sure — what’s your question?",
            "follow_up": None,
            "confidence": 1.0
        }

    # 0.5) ACKNOWLEDGEMENTS
    if is_acknowledgement(message_clean):
        return {
            "answer": "Alright — what question would you like to ask?",
            "follow_up": None,
            "confidence": 1.0
        }

    # 1) GREETINGS
    if is_greeting(message_clean):
        return {
            "answer": f"Hello! I am your {role} assistant. How can I help?",
            "follow_up": None,
            "confidence": 1.0
        }

    # 2) GOODBYE / STOP
    denials = ["no", "nothing", "none", "bye", "stop"]
    if (
        has_word(clean_input(message_clean), denials)
        or ("anything else" in last_bot_msg.lower() and has_word(clean_input(message_clean), denials))
    ):
        return {
            "answer": "Glad I could help. Have a great day!",
            "follow_up": None,
            "confidence": 1.0
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
                "confidence": 1.0
            }

    # 4) SEARCH
    best_faq, faq_score = retrieve_faq(message_clean, faqs)

    if best_faq and faq_score >= HIGH_MATCH_THRESHOLD:
        return {
            "answer": best_faq["answer"],
            "follow_up": "Is there anything else you'd like to know?",
            "confidence": round(faq_score, 3),
        }

    if best_faq and faq_score >= SIMILARITY_THRESHOLD:
        return {
            "answer": f"Did you mean: '{best_faq['question']}'? (Reply 'Yes' to confirm)",
            "follow_up": None,
            "confidence": round(faq_score, 3),
        }

    return {
        "answer": "Sorry — I don’t have information for that question yet.",
        "follow_up": None,
        "confidence": 1.0
    }