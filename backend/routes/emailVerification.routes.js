import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ message: "Missing verification data." });
    }

    const user = await User.findOne({
      email,
      verificationCode: code,
      codeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Already verified." });
    }

    user.verified = true;
    user.verificationCode = null;
    user.codeExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
