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

      let txHash = null;

      // 🔗 1️⃣ Call Blockchain FIRST
      try {
        const tx = await contract.registerStudent(
          `${data.personal.firstName} ${data.personal.lastName}`,
          data.academic.course,
          data.personal.email,
        );

        await tx.wait();
        txHash = tx.hash;

        console.log("Blockchain TX:", txHash);
      } catch (blockchainError) {
        console.error("Blockchain Error:", blockchainError);
      }

      // 🗄 2️⃣ Save to MongoDB ONCE
      const newApp = new Preregistration({
        personal: data.personal,
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

      // =========================
      // 📧 SEND CONFIRMATION EMAIL
      // =========================

      const htmlContent = `
        <h2>🎓 Pre-Registration Confirmation</h2>

        <p><strong>Registration ID:</strong> ${newApp.registrationId}</p>

        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${data.personal.firstName} ${data.personal.middleName || ""} ${data.personal.lastName}</p>
        <p><strong>Email:</strong> ${data.personal.email}</p>
        <p><strong>Phone:</strong> ${data.personal.phone}</p>
        <p><strong>Birth Date:</strong> ${data.personal.birthDate}</p>
        <p><strong>Gender:</strong> ${data.personal.gender}</p>
        <p><strong>Address:</strong> ${data.personal.address}</p>

        <h3>Academic Information</h3>
        <p><strong>Applicant Type:</strong> ${data.academic.applicantType}</p>
        <p><strong>Course:</strong> ${data.academic.course}</p>
        <p><strong>Previous School:</strong> ${data.academic.previousSchool || "N/A"}</p>

        <hr/>
        <p>Status: <strong>Pending Review</strong></p>
        <p>Please keep your Registration ID for tracking.</p>
      `;

      await sendEmail(
        data.personal.email,
        "Pre-Registration Application Received",
        htmlContent,
        [
          req.files.birthCert?.[0] && { path: req.files.birthCert[0].path },
          req.files.form137?.[0] && { path: req.files.form137[0].path },
          req.files.goodMoral?.[0] && { path: req.files.goodMoral[0].path },
          req.files.idPhoto?.[0] && { path: req.files.idPhoto[0].path },
        ].filter(Boolean),
      );

      res.status(201).json({
        message: "Application saved and email sent successfully",
        registrationId: newApp.registrationId,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
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

export default router;
