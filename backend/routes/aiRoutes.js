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

    if (!message || !role || !sessionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Fetch Conversation History
    const previousChats = await ChatLog.find({ userId, sessionId })
      .sort({ createdAt: -1 })
      .limit(3);
    
    const history = previousChats.reverse().map(log => ({
      user: log.message,
      assistant: log.answer
    }));

    // 2. Fetch Pure, Fresh Facts (FAQs)
    const faqs = await Faq.find({ role_visibility: role, status: "published" });
    const formattedFaqs = faqs.map((f) => ({
      question: f.question, answer: f.answer,
    }));

    // 3. Call FastAPI
    const aiRes = await axios.post("http://127.0.0.1:8000/generate", {
      message,
      faqs: formattedFaqs,
      role,
      history
    });

    const answer = aiRes.data.answer || "No response.";
    const confidence = aiRes.data.confidence ?? 0;
    const follow_up = aiRes.data.follow_up || null;

    // Save to history
    await ChatLog.create({
      userId, sessionId, message, answer, confidence, role, cached: false,follow_up
    });

    return res.json({ answer, confidence, cached: false,follow_up });
  } catch (error) {
    console.error("AI Route Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "AI processing failed" });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const logs = await ChatLog.find({ userId }).sort({ createdAt: 1 }).lean();
    
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