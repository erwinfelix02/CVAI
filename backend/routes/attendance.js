import express from "express";
import Attendance from "../models/Attendance.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

const router = express.Router();

/**
 * GET /api/attendance
 * Supports filtering by facultyId, subject, date, studentId, studentNo
 */
router.get("/", async (req, res) => {
  try {
    const { facultyId, subject, date, studentId, studentNo } = req.query;

    const query = {};

    if (facultyId) {
      query.facultyId = facultyId;
    }

    if (subject) {
      const cleanSubject = String(subject).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.subject = { $regex: new RegExp(`^${cleanSubject}$`, "i") };
    }

    if (date) {
      query.date = String(date).trim();
    }

    if (studentId || studentNo) {
      const studentConditions = [];

      if (studentId) {
        studentConditions.push({ "students.studentId": String(studentId).trim() });
      }

      if (studentNo) {
        const cleanNo = String(studentNo).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        studentConditions.push({
          "students.studentNo": { $regex: new RegExp(`^${cleanNo}$`, "i") },
        });
      }

      query.$or = studentConditions;
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    return res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return res.status(500).json({ message: "Failed to fetch attendance records." });
  }
});

/**
 * POST /api/attendance
 * Create new session or update existing attendance session
 */
router.post("/", async (req, res) => {
  const ip = getClientIp(req);
  try {
    const {
      facultyId,
      facultyName,
      subject,
      section,
      date,
      students,
      overwrite,
    } = req.body;

    if (!facultyId || !subject || !date || !Array.isArray(students)) {
      return res
        .status(400)
        .json({ message: "Missing required attendance fields." });
    }

    const existingRecord = await Attendance.findOne({ facultyId, subject, date });

    if (existingRecord && !overwrite) {
      return res.status(409).json({
        message: `Attendance for ${subject} on ${date} has already been recorded and locked.`,
        record: existingRecord,
      });
    }

    const updatedRecord = await Attendance.findOneAndUpdate(
      { facultyId, subject, date },
      {
        facultyId,
        facultyName,
        subject,
        section: section || "",
        date,
        isRecorded: true,
        students,
      },
      { upsert: true, new: true, runValidators: true }
    );

    addLog({
      action: "Attendance Saved",
      user: facultyName || facultyId,
      role: "Faculty",
      type: "Data",
      details: `Recorded attendance for ${subject} on ${date} (${students.length} students)`,
      ip,
      status: "success",
    });

    return res.status(200).json(updatedRecord);
  } catch (err) {
    console.error("Error saving attendance:", err);
    addLog({
      action: "Attendance Save Error",
      user: req.body?.facultyName || "Faculty",
      role: "Faculty",
      type: "System",
      details: err.message || "Failed to save attendance record.",
      ip,
      status: "error",
    });

    return res
      .status(500)
      .json({ message: err.message || "Failed to save attendance." });
  }
});

export default router;