import express from "express";
import Enrollment from "../models/Enrollment.js"; // Adjust path to your Enrollment model if necessary
import {
  evaluateEnrollment,
  reserveStudentId,
} from "../controllers/enrollmentController.js";

const router = express.Router();

// GET all enrollments (with optional status & search query filters)
router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;
    let queryFilter = {};

    if (status) {
      queryFilter.status = status; // e.g., "Scheduled", "Enrolled", "Archived"
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");
      queryFilter.$or = [
        { studentName: searchRegex },
        { registrationId: searchRegex },
        { "personal.firstName": searchRegex },
        { "personal.lastName": searchRegex },
      ];
    }

    const enrollments = await Enrollment.find(queryFilter).sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ message: "Failed to fetch enrollments." });
  }
});

// GET enrollment statistics (pending, enrolled, etc.)
router.get("/stats", async (req, res) => {
  try {
    const pending = await Enrollment.countDocuments({ status: "Scheduled" });
    const enrolled = await Enrollment.countDocuments({ status: "Enrolled" });
    
    res.json({
      pending,
      enrolled,
      semesterLabel: "Current Semester", // Modify or link to your settings if applicable
    });
  } catch (err) {
    console.error("Error fetching enrollment stats:", err);
    res.status(500).json({ message: "Failed to load enrollment statistics." });
  }
});

// PUT: Archive a pending evaluation
router.put("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy } = req.body;

    const updated = await Enrollment.findByIdAndUpdate(
      id,
      { 
        status: "Archived",
        updatedBy: updatedBy || "system"
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Enrollment record not found." });
    }

    res.json({ message: "Enrollment archived successfully.", updated });
  } catch (err) {
    console.error("Error archiving enrollment:", err);
    res.status(500).json({ message: err.message || "Failed to archive enrollment." });
  }
});

// PUT: Restore an archived evaluation back to Scheduled (Pending)
router.put("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy } = req.body;

    const updated = await Enrollment.findByIdAndUpdate(
      id,
      { 
        status: "Scheduled",
        updatedBy: updatedBy || "system"
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Enrollment record not found." });
    }

    res.json({ message: "Enrollment restored successfully.", updated });
  } catch (err) {
    console.error("Error restoring enrollment:", err);
    res.status(500).json({ message: err.message || "Failed to restore enrollment." });
  }
});

// DELETE: Permanently delete an archived enrollment record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Enrollment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Enrollment record not found." });
    }

    res.json({ message: "Deleted successfully." });
  } catch (err) {
    console.error("Error deleting enrollment:", err);
    res.status(500).json({ message: "Failed to delete enrollment record." });
  }
});

router.get("/:id/reserve-student-id", reserveStudentId);
router.post("/:id/evaluate", evaluateEnrollment);

export default router;