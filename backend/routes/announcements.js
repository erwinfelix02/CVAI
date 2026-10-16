import express from "express";
import Announcement from "../models/Announcement.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import validator from "validator";

const router = express.Router();

function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDepartmentKeywordRegex(dept) {
  if (!dept || dept === "General") return new RegExp(".*", "i");
  const clean = String(dept).trim();
  const keywords = clean
    .replace(/(Bachelor of Science in|College of|System|Department of)/gi, "")
    .trim();

  const pattern = escapeRegex(keywords || clean).replace(/\s+/g, "\\s*");
  return new RegExp(pattern, "i");
}

async function getDepartmentRecipientStudents(department, targetAudience) {
  try {
    const cleanDept = String(department || "").trim();
    const cleanAudience = String(
      targetAudience || "All Department Students",
    ).trim();

    const filter = {};

    if (
      cleanDept &&
      cleanDept !== "All" &&
      cleanDept !== "General" &&
      cleanDept !== "undefined" &&
      cleanDept !== "null"
    ) {
      filter.department = {
        $regex: new RegExp(`^${cleanDept}$`, "i"),
      };
    }

    let yearLevel = null;
    if (cleanAudience.includes("1st Year")) yearLevel = 1;
    else if (cleanAudience.includes("2nd Year")) yearLevel = 2;
    else if (cleanAudience.includes("3rd Year")) yearLevel = 3;
    else if (
      cleanAudience.includes("4th Year") ||
      cleanAudience.includes("Graduating")
    )
      yearLevel = 4;

    if (yearLevel) {
      filter.$or = [{ yearLevel: yearLevel }, { yearLevel: String(yearLevel) }];
    }

    console.log(
      `🔍 [Recipient Query] Department: "${cleanDept}", Audience: "${cleanAudience}", Filter:`,
      JSON.stringify(filter),
    );
    const students = await Student.find(filter);
    console.log(
      `📊 [Recipient Query] Found ${students.length} student(s) matching filter.`,
    );
    return students;
  } catch (err) {
    console.error("getDepartmentRecipientStudents error:", err);
    return [];
  }
}

router.get("/recipients/count", async (req, res) => {
  try {
    const { department, targetAudience } = req.query;
    const students = await getDepartmentRecipientStudents(
      department,
      targetAudience,
    );
    return res.status(200).json({ count: students.length });
  } catch (error) {
    console.error("GET Recipients Count Error:", error);
    return res
      .status(500)
      .json({ message: "Server error calculating recipient count.", count: 0 });
  }
});

// ==================== GET ALL ANNOUNCEMENTS ====================
router.get("/", async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};

    const nowIso = new Date().toISOString();
    filter.$and = [
      {
        $or: [
          { status: "published" },
          { status: { $exists: false } },
          { status: "scheduled", scheduledDate: { $lte: nowIso } },
        ],
      },
    ];

    if (department && department !== "General" && department !== "undefined") {
      filter.$and.push({
        department: {
          $regex: new RegExp(`^${String(department).trim()}$`, "i"),
        },
      });
    }

    const announcements = await Announcement.find(filter).sort({
      createdAt: -1,
    });
    return res.status(200).json(announcements);
  } catch (error) {
    console.error("GET Announcements Error:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching announcements." });
  }
});

// ==================== HELPER: DISPATCH EMAILS ====================
async function dispatchAnnouncementEmails(
  req,
  recipientStudents,
  title,
  department,
  targetAudience,
  priority,
  author,
  message,
) {
  try {
    console.log("🚀 Entering email dispatch loop...");
    const appName = process.env.APP_NAME || "CVAI Portal";
    const host = req.get("host") || "localhost:5000";
    const frontendHost = host.replace(/:\d+$/, ":5173");
    const frontendUrl = process.env.FRONTEND_URL || `http://${frontendHost}`;
    const portalUrl = `${frontendUrl}/signin`;

    const safeTitle = validator.escape(title);
    const safeAuthor = validator.escape(author || "Department Admin");
    const safeMessage = validator.escape(message).replace(/\n/g, "<br/>");

    const priorityBadgeColor =
      priority === "high"
        ? "#dc2626"
        : priority === "medium"
          ? "#d97706"
          : "#2563eb";

    const recipientList = recipientStudents.map((student) => {
      return {
        idNumber: String(student.studentIdNumber || "").trim(),
        email: String(student.email || "").trim(),
        fullName: String(student.fullName || "Student").trim(),
      };
    });

    console.log(
      `📋 [Email Dispatch] Processing ${recipientList.length} recipient(s)...`,
    );

    for (const recipient of recipientList) {
      try {
        let emailRaw = recipient.email;

        if (!emailRaw || !validator.isEmail(emailRaw)) {
          console.log(
            `🔍 [Email Lookup Fallback] Searching User collection for student ID: ${recipient.idNumber}`,
          );
          const matchedUser = await User.findOne({
            $or: [
              { idNumber: recipient.idNumber },
              { studentIdNumber: recipient.idNumber },
            ],
          });
          if (matchedUser && matchedUser.email) {
            emailRaw = String(matchedUser.email).trim();
          }
        }

        console.log(
          `🔎 [Announcement Email] Student ID: ${recipient.idNumber}, Resolved Email: "${emailRaw}"`,
        );

        if (!emailRaw) {
          console.log(
            `⚠️ Skipped: No email found for student ID ${recipient.idNumber}`,
          );
          continue;
        }

        const cleanEmail = validator.normalizeEmail(emailRaw) || emailRaw;
        if (!validator.isEmail(cleanEmail)) {
          console.log(`⚠️ Skipped: Invalid email format -> "${cleanEmail}"`);
          continue;
        }

        const studentName = validator.escape(recipient.fullName || "Student");

        const emailHtml = `
          <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f4f6f8;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:#1d4ed8; color:#ffffff; padding:20px; text-align:center;">
                        <h2 style="margin:0; font-size:22px;">📢 Updated Department Notice</h2>
                        <p style="margin:5px 0 0 0; font-size:14px; opacity:0.9;">${appName} - ${validator.escape(department)}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:30px; color:#333333;">
                        <p style="margin-top:0; font-size:16px;">
                          Hello <strong>${studentName}</strong>,
                        </p>
                        <p style="font-size:15px; line-height:1.6; color:#4b5563;">
                          An official department announcement has been updated.
                        </p>

                        <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:20px; margin:20px 0;">
                          <div style="display:flex; align-items:center; margin-bottom:10px;">
                            <span style="background:${priorityBadgeColor}; color:#ffffff; font-size:11px; font-weight:bold; padding:3px 8px; border-radius:4px; text-transform:uppercase; margin-right:10px;">${priority || "medium"} priority</span>
                            <span style="font-size:12px; color:#6b7280;">Posted by: ${safeAuthor}</span>
                          </div>
                          <h3 style="margin:0 0 10px 0; font-size:18px; color:#111827;">${safeTitle}</h3>
                          <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">${safeMessage}</p>
                        </div>

                        <div style="text-align:center; margin:25px 0;">
                          <a href="${portalUrl}" style="display:inline-block; padding:12px 28px; background-color:#1d4ed8; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:bold; font-size:15px;">
                            Sign In to View Portal
                          </a>
                        </div>

                        <p style="font-size:13px; line-height:1.6; color:#6b7280; margin-bottom:0; text-align:center;">
                          Target Audience: <strong>${validator.escape(targetAudience)}</strong>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#777777;">
                        This is an automated message from ${appName}. Please do not reply directly to this email.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        `;

        console.log(
          `📧 Attempting to send announcement email to: ${cleanEmail}`,
        );
        await sendEmail(
          cleanEmail,
          `[Updated Announcement] ${title} - ${department}`,
          emailHtml,
        );
        console.log(
          `✅ Successfully sent announcement email to: ${cleanEmail}`,
        );
      } catch (innerMailErr) {
        console.error(`❌ Failed to send announcement email:`, innerMailErr);
      }
    }
  } catch (err) {
    console.error("dispatchAnnouncementEmails error:", err);
  }
}

// ==================== POST NEW ANNOUNCEMENT ====================
router.post("/", async (req, res) => {
  try {
    const {
      title,
      targetAudience,
      priority,
      message,
      scheduledDate,
      sendPush,
      facultyId,
      author,
      department,
    } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required." });
    }

    const activeDept = department || "General";
    const activeAudience = targetAudience || "All Department Students";

    const recipientStudents = await getDepartmentRecipientStudents(
      activeDept,
      activeAudience,
    );

    const isFutureDated = scheduledDate && new Date(scheduledDate) > new Date();
    const status = isFutureDated ? "scheduled" : "published";
    const shouldSendEmail = true; // Forced for testing

    const newAnnouncement = new Announcement({
      title,
      targetAudience: activeAudience,
      priority: priority || "medium",
      message,
      scheduledDate: scheduledDate || "",
      status,
      sendPush: sendPush ?? true,
      sendEmail: shouldSendEmail,
      recipients: recipientStudents.length,
      facultyId: facultyId || "department-admin",
      author: author || "Department Admin",
      department: activeDept,
    });

    const saved = await newAnnouncement.save();

    res.status(201).json({
      message: "Announcement created and email notifications queued.",
      announcement: saved,
    });

    if (shouldSendEmail && !isFutureDated && recipientStudents.length > 0) {
      setImmediate(() => {
        dispatchAnnouncementEmails(
          req,
          recipientStudents,
          title,
          activeDept,
          activeAudience,
          priority,
          author,
          message,
        );
      });
    }
  } catch (error) {
    console.error("POST Announcement Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Server error creating announcement." });
    }
  }
});

// ==================== PUT UPDATE ANNOUNCEMENT ====================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      targetAudience,
      priority,
      message,
      scheduledDate,
      sendPush,
      department,
      author,
    } = req.body;

    const existing = await Announcement.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Announcement not found." });

    const targetAud = targetAudience || existing.targetAudience;
    const targetDept = department || existing.department;

    const recipientStudents = await getDepartmentRecipientStudents(
      targetDept,
      targetAud,
    );

    const isFutureDated = scheduledDate && new Date(scheduledDate) > new Date();
    const status = isFutureDated ? "scheduled" : "published";
    const shouldSendEmail = true; // Forced for testing

    const updated = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        targetAudience: targetAud,
        priority,
        message,
        scheduledDate,
        status,
        sendPush,
        sendEmail: shouldSendEmail,
        department: targetDept,
        recipients: recipientStudents.length,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: "Announcement updated and email notifications queued.",
      announcement: updated,
    });

    // 📧 Trigger email dispatch on update as well
    if (shouldSendEmail && !isFutureDated && recipientStudents.length > 0) {
      setImmediate(() => {
        dispatchAnnouncementEmails(
          req,
          recipientStudents,
          title,
          targetDept,
          targetAud,
          priority,
          author || updated.author,
          message,
        );
      });
    }
  } catch (error) {
    console.error("PUT Announcement Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Server error updating announcement." });
    }
  }
});

// ==================== DELETE ANNOUNCEMENT ====================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Announcement not found." });

    return res
      .status(200)
      .json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("DELETE Announcement Error:", error);
    return res
      .status(500)
      .json({ message: "Server error deleting announcement." });
  }
});

export default router;
