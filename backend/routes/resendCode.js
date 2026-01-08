import express from "express";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/mail.js";

const router = express.Router();

router.post("/resend-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Missing email" });

  try {
    // Look for unverified user only
    const user = await User.findOne({ email, verified: false });
    if (!user) return res.status(404).json({ message: "User not found or already verified" });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save code and expiration (as Date!)
    user.verificationCode = code;
    user.codeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await user.save();

    // Send email
    await sendVerificationEmail(email, code);

    res.json({ message: "Verification code sent successfully!" });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
