import express from "express";
import Room from "../models/Room.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/rooms?department=IT Department
router.get("/",  async (req, res) => {
  try {
    const { department } = req.query;

    let query = {};
    if (department) {
      query.department = department;
    }

    const rooms = await Room.find(query).sort({ name: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms." });
  }
});

// POST /api/rooms
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create room." });
  }
});

export default router;