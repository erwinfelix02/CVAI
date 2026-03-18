import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { addLog, getClientIp } from "../utils/logActivity.js";
import SecuritySettings from "../models/SecuritySettings.js";

async function getOrCreateSecuritySettings() {
  let settings = await SecuritySettings.findOne();
  if (!settings) settings = await SecuritySettings.create({});
  return settings;
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);

    const securitySettings = await getOrCreateSecuritySettings();
    const maxLoginAttempts = securitySettings.maxLoginAttempts || 3;

    if (!email || !password) {
      addLog({
        action: "Failed Login Attempt",
        user: email || "unknown",
        role: "unknown",
        type: "Security",
        details: "Email and password are required",
        ip,
        status: "warning",
      });

      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      addLog({
        action: "Failed Login Attempt",
        user: email,
        role: "unknown",
        type: "Security",
        details: "Account not found",
        ip,
        status: "warning",
      });

      return res.status(401).json({ message: "Invalid email or password" });
    }

    /* ===============================
       CHECK IF ACCOUNT IS LOCKED
    =============================== */
    if (user.lockUntil && user.lockUntil > Date.now()) {
      addLog({
        action: "Login Blocked",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: "Account is temporarily locked",
        ip,
        status: "warning",
      });

      return res.status(403).json({
        message: "Account is temporarily locked. Try again after 24 hours.",
      });
    }

    if (user.status !== "active") {
      addLog({
        action: "Login Blocked",
        user: user.email,
        role: user.role || "unknown",
        type: "Auth",
        details: "Account is inactive",
        ip,
        status: "warning",
      });

      return res.status(403).json({ message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    /* ===============================
       WRONG PASSWORD
    =============================== */
    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= maxLoginAttempts) {
        user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.loginAttempts = 0;
        await user.save();

        addLog({
          action: "Account Locked",
          user: user.email,
          role: user.role || "unknown",
          type: "Security",
          details: "Too many failed login attempts. Account locked for 24 hours.",
          ip,
          status: "warning",
        });

        return res.status(403).json({
          message: "Too many failed attempts. Account locked for 24 hours.",
          locked: true,
        });
      }

      const triesLeft = maxLoginAttempts - user.loginAttempts;
      await user.save();

      addLog({
        action: "Failed Login Attempt",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: `Invalid password. ${triesLeft} attempt(s) left before lock.`,
        ip,
        status: "warning",
      });

      return res.status(401).json({
        message: "Invalid email or password",
        failedAttempt: true,
        triesLeft,
      });
    }

    /* ===============================
       SUCCESS LOGIN
    =============================== */

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.isOnline = true;
    user.lastSeenAt = new Date();
    await user.save();

    if (user.isTemporaryPassword) {
      addLog({
        action: "Login Requires Password Change",
        user: user.email,
        role: user.role || "unknown",
        type: "Auth",
        details: "Temporary password detected. Password change required.",
        ip,
        status: "warning",
      });

      return res.json({
        requirePasswordChange: true,
        email: user.email,
      });
    }

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

    addLog({
      action: "User Login",
      user: user.email,
      role: user.role || "unknown",
      type: "Auth",
      details: "Successful login",
      ip,
      status: "success",
    });

    return res.json({
      message: "Login successful",
      token,
      redirect,
      user: {
        _id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("AUTH ERROR:", err);

    addLog({
      action: "Login Error",
      user: req.body?.email || "unknown",
      role: "unknown",
      type: "System",
      details: "Authentication failed due to server error",
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Authentication failed" });
  }
};

export const logout = async (req, res) => {
  try {
    const ip = getClientIp(req);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnline: false,
        lastSeenAt: new Date(),
      },
      { new: true },
    );

    addLog({
      action: "User Logout",
      user: user?.email || "unknown",
      role: user?.role || "unknown",
      type: "Auth",
      details: "Successful logout",
      ip,
      status: "success",
    });

    return res.json({
      message: "Logout successful",
    });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);

    addLog({
      action: "Logout Error",
      user: req.user?.id || "unknown",
      role: "unknown",
      type: "System",
      details: "Failed to logout user",
      ip,
      status: "error",
    });

    return res.status(500).json({ message: "Logout failed" });
  }
};

export const heartbeat = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeenAt: new Date(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("HEARTBEAT ERROR:", err);

    addLog({
      action: "Heartbeat Error",
      user: req.user?.id || "unknown",
      role: "unknown",
      type: "System",
      details: "Failed to update user heartbeat",
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Heartbeat failed" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);

    if (!email || !password) {
      addLog({
        action: "Password Update Failed",
        user: email || "unknown",
        role: "unknown",
        type: "Auth",
        details: "Email and password are required",
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (password.length < 8) {
      addLog({
        action: "Password Update Failed",
        user: email,
        role: "unknown",
        type: "Auth",
        details: "Password must be at least 8 characters long",
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      addLog({
        action: "Password Update Failed",
        user: email,
        role: "unknown",
        type: "Security",
        details: "User not found",
        ip,
        status: "warning",
      });

      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isTemporaryPassword) {
      if (
        !user.resetCode ||
        !user.resetCodeExpires ||
        user.resetCodeExpires < Date.now()
      ) {
        addLog({
          action: "Password Update Failed",
          user: user.email,
          role: user.role || "unknown",
          type: "Security",
          details: "Password reset session expired",
          ip,
          status: "warning",
        });

        return res.status(400).json({
          message: "Password reset session expired. Please request a new code.",
        });
      }
    }

    user.password = password;
    user.isTemporaryPassword = false;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetAttempts = 0;

    await user.save();

    addLog({
      action: "Password Updated",
      user: user.email,
      role: user.role || "unknown",
      type: "Auth",
      details: "Password updated successfully",
      ip,
      status: "success",
    });

    return res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("UPDATE PASSWORD ERROR:", err);

    addLog({
      action: "Password Update Error",
      user: req.body?.email || "unknown",
      role: "unknown",
      type: "System",
      details: "Failed to update password",
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({
      message: "Failed to update password",
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const ip = getClientIp(req);

    const user = await User.findOne({ email });

    if (!user) {
      addLog({
        action: "Reset Code Verification Failed",
        user: email || "unknown",
        role: "unknown",
        type: "Security",
        details: "Invalid or expired code - user not found",
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.isTemporaryPassword) {
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      user.resetAttempts = 0;
      await user.save();

      addLog({
        action: "Reset Code Bypassed",
        user: user.email,
        role: user.role || "unknown",
        type: "Auth",
        details: "Temporary password flow detected",
        ip,
        status: "warning",
      });

      return res.json({
        message: "If the email exists, a reset code was sent.",
      });
    }

    if (!user.resetCode) {
      addLog({
        action: "Reset Code Verification Failed",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: "No reset code found",
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.resetAttempts >= 5) {
      addLog({
        action: "Reset Code Verification Blocked",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: "Too many incorrect reset code attempts",
        ip,
        status: "warning",
      });

      return res.status(403).json({
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    if (user.isTemporaryPassword) {
      addLog({
        action: "Reset Code Verification Blocked",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: "Temporary accounts must login before changing password",
        ip,
        status: "warning",
      });

      return res.status(403).json({
        message: "Temporary accounts must login before changing password.",
      });
    }

    if (user.resetCodeExpires < Date.now()) {
      addLog({
        action: "Reset Code Verification Failed",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: "Reset code expired",
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Code expired" });
    }

    const isMatch = await bcrypt.compare(code, user.resetCode);

    if (!isMatch) {
      user.resetAttempts += 1;
      await user.save();

      addLog({
        action: "Reset Code Verification Failed",
        user: user.email,
        role: user.role || "unknown",
        type: "Security",
        details: "Invalid reset code",
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Invalid code" });
    }

    addLog({
      action: "Reset Code Verified",
      user: user.email,
      role: user.role || "unknown",
      type: "Auth",
      details: "Password reset code verified successfully",
      ip,
      status: "success",
    });

    return res.json({ message: "Code verified" });
  } catch (err) {
    addLog({
      action: "Reset Code Verification Error",
      user: req.body?.email || "unknown",
      role: "unknown",
      type: "System",
      details: "Verification failed due to server error",
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Verification failed" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = getClientIp(req);

    if (!email) {
      addLog({
        action: "Password Reset Request Failed",
        user: "unknown",
        role: "unknown",
        type: "Auth",
        details: "Email is required",
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      addLog({
        action: "Password Reset Requested",
        user: email,
        role: "unknown",
        type: "Security",
        details: "Password reset requested for non-existing email",
        ip,
        status: "warning",
      });

      return res.json({
        message: "If the email exists, a reset code was sent.",
      });
    }

    if (user.isTemporaryPassword) {
      addLog({
        action: "Password Reset Blocked",
        user: user.email,
        role: user.role || "unknown",
        type: "Auth",
        details: "Temporary password account cannot request reset here",
        ip,
        status: "warning",
      });

      return res.json({
        message: "If the email exists, a reset code was sent.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = await bcrypt.hash(code, 10);
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
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

    addLog({
      action: "Password Reset Requested",
      user: user.email,
      role: user.role || "unknown",
      type: "Auth",
      details: "Password reset code sent",
      ip,
      status: "success",
    });

    return res.json({
      message: "If the email exists, a reset code was sent.",
    });
  } catch (err) {
    console.error("RESET REQUEST ERROR:", err);

    addLog({
      action: "Password Reset Request Error",
      user: req.body?.email || "unknown",
      role: "unknown",
      type: "System",
      details: "Failed to send reset code",
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Failed to send reset code" });
  }
};