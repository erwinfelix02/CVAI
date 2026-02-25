import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * POST /api/students/by-enrollment
 * body: { enrollmentIds: string[] }
 * returns: Student[]
 */
router.post("/by-enrollment", async (req, res) => {
  try {
    const { enrollmentIds } = req.body || {};

    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return res.status(400).json({ message: "enrollmentIds is required." });
    }

    const students = await Student.find({
      enrollmentId: { $in: enrollmentIds },
    }).sort({ createdAt: -1 });

    return res.json(students);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});


router.get("/count", async (req, res) => {
  try {
    const total = await Student.countDocuments();
    return res.json({ total });
  } catch (err) {
    console.error("students count error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;