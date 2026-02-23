import os
import torch
import re
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# =========================================
# MODEL CONFIGURATION
# =========================================
LLM_NAME = "google/flan-t5-small"
EMBED_MODEL = "all-MiniLM-L6-v2"

device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(LLM_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(LLM_NAME).to(device)
embedder = SentenceTransformer(EMBED_MODEL, device=device)

SIMILARITY_THRESHOLD = 0.45
HIGH_MATCH_THRESHOLD = 0.65

# =========================================
# HELPERS
# =========================================
def normalize_repeated_chars(text: str) -> str:
    # "hellooo" -> "helo", "hiiii" -> "hi"
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
    # "helllo"/"hellooo" -> "helo"
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

# =========================================
# OPTIONAL: RAG ANSWER GENERATOR
# =========================================
def generate_rag_answer(question: str, context: str) -> str:
    prompt = (
        "You are an FAQ bot.\n"
        "Copy the answer from the context. "
        "If the context does not contain the answer, reply exactly: I don't know.\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{question}\n\n"
        "Answer:"
    )

    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True).to(device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=80,
        do_sample=False,
        num_beams=1,
        repetition_penalty=1.2,
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

# =========================================
# FAQ RETRIEVAL
# =========================================
def retrieve_faq(message: str, faqs: list):
    if not faqs:
        return None, 0.0

    cleaned_msg = clean_input(message)
    user_embedding = embedder.encode(cleaned_msg, convert_to_tensor=True)

    faq_texts = [f["question"].lower() for f in faqs]
    faq_embeddings = embedder.encode(faq_texts, convert_to_tensor=True)

    scores = util.cos_sim(user_embedding, faq_embeddings)[0]

    # Keyword Boosting (scaled by overlap)
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
    original_message = message
    message_clean = message.lower().strip()
    last_bot_msg = history[-1].get("assistant", "") if history else ""

    # 0) META QUESTIONS
    if is_meta_question(message_clean):
        return {"answer": "Sure — what’s your question?", "follow_up": None, "confidence": 1.0}

    # 0.5) ACKNOWLEDGEMENTS
    if is_acknowledgement(message_clean):
        return {"answer": "Alright — what question would you like to ask?", "follow_up": None, "confidence": 1.0}

    # 1) GREETINGS (robust)
    if is_greeting(message_clean):
        return {"answer": f"Hello! I am your {role} assistant. How can I help?", "follow_up": None, "confidence": 1.0}

    # 2) GOODBYE / STOP
    denials = ["no", "nothing", "none", "bye", "stop"]
    if (
        has_word(clean_input(message_clean), denials)
        or ("anything else" in last_bot_msg.lower() and has_word(clean_input(message_clean), denials))
    ):
        return {"answer": "Glad I could help. Have a great day!", "follow_up": None, "confidence": 1.0}

    # 3) CONFIRMATION ("Yes" after suggestion)
    confirmations = ["yes", "yeah", "yep", "sure"]
    if clean_input(message_clean) in confirmations:
        m = re.search(r"Did you mean:\s*'(.+?)'", last_bot_msg)
        if m:
            message_clean = m.group(1).lower().strip()
        else:
            return {"answer": "I'm listening! What is your question?", "follow_up": None, "confidence": 1.0}

    # 4) SEARCH
    best_faq, faq_score = retrieve_faq(message_clean, faqs)

    # HIGH MATCH
    if best_faq and faq_score >= HIGH_MATCH_THRESHOLD:
        return {
            "answer": best_faq["answer"],
            "follow_up": "Is there anything else you'd like to know?",
            "confidence": round(faq_score, 3),
        }

    # PARTIAL MATCH
    if best_faq and faq_score >= SIMILARITY_THRESHOLD:
        return {
            "answer": f"Did you mean: '{best_faq['question']}'? (Reply 'Yes' to confirm)",
            "follow_up": None,
            "confidence": round(faq_score, 3),
        }

    # NO MATCH (short fallback)
    return {
        "answer": "Sorry — I don’t have information for that question yet.",
        "follow_up": None,
        "confidence": 1.0
    }