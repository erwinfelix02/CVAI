import express from "express";
import axios from "axios";
import Faq from "../models/Faq.js";
import ChatLog from "../models/ChatLog.js";
import NodeCache from "node-cache";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Cache FAQs for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

router.post("/chat", authMiddleware, async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, role, sessionId } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || !role || !sessionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1) Fetch only the recent history fields needed
    const previousChats = await ChatLog.find({ userId, sessionId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("message answer")
      .lean();

    const history = previousChats.reverse().map((log) => ({
      user: log.message,
      assistant: log.answer,
    }));

    // 2) Cache FAQs by role
    const faqCacheKey = `faqs:${role}`;
    let formattedFaqs = cache.get(faqCacheKey);

    if (!formattedFaqs) {
      const faqs = await Faq.find({
        role_visibility: role,
        status: "published",
      })
        .select("question answer")
        .lean();

      formattedFaqs = faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      }));

      cache.set(faqCacheKey, formattedFaqs);
    }

    // 3) Call FastAPI
    const aiStart = Date.now();

    const aiRes = await axios.post("http://127.0.0.1:8000/generate", {
      message,
      faqs: formattedFaqs,
      role,
      history,
    });

    const aiEnd = Date.now();

    const aiSeconds = ((aiEnd - aiStart) / 1000).toFixed(3);

    const answer = aiRes.data.answer || "No response.";
    const confidence = aiRes.data.confidence ?? 0;
    const follow_up = aiRes.data.follow_up || null;

    const endTime = Date.now();
    const totalSeconds = ((endTime - startTime) / 1000).toFixed(3);

    console.log("===== AI CHAT RESPONSE TIME =====");
    console.log(`FastAPI response: ${aiSeconds} seconds`);
    console.log(`Total backend time before response: ${totalSeconds} seconds`);
    console.log("=================================");

    // 4) Respond first for faster perceived speed
    res.json({ answer, confidence, cached: false, follow_up });

    // 5) Save chat log after response
    ChatLog.create({
      userId,
      sessionId,
      message,
      answer,
      confidence,
      role,
      cached: false,
      follow_up,
    }).catch((err) => {
      console.error("Failed to save chat log:", err.message);
    });
  } catch (error) {
    const failTime = ((Date.now() - startTime) / 1000).toFixed(3);

    console.error("AI Route Error:", error.response?.data || error.message);
    console.log(`Failed after ${failTime} seconds`);

    return res.status(500).json({ error: "AI processing failed" });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const logs = await ChatLog.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    const grouped = {};
    logs.forEach((log) => {
      if (!grouped[log.sessionId]) grouped[log.sessionId] = [];
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