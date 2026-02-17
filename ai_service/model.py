from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from sentence_transformers import SentenceTransformer, util
import torch

# LLM
model_path = "google/flan-t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

# Embedding model for similarity
embedder = SentenceTransformer("all-MiniLM-L6-v2")

SIMILARITY_THRESHOLD = 0.55  # tune later

def generate_response(message, faqs, role):
    """
    faqs = list of dicts: [{question, answer}]
    """

    if not faqs:
        return {
            "answer": "No knowledge available.",
            "confidence": 0.0
        }

    # Create embeddings
    user_embedding = embedder.encode(message, convert_to_tensor=True)

    faq_texts = [f["question"] for f in faqs]
    faq_embeddings = embedder.encode(faq_texts, convert_to_tensor=True)

    # Compute similarity
    scores = util.cos_sim(user_embedding, faq_embeddings)[0]
    best_score = torch.max(scores).item()
    best_index = torch.argmax(scores).item()

    # If confidence low → refuse
    if best_score < SIMILARITY_THRESHOLD:
        return {
            "answer": "I'm sorry, I couldn't find this information in the official knowledge base.",
            "confidence": round(best_score, 3)
        }

    best_faq = faqs[best_index]

    # Role-aware prompting
    prompt = f"""
You are CampusHub AI assisting a {role}.

Answer naturally and professionally using ONLY the information below.

Official FAQ:
Question: {best_faq['question']}
Answer: {best_faq['answer']}

User Question:
{message}

Answer:
"""

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)

    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        temperature=0.3
    )

    final_answer = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return {
        "answer": final_answer,
        "confidence": round(best_score, 3)
    }
