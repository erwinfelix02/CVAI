import express from "express";
import Preregistration from "../models/Preregistration.js";
import Enrollment from "../models/Enrollment.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// ✅ POST schedule + send email + save enrollment
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
        results.push({ registrationId: p.registrationId, ok: false, error: "Missing email" });
        continue;
      }

      // ✅ prevent re-sending if already sent
      if (p.scheduleSentAt) {
        results.push({ registrationId: p.registrationId, ok: false, error: "Schedule already sent" });
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

      // optional duplicate check
      const existing = await Enrollment.findOne({
        registrationId: p.registrationId,
        "schedule.date": date,
        "schedule.time": time,
      });

      if (existing) {
        results.push({ registrationId: p.registrationId, ok: false, error: "Already scheduled for that slot" });
        continue;
      }

      // 1) Send email
      await sendEmail(to, "Enrollment Schedule Notification", html);

      // 2) Save Enrollment record (✅ includes studentName + email)
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

      // 3) Mark prereg as schedule sent
      await Preregistration.findByIdAndUpdate(p._id, {
        scheduleSentAt: new Date(),
      });

      sentIds.push(p.registrationId);
      results.push({ registrationId: p.registrationId, ok: true, enrollmentId: enrollment._id });
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

// ✅ GET enrollments (filter + search)
router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { studentName: { $regex: term, $options: "i" } },
        { registrationId: { $regex: term, $options: "i" } },
      ];
    }

    const enrollments = await Enrollment.find(filter).sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET stats
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
    const [total, scheduled, enrolled, cancelled] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: "Scheduled" }),
      Enrollment.countDocuments({ status: "Enrolled" }),
      Enrollment.countDocuments({ status: "Cancelled" }),
    ]);

    return res.json({ total, scheduled, enrolled, cancelled });
  } catch (err) {
    console.error("enrollments counts error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
