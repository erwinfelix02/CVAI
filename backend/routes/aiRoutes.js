import express from "express";
import axios from "axios";
import Faq from "../models/Faq.js";
import ChatLog from "../models/ChatLog.js";
import NodeCache from "node-cache";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 });

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, role, sessionId } = req.body;
    const userId = req.user._id || req.user.id;

    // 🔥 VALIDATION
    if (!message || !role || !sessionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cacheKey = `${role}_${sessionId}_${message}`;
    const cached = cache.get(cacheKey);

    // ✅ CACHE HIT
    if (cached) {
      await ChatLog.create({
        userId,
        sessionId,
        message,
        answer: cached.answer,
        confidence: cached.confidence ?? 0,
        role,
        cached: true,
      });

      return res.json({ ...cached, cached: true });
    }

    // ✅ FETCH FAQS
    const faqs = await Faq.find({
      role_visibility: role,
      status: "published",
    });

    const formattedFaqs = faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
    }));

    // ✅ CALL FASTAPI
    const aiRes = await axios.post("http://127.0.0.1:8000/generate", {
      message,
      faqs: formattedFaqs,
      role,
    });

    const answer = aiRes.data.answer || "No response.";
    const confidence = aiRes.data.confidence ?? 0;

    // ✅ CACHE IT
    cache.set(cacheKey, { answer, confidence });

    // ✅ SAVE TO DB
    await ChatLog.create({
      userId,
      sessionId,
      message,
      answer,
      confidence,
      role,
      cached: false,
    });

    res.json({ answer, confidence, cached: false });
  } catch (error) {
    console.error("AI Route Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI processing failed" });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const logs = await ChatLog.find({ userId }).sort({ createdAt: 1 }).lean();

    const grouped = {};

    logs.forEach((log) => {
      if (!grouped[log.sessionId]) {
        grouped[log.sessionId] = [];
      }
      grouped[log.sessionId].push(log);
    });

    res.json(grouped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.delete("/history/:sessionId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const { sessionId } = req.params;

    await ChatLog.deleteMany({ userId, sessionId });

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

export default router;
