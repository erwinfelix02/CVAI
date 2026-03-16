import express from "express";
import multer from "multer";
import Preregistration from "../models/Preregistration.js";
import ArchivedPreregistration from "../models/ArchivedPreregistration.js";
import RegistrarSettings from "../models/RegistrarSettings.js";
import sendEmail from "../utils/sendEmail.js";
import contract from "../utils/blockchain.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "-" + file.fieldname + "." + ext);
  },
});

const upload = multer({ storage });

function normalizePHPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("639") && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }

  if (digits.startsWith("09") && digits.length >= 11) {
    return `+63${digits.slice(1, 11)}`;
  }

  if (digits.startsWith("9") && digits.length >= 10) {
    return `+63${digits.slice(0, 10)}`;
  }

  return String(phone || "").trim();
}

router.post(
  "/",
  upload.fields([
    { name: "birthCert" },
    { name: "form137" },
    { name: "goodMoral" },
    { name: "idPhoto" },
  ]),
  async (req, res) => {
    try {
      const settings = await RegistrarSettings.findOne();

      if (settings && !settings.enrollmentOpen) {
        return res.status(403).json({
          message: "Registration is not open.",
        });
      }

      const data = JSON.parse(req.body.data);

      const email = String(data?.personal?.email || "").trim().toLowerCase();
      const phone = normalizePHPhone(data?.personal?.phone || "");
      const firstName = String(data?.personal?.firstName || "").trim();
      const middleName = String(data?.personal?.middleName || "").trim();
      const lastName = String(data?.personal?.lastName || "").trim();
      const birthDate = String(data?.personal?.birthDate || "").trim();
      const gender = String(data?.personal?.gender || "").trim();
      const address = String(data?.personal?.address || "").trim();

      const applicantType = String(data?.academic?.applicantType || "").trim();
      const course = String(data?.academic?.course || "").trim();
      const previousSchool = String(data?.academic?.previousSchool || "").trim();

      const existingActive = await Preregistration.findOne({
        $or: [
          { "personal.email": email },
          { "personal.phone": phone },
          {
            "personal.firstName": firstName,
            "personal.lastName": lastName,
            "personal.birthDate": birthDate,
          },
        ],
      });

      const existingArchived = await ArchivedPreregistration.findOne({
        $or: [
          { "personal.email": email },
          { "personal.phone": phone },
          {
            "personal.firstName": firstName,
            "personal.lastName": lastName,
            "personal.birthDate": birthDate,
          },
        ],
      });

      if (existingActive || existingArchived) {
        return res.status(409).json({
          message:
            "Duplicate application detected. This applicant already exists.",
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
          firstName,
          middleName,
          lastName,
          email,
          phone,
          birthDate,
          gender,
          address,
        },
        academic: {
          applicantType,
          course,
          previousSchool,
        },
        status: "Pending",
        blockchainTxHash: txHash,
        documents: {
          birthCert: req.files?.birthCert?.[0]
            ? `/uploads/${req.files.birthCert[0].filename}`
            : null,
          form137: req.files?.form137?.[0]
            ? `/uploads/${req.files.form137[0].filename}`
            : null,
          goodMoral: req.files?.goodMoral?.[0]
            ? `/uploads/${req.files.goodMoral[0].filename}`
            : null,
          idPhoto: req.files?.idPhoto?.[0]
            ? `/uploads/${req.files.idPhoto[0].filename}`
            : null,
        },
      });

      await newApp.save();

      try {
        const fullName = [firstName, middleName, lastName]
          .filter(Boolean)
          .join(" ");

        const appName = process.env.APP_NAME || "CVAI Portal";

        const emailHtml = `
          <h2>Pre-Registration Submitted</h2>
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Your pre-registration application has been successfully submitted.</p>
          <p><strong>Registration ID:</strong> ${newApp.registrationId}</p>
          <p><strong>Course:</strong> ${course || "N/A"}</p>
          <p><strong>Status:</strong> Pending</p>
          <p>Please keep your Registration ID for future reference.</p>
          <hr />
          <p>Thank you for applying to ${appName}.</p>
        `;

        await sendEmail(
          email,
          `Pre-Registration Confirmation - ${appName}`,
          emailHtml,
        );
      } catch (emailErr) {
        console.error("Failed to send preregistration email:", emailErr);
      }

      return res.status(201).json({
        message: "Application saved successfully",
        registrationId: newApp.registrationId,
      });
    } catch (err) {
      console.error(err);

      if (err?.code === 11000) {
        return res.status(409).json({
          message:
            "Duplicate application detected (email/phone/applicant already exists).",
        });
      }

      return res.status(500).json({ message: "Server error" });
    }
  },
);

// GET all active + archived preregistrations
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

// Approve or Reject active application
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateData =
      status === "Approved"
        ? {
            status,
            approvedAt: new Date(),
            rejectedAt: null,
          }
        : {
            status,
            rejectedAt: new Date(),
            approvedAt: null,
          };

    const updated = await Preregistration.findOneAndUpdate(
      { registrationId: req.params.id },
      updateData,
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    const emailHtml = `
      <h2>Application Status Update</h2>
      <p>Your registration ID: <strong>${updated.registrationId}</strong></p>
      <p>Status: <strong>${status}</strong></p>
    `;

    await sendEmail(
      updated.personal.email,
      "Application Status Update",
      emailHtml,
    );

    res.json({ message: "Status updated successfully", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Archive: move from active collection to archived collection
router.post("/:id/archive", async (req, res) => {
  try {
    const app = await Preregistration.findOne({ registrationId: req.params.id });

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

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

    res.json({
      message: "Application archived successfully",
      archived: archivedDoc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unarchive: move back from archived collection to active collection
router.post("/:id/unarchive", async (req, res) => {
  try {
    const archived = await ArchivedPreregistration.findOne({
      registrationId: req.params.id,
    });

    if (!archived) {
      return res.status(404).json({ message: "Archived application not found" });
    }

    const plain = archived.toObject();

    const restored = new Preregistration({
      ...plain,
      _id: undefined,
      status: plain.originalStatus || "Rejected",
    });

    await restored.save();
    await ArchivedPreregistration.deleteOne({ registrationId: req.params.id });

    res.json({
      message: "Application unarchived successfully",
      restored,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete archived application permanently
router.delete("/:id", async (req, res) => {
  try {
    const archived = await ArchivedPreregistration.findOneAndDelete({
      registrationId: req.params.id,
    });

    if (!archived) {
      return res.status(404).json({ message: "Archived application not found" });
    }

    res.json({
      message: "Archived application deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;