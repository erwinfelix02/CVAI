import express from "express";
import mongoose from "mongoose";
import Preregistration from "../models/Preregistration.js";
import Enrollment from "../models/Enrollment.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// POST schedule + send email + save enrollment
router.post("/schedule", async (req, res) => {
  try {
    const { studentIds, date, time, location, notes } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "studentIds is required" });
    }
    if (!date || !time || !location) {
      return res
        .status(400)
        .json({ message: "date, time, and location are required" });
    }

    const preregs = await Preregistration.find({
      registrationId: { $in: studentIds },
      status: "Approved",
    });

    if (preregs.length === 0) {
      return res
        .status(404)
        .json({ message: "No approved students found for those IDs." });
    }

    const results = [];
    const sentIds = [];

    for (const p of preregs) {
      const to = p.personal?.email;
      const studentName = `${p.personal?.firstName ?? ""} ${p.personal?.lastName ?? ""}`.trim();

      if (!to) {
        results.push({
          registrationId: p.registrationId,
          ok: false,
          error: "Missing email",
        });
        continue;
      }

      if (p.scheduleSentAt) {
        results.push({
          registrationId: p.registrationId,
          ok: false,
          error: "Schedule already sent",
        });
        continue;
      }

      const html = `
        <h2>📅 Enrollment Schedule</h2>
        <p>Hello <b>${studentName}</b>,</p>
        <p>Your enrollment schedule is set. Please go to school on:</p>
        <ul>
          <li><b>Date:</b> ${date}</li>
          <li><b>Time:</b> ${time}</li>
          <li><b>Location:</b> ${location}</li>
        </ul>
        ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ""}
        <hr/>
        <p><b>Registration ID:</b> ${p.registrationId}</p>
      `;

      const existing = await Enrollment.findOne({
        registrationId: p.registrationId,
        "schedule.date": date,
        "schedule.time": time,
      });

      if (existing) {
        results.push({
          registrationId: p.registrationId,
          ok: false,
          error: "Already scheduled for that slot",
        });
        continue;
      }

      await sendEmail(to, "Enrollment Schedule Notification", html);

      const enrollment = await Enrollment.create({
        preregistrationId: p._id,
        registrationId: p.registrationId,

        studentName,
        email: to,

        personal: p.personal,
        academic: p.academic,
        documents: p.documents,

        credentials: {
          username: "",
          passwordHash: "",
          credentialsSentAt: p.credentialsSent ? new Date() : null,
        },

        schedule: { date, time, location, notes: notes || "" },
        status: "Scheduled",
        sentAt: new Date(),
      });

      await Preregistration.findByIdAndUpdate(p._id, {
        scheduleSentAt: new Date(),
      });

      sentIds.push(p.registrationId);
      results.push({
        registrationId: p.registrationId,
        ok: true,
        enrollmentId: enrollment._id,
      });
    }

    return res.status(201).json({
      message: "Schedules processed.",
      processed: results.length,
      sentIds,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET enrollments (filter + search)
router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter).sort({ createdAt: -1 });

    const term = String(q || "").trim().toLowerCase();

    const filtered = term
      ? enrollments.filter((e) => {
          const studentName = String(e.studentName || "").toLowerCase();
          const registrationId = String(e.registrationId || "").toLowerCase();
          const studentIdNumber = String(e.studentIdNumber || "").toLowerCase();

          return (
            studentName.includes(term) ||
            registrationId.includes(term) ||
            studentIdNumber.includes(term)
          );
        })
      : enrollments;

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Archive enrolled record
router.post("/:id/archive", async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.status === "Archived") {
      return res.status(400).json({ message: "Enrollment is already archived." });
    }

    enrollment.archivedFromStatus = enrollment.status;
    enrollment.archivedAt = new Date();
    enrollment.status = "Archived";

    await enrollment.save();

    return res.json({
      message: "Enrollment archived successfully.",
      enrollment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Unarchive enrolled record
router.post("/:id/unarchive", async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.status !== "Archived") {
      return res.status(400).json({ message: "Enrollment is not archived." });
    }

    enrollment.status = enrollment.archivedFromStatus || "Enrolled";
    enrollment.archivedFromStatus = "";
    enrollment.archivedAt = null;

    await enrollment.save();

    return res.json({
      message: "Enrollment unarchived successfully.",
      enrollment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

// DELETE one archived enrollment permanently
router.delete("/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.status !== "Archived") {
      return res.status(400).json({
        message: "Only archived enrollments can be permanently deleted.",
      });
    }

    await Enrollment.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Archived enrollment deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

// DELETE multiple archived enrollments permanently
router.delete("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids is required." });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid enrollment IDs provided." });
    }

    const archivedRecords = await Enrollment.find({
      _id: { $in: validIds },
      status: "Archived",
    }).select("_id");

    const archivedIds = archivedRecords.map((item) => item._id);

    if (archivedIds.length === 0) {
      return res.status(400).json({
        message: "No archived enrollments found to delete.",
      });
    }

    const result = await Enrollment.deleteMany({
      _id: { $in: archivedIds },
      status: "Archived",
    });

    return res.json({
      message: "Archived enrollments deleted successfully.",
      deletedCount: result.deletedCount || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const pending = await Enrollment.countDocuments({ status: "Scheduled" });
    const enrolled = await Enrollment.countDocuments({ status: "Enrolled" });

    res.json({
      pending,
      enrolled,
      semesterLabel: "2nd Sem 2024",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/counts", async (req, res) => {
  try {
    const [total, scheduled, enrolled, cancelled, archived] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: "Scheduled" }),
      Enrollment.countDocuments({ status: "Enrolled" }),
      Enrollment.countDocuments({ status: "Cancelled" }),
      Enrollment.countDocuments({ status: "Archived" }),
    ]);

    return res.json({ total, scheduled, enrolled, cancelled, archived });
  } catch (err) {
    console.error("enrollments counts error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;