// routes/preregistrations.js

import express from "express";
import crypto from "crypto";
import multer from "multer";
import Preregistration from "../models/Preregistration.js";
import ArchivedPreregistration from "../models/ArchivedPreregistration.js";
import RegistrarSettings from "../models/RegistrarSettings.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import { otpStore } from "../controllers/verificationController.js";
import sendEmail from "../utils/sendEmail.js";
import contract from "../utils/blockchain.js";

const router = express.Router();
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "-" + file.fieldname + "." + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "idPhoto") {
      if (!["image/jpeg", "image/png", "application/pdf"].includes(file.mimetype)) {
        return cb(new Error("ID photo must be a JPEG, PNG, or PDF file."));
      }
    } else {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF files are allowed for documents."));
      }
    }
    cb(null, true);
  },
});

function normalizePHPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("639") && digits.length >= 12) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith("09") && digits.length >= 11) return `+63${digits.slice(1, 11)}`;
  if (digits.startsWith("9") && digits.length >= 10) return `+63${digits.slice(0, 10)}`;
  return String(phone || "").trim();
}

// ── RETENTION SETTINGS ENDPOINTS ──────────────────────────────

router.get("/settings/retention", async (req, res) => {
  try {
    let settings = await RegistrarSettings.findOne();
    if (!settings) {
      settings = await RegistrarSettings.create({ archiveRetentionDays: 30 });
    }
    res.json({ archiveRetentionDays: settings.archiveRetentionDays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/settings/retention", async (req, res) => {
  try {
    const { archiveRetentionDays } = req.body;
    const days = parseInt(archiveRetentionDays, 10);

    if (isNaN(days) || days < 1) {
      return res.status(400).json({ message: "Retention days must be at least 1." });
    }

    const settings = await RegistrarSettings.findOneAndUpdate(
      {},
      { archiveRetentionDays: days },
      { new: true, upsert: true }
    );

    res.json({
      message: "Archive retention days updated successfully",
      archiveRetentionDays: settings.archiveRetentionDays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── STATIC METRIC ENDPOINTS ───────────────────────────────────

router.get("/pending-count", async (req, res) => {
  try {
    const count = await Preregistration.countDocuments({ status: "Pending" });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const applications = await Preregistration.find()
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── COLLECTION ENDPOINTS ──────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const active = await Preregistration.find().sort({ createdAt: -1 });
    const archived = await ArchivedPreregistration.find().sort({ createdAt: -1 });

    const combined = [
      ...active.map((doc) => doc.toObject()),
      ...archived.map((doc) => ({
        ...doc.toObject(),
        status: "Archived",
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// SUBMIT NEW PREREGISTRATION
router.post(
  "/",
  upload.fields([
    { name: "birthCert", maxCount: 1 },
    { name: "goodMoral", maxCount: 1 },
    { name: "idPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const settings = await RegistrarSettings.findOne();
      if (settings && !settings.enrollmentOpen) {
        return res.status(403).json({ message: "Registration is not open." });
      }

      const data = JSON.parse(req.body.data);
      const email = String(data?.personal?.email || "").trim().toLowerCase();

      const otpRecord = otpStore.get(email);
      if (!otpRecord || !otpRecord.verified) {
        return res.status(400).json({
          message: "Email address has not been verified. Please verify your email first.",
        });
      }

      const phone = normalizePHPhone(data?.personal?.phone || "");
      const firstName = String(data?.personal?.firstName || "").trim();
      const middleName = String(data?.personal?.middleName || "").trim();
      const lastName = String(data?.personal?.lastName || "").trim();
      const birthDate = String(data?.personal?.birthDate || "").trim();
      const gender = String(data?.personal?.gender || "").trim();
      const address = String(data?.personal?.address || "").trim();
      const barangay = String(data?.personal?.barangay || "").trim();
      const municipality = String(data?.personal?.municipality || "").trim();
      const province = String(data?.personal?.province || "").trim();
      const postalCode = String(data?.personal?.postalCode || "").trim();
      const provinceCode = String(data?.personal?.provinceCode || "").trim();
      const municipalityCode = String(data?.personal?.municipalityCode || "").trim();
      const barangayCode = String(data?.personal?.barangayCode || "").trim();
      const applicantType = String(data?.academic?.applicantType || "").trim();
      const course = String(data?.academic?.course || "").trim();
      const previousSchool = String(data?.academic?.previousSchool || "").trim();

     // In routes/preregistrations.js (inside router.post("/", ...))

// Check if an active user account exists that is NOT inactive or dropped
const existingUser = await User.findOne({ email });
if (existingUser && existingUser.status === "active") {
  return res.status(409).json({
    message: "An active account with this email address already exists. Pre-registration is not allowed.",
  });
}

// Check for existing active/pending applications (ignoring archived or dropped ones if needed)
const existingActive = await Preregistration.findOne({
  $or: [{ "personal.email": email }, { "personal.phone": phone }],
  status: { $nin: ["Archived", "Dropped"] }
});

const existingArchived = await ArchivedPreregistration.findOne({
  $or: [{ "personal.email": email }, { "personal.phone": phone }],
});

// Also check if there is an active student record who is NOT dropped
const existingActiveStudent = await Student.findOne({
  email: email,
  status: { $ne: "Dropped" }
});

if (existingActive || existingActiveStudent) {
  return res.status(409).json({
    message: "Duplicate application detected. An active student or application with this email already exists.",
  });
}

      let txHash = null;
      try {
        const tx = await contract.registerStudent(
          `${firstName} ${lastName}`,
          course,
          email,
        );
        await tx.wait();
        txHash = tx.hash;
      } catch (blockchainError) {
        console.error("Blockchain Error:", blockchainError);
      }

      const newApp = new Preregistration({
        personal: {
          firstName, middleName, lastName, email, phone, birthDate, gender,
          address, barangay, municipality, province, postalCode,
          provinceCode, municipalityCode, barangayCode,
        },
        academic: { applicantType, course, previousSchool },
        status: "Pending",
        blockchainTxHash: txHash,
        documents: {
          birthCert: req.files?.birthCert?.[0] ? `/uploads/${req.files.birthCert[0].filename}` : null,
          goodMoral: req.files?.goodMoral?.[0] ? `/uploads/${req.files.goodMoral[0].filename}` : null,
          idPhoto: req.files?.idPhoto?.[0] ? `/uploads/${req.files.idPhoto[0].filename}` : null,
        },
      });

      await newApp.save();
      otpStore.delete(email);

      return res.status(201).json({
        message: "Application saved successfully",
        registrationId: newApp.registrationId,
      });
    } catch (err) {
      console.error(err);
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Duplicate application detected." });
      }
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// ── REVISION TOKEN VERIFICATION ENDPOINT ───────────────────────


// ── REVISION TOKEN VERIFICATION ENDPOINT ───────────────────────

router.get("/verify-revision", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Missing revision token." });
    }

    // Fetch the document and include select fields
    const application = await Preregistration.findOne({
      revisionToken: token,
      revisionTokenExpires: { $gt: Date.now() },
    }).select("+revisionToken +revisionTokenExpires");

    if (!application) {
      return res.status(400).json({ message: "Revision link is invalid or has expired." });
    }

    // Call .toJSON() to explicitly invoke schema getters (decrypting all encrypted fields)
    const jsonApp = application.toJSON();

    res.json({
      registrationId: jsonApp.registrationId,
      personal: jsonApp.personal,
      academic: jsonApp.academic,
      returnReason: jsonApp.returnReason,
    });
  } catch (err) {
    console.error("Verify revision error:", err);
    res.status(500).json({ message: "Server error verifying revision link" });
  }
});
// ── RESUBMISSION ENDPOINT ──────────────────────────────────────

router.post(
  "/resubmit",
  upload.fields([
    { name: "birthCert", maxCount: 1 },
    { name: "goodMoral", maxCount: 1 },
    { name: "idPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { token, firstName, middleName, lastName, phone, course } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Missing revision token." });
      }

      const application = await Preregistration.findOne({
        revisionToken: token,
        revisionTokenExpires: { $gt: Date.now() },
      }).select("+revisionToken +revisionTokenExpires");

      if (!application) {
        return res.status(400).json({ message: "Revision link is invalid or has expired." });
      }

      if (firstName) application.personal.firstName = firstName;
      if (middleName !== undefined) application.personal.middleName = middleName;
      if (lastName) application.personal.lastName = lastName;
      if (phone) application.personal.phone = phone;
      if (course) application.academic.course = course;

      if (req.files) {
        if (req.files.birthCert) {
          application.documents.birthCert = `/uploads/${req.files.birthCert[0].filename}`;
        }
        if (req.files.goodMoral) {
          application.documents.goodMoral = `/uploads/${req.files.goodMoral[0].filename}`;
        }
        if (req.files.idPhoto) {
          application.documents.idPhoto = `/uploads/${req.files.idPhoto[0].filename}`;
        }
      }

      application.status = "Pending";
      application.returnReason = null;
      application.revisionToken = null;
      application.revisionTokenExpires = null;

      await application.save();

      res.json({ message: "Application successfully resubmitted for review." });
    } catch (err) {
      console.error("Resubmission error:", err);
      res.status(500).json({ message: "Server error handling resubmission" });
    }
  },
);

// ── PARAMETERIZED ID ENDPOINTS ────────────────────────────────

// UPDATE STATUS (Approved or Returned)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, returnReason } = req.body;

    if (!["Approved", "Returned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    let updateData = {};

    if (status === "Approved") {
      updateData = {
        status,
        approvedAt: new Date(),
        returnedAt: null,
        returnReason: null,
        revisionToken: null,
        revisionTokenExpires: null,
      };
    } else if (status === "Returned") {
      const token = crypto.randomBytes(32).toString("hex");
      updateData = {
        status,
        returnedAt: new Date(),
        approvedAt: null,
        returnReason: returnReason || "Please update your application details.",
        revisionToken: token,
        revisionTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
      };
    }

    const updated = await Preregistration.findOneAndUpdate(
      { registrationId: req.params.id },
      updateData,
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Automatically capture network host from request so it uses your IP instead of localhost
// Use environment variable if set, otherwise fallback to your deployed public IP
    const frontendUrl = process.env.FRONTEND_URL || "http://32.237.52.114";
    const revisionLink = `${frontendUrl}/preregistration/revise?token=${updateData.revisionToken}`;

    const emailHtml = `
<div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:#111827; color:#ffffff; padding:20px; text-align:center;">
              <h2 style="margin:0;">Application Status Update</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px; color:#333; text-align:center;">
              <p style="margin:0 0 10px;">Your Registration ID</p>
              <h3 style="margin:0; color:#1a73e8;">${updated.registrationId}</h3>

              <div style="margin:25px 0;">
                <span style="display:inline-block; padding:10px 20px; border-radius:20px; font-size:14px; font-weight:bold; background:${status === "Approved" ? "#dcfce7" : "#fef9c3"}; color:${status === "Approved" ? "#166534" : "#854d0e"};">
                  ${status === "Returned" ? "Returned for Revision" : status}
                </span>
              </div>

              ${
                status === "Approved"
                  ? `
                  <p style="margin:15px 0 0; font-size:16px; color:#166534; font-weight:bold;">
                    Congratulations! Your application has been approved.
                  </p>
                  <p style="margin:8px 0 0; font-size:14px;">
                    Please wait for the official schedule of your school visit or orientation.
                  </p>
                  `
                  : `
                  <p style="margin:15px 0 0; font-size:14px; color:#854d0e; font-weight:bold;">
                    Your application requires revisions before it can be processed further.
                  </p>
                  
                  <div style="margin: 20px 0; padding: 15px; background-color: #fefce8; border: 1px solid #fde047; border-radius: 6px; text-align: left;">
                    <p style="margin: 0 0 5px; font-size: 12px; font-weight: bold; color: #854d0e; text-transform: uppercase;">
                      Registrar Feedback:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #713f12; line-height: 1.4;">
                      ${updated.returnReason}
                    </p>
                  </div>

                  <p style="margin:20px 0 10px; font-size:14px;">
                    Click the button below to update your information and re-upload documents:
                  </p>

                  <a href="${revisionLink}" style="display:inline-block; padding:12px 24px; background-color:#1a73e8; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:bold; font-size:14px;">
                    Update & Resubmit Application
                  </a>
                  `
              }
            </td>
          </tr>

          <tr>
            <td style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#777;">
              This is an automated update. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
`;

    await sendEmail(updated.personal.email, "Application Status Update", emailHtml);

    res.json({ message: "Status updated successfully", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ARCHIVE ENDPOINT
router.post("/:id/archive", async (req, res) => {
  try {
    const app = await Preregistration.findOne({ registrationId: req.params.id });
    if (!app) return res.status(404).json({ message: "Application not found" });

    const plain = app.toObject();
    const archivedDoc = new ArchivedPreregistration({
      ...plain,
      _id: undefined,
      status: "Archived",
      originalStatus: plain.status,
      archivedAt: new Date(),
    });

    await archivedDoc.save();
    await Preregistration.deleteOne({ registrationId: req.params.id });

    res.json({ message: "Application archived successfully", archived: archivedDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UNARCHIVE ENDPOINT
router.post("/:id/unarchive", async (req, res) => {
  try {
    const archived = await ArchivedPreregistration.findOne({ registrationId: req.params.id });
    if (!archived) return res.status(404).json({ message: "Archived application not found" });

    const plain = archived.toObject();
    const restored = new Preregistration({
      ...plain,
      _id: undefined,
      status: plain.originalStatus || "Returned",
    });

    await restored.save();
    await ArchivedPreregistration.deleteOne({ registrationId: req.params.id });

    res.json({ message: "Application unarchived successfully", restored });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE ENDPOINT
router.delete("/:id", async (req, res) => {
  try {
    let target = await Preregistration.findOneAndDelete({ registrationId: req.params.id });
    if (!target) {
      target = await ArchivedPreregistration.findOneAndDelete({ registrationId: req.params.id });
    }
    if (!target) return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ERROR HANDLING MIDDLEWARE
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Each file must not exceed 2MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload error" });
  }
  next();
});

export default router;