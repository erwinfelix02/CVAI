import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    /* ===============================
       🔒 CHECK IF ACCOUNT IS LOCKED
    =============================== */
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account is temporarily locked. Try again after 24 hours.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    /* ===============================
       ❌ WRONG PASSWORD
    =============================== */
    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.loginAttempts = 0;
        await user.save();

        return res.status(403).json({
          message: "Too many failed attempts. Account locked for 24 hours.",
          locked: true,
        });
      }

      const triesLeft = 3 - user.loginAttempts;
      await user.save();

      return res.status(401).json({
        message: "Invalid email or password",
        failedAttempt: true,
        triesLeft,
      });
    }

    /* ===============================
       ✅ SUCCESS LOGIN
    =============================== */

    // Reset attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    /* 🔴 FORCE PASSWORD CHANGE */
    if (user.isTemporaryPassword) {
      return res.json({
        requirePasswordChange: true,
        email: user.email,
      });
    }

    // 🔑 Issue JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    let redirect = "/";
    switch (user.role) {
      case "Super Admin":
        redirect = "/superadmin";
        break;
      case "Registrar":
        redirect = "/registrar";
        break;
      case "Dept Head":
        redirect = "/department-head";
        break;
      case "Finance":
        redirect = "/finance";
        break;
      case "Faculty":
        redirect = "/faculty";
        break;
      case "Student":
        redirect = "/student";
        break;
    }

    res.json({
      message: "Login successful",
      token,
      redirect,
    });
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* 🔒 REQUIRE VALID RESET CODE */
    // 🔒 REQUIRE RESET CODE ONLY IF NOT TEMP PASSWORD FLOW
    if (!user.isTemporaryPassword) {
      if (
        !user.resetCode ||
        !user.resetCodeExpires ||
        user.resetCodeExpires < Date.now()
      ) {
        return res.status(400).json({
          message: "Password reset session expired. Please request a new code.",
        });
      }
    }

    // 🔐 Update password
    user.password = password;
    user.isTemporaryPassword = false;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // 🔥 CLEAR RESET FIELDS AFTER SUCCESS
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetAttempts = 0;

    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("UPDATE PASSWORD ERROR:", err);
    res.status(500).json({
      message: "Failed to update password",
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.isTemporaryPassword) {
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      user.resetAttempts = 0;
      await user.save();

      return res.json({
        message: "If the email exists, a reset code was sent.",
      });
    }

    if (!user.resetCode) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.resetAttempts >= 5) {
      return res.status(403).json({
        message: "Too many incorrect attempts. Request a new code.",
      });
    }
    if (user.isTemporaryPassword) {
      return res.status(403).json({
        message: "Temporary accounts must login before changing password.",
      });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Code expired" });
    }

    const isMatch = await bcrypt.compare(code, user.resetCode);

    if (!isMatch) {
      user.resetAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid code" });
    }

    res.json({ message: "Code verified" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always return generic message (prevent enumeration)
    if (!user) {
      return res.json({
        message: "If the email exists, a reset code was sent.",
      });
    }

    // 🚫 BLOCK reset if still temporary password
    if (user.isTemporaryPassword) {
      return res.json({
        message: "If the email exists, a reset code was sent.",
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash code before saving
    user.resetCode = await bcrypt.hash(code, 10);
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetAttempts = 0;

    await user.save();

    await sendEmail(
      user.email,
      "Password Reset Code",
      `
        <h2>Password Reset</h2>
        <p>Your 6-digit reset code is:</p>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    );

    res.json({
      message: "If the email exists, a reset code was sent.",
    });
  } catch (err) {
    console.error("RESET REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to send reset code" });
  }
};
