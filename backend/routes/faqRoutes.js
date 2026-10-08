import express from "express";
import Faq from "../models/Faq.js";

const router = express.Router();

// ✅ GET all FAQs (supports optional ?category= query parameter)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const faqs = await Faq.find(query);
    
    // Map and decrypt questions and answers safely
    const decryptedFaqs = faqs.map(faq => ({
      id: faq._id.toString(),
      category: faq.category,
      question: typeof faq.question === 'string' ? faq.question : String(faq.get('question')),
      answer: typeof faq.answer === 'string' ? faq.answer : String(faq.get('answer')),
      status: faq.status,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt
    }));

    res.json(decryptedFaqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET published FAQs for AI Context
router.get("/ai-context", async (req, res) => {
  try {
    const faqs = await Faq.find({ status: "published" });
    
    const decryptedFaqs = faqs.map(faq => ({
      id: faq._id.toString(),
      category: faq.category,
      question: typeof faq.question === 'string' ? faq.question : String(faq.get('question')),
      answer: typeof faq.answer === 'string' ? faq.answer : String(faq.get('answer')),
      status: faq.status
    }));

    res.json(decryptedFaqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create FAQ
router.post("/", async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Update FAQ
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFaq = await Faq.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    res.json(updatedFaq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete FAQ
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFaq = await Faq.findByIdAndDelete(id);
    
    if (!deletedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;