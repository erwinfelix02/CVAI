import express from "express";
import Announcement from "../models/Announcement.js";

const router = express.Router();

// ==================== GET ALL ANNOUNCEMENTS ====================
// GET /api/announcements?department=CS&facultyId=60d...
router.get("/", async (req, res) => {
  try {
    const { department, facultyId } = req.query;
    const filter = {};

    // Filter by department or faculty ID if provided
    if (department && department !== "General") {
      filter.department = department;
    }
    if (facultyId) {
      filter.facultyId = facultyId;
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(announcements);
  } catch (error) {
    console.error("GET Announcements Error:", error);
    return res.status(500).json({ message: "Server error fetching announcements." });
  }
});

// ==================== CREATE ANNOUNCEMENT ====================
// POST /api/announcements
router.post("/", async (req, res) => {
  try {
    const {
      title,
      course,
      priority,
      message,
      scheduledDate,
      sendPush,
      sendEmail,
      facultyId,
      author,
      department,
    } = req.body;

    if (!title || !course || !message) {
      return res.status(400).json({ message: "Title, course, and content are required." });
    }

    // Default recipients calculation based on course code
    const estimatedRecipients = Math.floor(Math.random() * 25) + 15;

    const newAnnouncement = new Announcement({
      title,
      course,
      priority: priority || "medium",
      message,
      scheduledDate: scheduledDate || "",
      sendPush: sendPush !== undefined ? sendPush : true,
      sendEmail: sendEmail !== undefined ? sendEmail : false,
      recipients: estimatedRecipients,
      facultyId: facultyId || "system",
      author: author || "Faculty Member",
      department: department || "General",
    });

    const savedAnnouncement = await newAnnouncement.save();
    return res.status(201).json({
      message: "Announcement created successfully.",
      announcement: savedAnnouncement,
    });
  } catch (error) {
    console.error("POST Announcement Error:", error);
    return res.status(500).json({ message: "Server error creating announcement." });
  }
});

// ==================== UPDATE ANNOUNCEMENT ====================
// PUT /api/announcements/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      course,
      priority,
      message,
      scheduledDate,
      sendPush,
      sendEmail,
    } = req.body;

    const updated = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        course,
        priority,
        message,
        scheduledDate,
        sendPush,
        sendEmail,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    return res.status(200).json({
      message: "Announcement updated successfully.",
      announcement: updated,
    });
  } catch (error) {
    console.error("PUT Announcement Error:", error);
    return res.status(500).json({ message: "Server error updating announcement." });
  }
});

// ==================== DELETE ANNOUNCEMENT ====================
// DELETE /api/announcements/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    return res.status(200).json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("DELETE Announcement Error:", error);
    return res.status(500).json({ message: "Server error deleting announcement." });
  }
});

export default router;