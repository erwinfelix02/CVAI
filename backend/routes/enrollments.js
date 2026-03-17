import express from "express";
import mongoose from "mongoose";
import Preregistration from "../models/Preregistration.js";
import Enrollment from "../models/Enrollment.js";
import sendEmail from "../utils/sendEmail.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

const router = express.Router();

// POST schedule + send email + save enrollment
router.post("/schedule", async (req, res) => {
  const updatedBy = req.body?.updatedBy || "registrar";

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
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f4f6f8;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:#0f766e; color:#ffffff; padding:20px; text-align:center;">
                <h2 style="margin:0; font-size:24px;">Enrollment Schedule</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="margin-top:0; font-size:16px;">Hello <strong>${studentName}</strong>,</p>
                <p style="font-size:15px; line-height:1.6; margin-bottom:20px;">
                  Your enrollment schedule has been set. Please go to school on the following schedule:
                </p>

                <!-- Schedule Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; margin-bottom:20px;">
                  <tr>
                    <td style="padding:14px; width:35%; background:#f9fafb; font-weight:bold;">Date</td>
                    <td style="padding:14px;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px; width:35%; background:#f9fafb; font-weight:bold; border-top:1px solid #e5e7eb;">Time</td>
                    <td style="padding:14px; border-top:1px solid #e5e7eb;">${time}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px; width:35%; background:#f9fafb; font-weight:bold; border-top:1px solid #e5e7eb;">Location</td>
                    <td style="padding:14px; border-top:1px solid #e5e7eb;">${location}</td>
                  </tr>
                </table>

                ${
                  notes
                    ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; background:#fffbeb; border:1px solid #fde68a; border-radius:6px;">
                  <tr>
                    <td style="padding:14px; color:#92400e;">
                      <strong>Notes:</strong> ${notes}
                    </td>
                  </tr>
                </table>
                `
                    : ""
                }

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                  <tr>
                    <td style="padding:14px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; color:#1e3a8a;">
                      <strong>Registration ID:</strong> ${p.registrationId}
                    </td>
                  </tr>
                </table>

                <p style="margin-top:24px; font-size:14px; line-height:1.6; color:#555555;">
                  Please keep your registration ID for reference and arrive on time for your scheduled enrollment.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#777777;">
                This is an automated message. Please do not reply directly to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
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

        personal: {
  firstName: p.personal?.firstName || "",
  middleName: p.personal?.middleName || "",
  lastName: p.personal?.lastName || "",
  email: p.personal?.email || "",
  phone: p.personal?.phone || "",
  address: p.personal?.address || "",
  birthDate: p.personal?.birthDate || p.personal?.birthdate || "",
  guardian: p.personal?.guardian || "",
  guardianPhone: p.personal?.guardianPhone || "",
  gender: p.personal?.gender || "",
},
        academic: {
  program: p.academic?.course || "",
  yearLevel: p.academic?.yearLevel || "",
  department: p.academic?.course || "",
  applicantType: p.academic?.applicantType || "",
  previousSchool: p.academic?.previousSchool || "",
},
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

      addLog({
        action: "Schedule Enrollment",
        user: updatedBy,
        role: "Registrar",
        type: "Data",
        details: `Enrollment schedule sent to ${to} (${p.registrationId}) on ${date} ${time} at ${location}`,
        ip: getClientIp(req),
        status: "success",
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

    addLog({
      action: "Schedule Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed to schedule enrollment: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

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
  const updatedBy = req.body?.updatedBy || "registrar";

  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.status === "Archived") {
      return res.status(400).json({ message: "Enrollment is already archived." });
    }

    const previousStatus = enrollment.status;

    enrollment.archivedFromStatus = enrollment.status;
    enrollment.archivedAt = new Date();
    enrollment.status = "Archived";

    await enrollment.save();

    addLog({
      action: "Archive Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Enrollment archived: ${enrollment.email} (${enrollment.registrationId}) from status ${previousStatus}`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.json({
      message: "Enrollment archived successfully.",
      enrollment,
    });
  } catch (err) {
    console.error(err);

    addLog({
      action: "Archive Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed to archive enrollment: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Server error." });
  }
});

// Unarchive enrolled record
router.post("/:id/unarchive", async (req, res) => {
  const updatedBy = req.body?.updatedBy || "registrar";

  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.status !== "Archived") {
      return res.status(400).json({ message: "Enrollment is not archived." });
    }

    const restoredTo = enrollment.archivedFromStatus || "Enrolled";

    enrollment.status = restoredTo;
    enrollment.archivedFromStatus = "";
    enrollment.archivedAt = null;

    await enrollment.save();

    addLog({
      action: "Unarchive Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Enrollment unarchived: ${enrollment.email} (${enrollment.registrationId}) restored to ${restoredTo}`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.json({
      message: "Enrollment unarchived successfully.",
      enrollment,
    });
  } catch (err) {
    console.error(err);

    addLog({
      action: "Unarchive Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed to unarchive enrollment: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Server error." });
  }
});

// DELETE one archived enrollment permanently
router.delete("/:id", async (req, res) => {
  const updatedBy = req.body?.updatedBy || "registrar";

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

    const details = `Archived enrollment deleted: ${enrollment.email} (${enrollment.registrationId})`;

    await Enrollment.findByIdAndDelete(req.params.id);

    addLog({
      action: "Delete Archived Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details,
      ip: getClientIp(req),
      status: "success",
    });

    return res.json({
      message: "Archived enrollment deleted successfully.",
    });
  } catch (err) {
    console.error(err);

    addLog({
      action: "Delete Archived Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed to delete archived enrollment: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Server error." });
  }
});

// DELETE multiple archived enrollments permanently
router.delete("/bulk-delete", async (req, res) => {
  const updatedBy = req.body?.updatedBy || "registrar";

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
    }).select("_id email registrationId");

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

    addLog({
      action: "Bulk Delete Archived Enrollments",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Bulk deleted ${result.deletedCount || 0} archived enrollment(s).`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.json({
      message: "Archived enrollments deleted successfully.",
      deletedCount: result.deletedCount || 0,
    });
  } catch (err) {
    console.error(err);

    addLog({
      action: "Bulk Delete Archived Enrollments",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed bulk delete of archived enrollments: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

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