import express from "express";
import multer from "multer";
import Preregistration from "../models/Preregistration.js";
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

// routes/preregistrations.js
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
      const data = JSON.parse(req.body.data);

      // normalize for safer matching
      const email = String(data?.personal?.email || "").trim().toLowerCase();
      const phoneDigits = String(data?.personal?.phone || "").replace(/\D/g, "");
      const firstName = String(data?.personal?.firstName || "").trim();
      const lastName = String(data?.personal?.lastName || "").trim();
      const birthDate = String(data?.personal?.birthDate || "").trim();

      // ✅ 0) DUPLICATE CHECK (before blockchain + before save)
      const existing = await Preregistration.findOne({
        $or: [
          { "personal.email": email },
          { "personal.phone": phoneDigits },
          {
            "personal.firstName": firstName,
            "personal.lastName": lastName,
            "personal.birthDate": birthDate,
          },
        ],
      });

      if (existing) {
        return res.status(409).json({
          message: "Duplicate application detected. This applicant already exists.",
        });
      }

      let txHash = null;

      // 🔗 1) Call Blockchain (only if not duplicate)
      try {
        const tx = await contract.registerStudent(
          `${firstName} ${lastName}`,
          data.academic.course,
          email
        );
        await tx.wait();
        txHash = tx.hash;
      } catch (blockchainError) {
        console.error("Blockchain Error:", blockchainError);
        // Optional: if blockchain is required, you can return 500 here
      }

      // 🗄 2) Save to MongoDB
      const newApp = new Preregistration({
        personal: {
          ...data.personal,
          email,
          phone: phoneDigits,
        },
        academic: data.academic,
        status: "Pending",
        blockchainTxHash: txHash,
        documents: {
          birthCert: req.files.birthCert?.[0]
            ? `/uploads/${req.files.birthCert[0].filename}`
            : null,
          form137: req.files.form137?.[0]
            ? `/uploads/${req.files.form137[0].filename}`
            : null,
          goodMoral: req.files.goodMoral?.[0]
            ? `/uploads/${req.files.goodMoral[0].filename}`
            : null,
          idPhoto: req.files.idPhoto?.[0]
            ? `/uploads/${req.files.idPhoto[0].filename}`
            : null,
        },
      });

      await newApp.save();

      // 📧 email (same as your current)
      // ...

      return res.status(201).json({
        message: "Application saved and email sent successfully",
        registrationId: newApp.registrationId,
      });
    } catch (err) {
      console.error(err);

      // ✅ handle unique index collisions cleanly too
      if (err?.code === 11000) {
        return res.status(409).json({
          message: "Duplicate application detected (email/phone already exists).",
        });
      }

      return res.status(500).json({ message: "Server error" });
    }
  }
);


// GET all preregistrations
router.get("/", async (req, res) => {
  try {
    const applications = await Preregistration.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET pending count only
router.get("/pending-count", async (req, res) => {
  try {
    const count = await Preregistration.countDocuments({ status: "Pending" });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET recent applications (limit 5)
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

// ✅ Approve or Reject application
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Preregistration.findOneAndUpdate(
      { registrationId: req.params.id },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 📧 Optional: Send approval/rejection email
    const emailHtml = `
      <h2>Application Status Update</h2>
      <p>Your registration ID: <strong>${updated.registrationId}</strong></p>
      <p>Status: <strong>${status}</strong></p>
    `;

    await sendEmail(
      updated.personal.email,
      "Application Status Update",
      emailHtml
    );

    res.json({ message: "Status updated successfully", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
