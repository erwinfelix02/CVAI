import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SchoolMember from "../models/SchoolMember.js";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/mail.js";

// --- REGISTER ---
export const register = async (req, res) => {
  try {
    const { fullName, schoolId, email, password } = req.body;

    // 1️⃣ Check school record
    const member = await SchoolMember.findOne({
      fullName,
      schoolId,
      status: "active",
    });
    if (!member)
      return res.status(403).json({ message: "You are not registered." });

    // 2️⃣ Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.verified) {
        // Already verified → cannot register again
        return res.status(400).json({ message: "Account already exists." });
      } else {
        // User exists but not verified → resend new code
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newCode;
        user.codeExpires = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes
        await user.save();

        await sendVerificationEmail(email, newCode);
        return res
          .status(200)
          .json({ message: "Verification code resent to email.", email });
      }
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Generate verification code & expiry
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const codeExpires = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes

    // 5️⃣ Create unverified user
    user = await User.create({
      fullName,
      schoolId,
      email,
      password: passwordHash,
      role: member.role,
      verified: false,
      verificationCode,
      codeExpires,
    });

    // 6️⃣ Send verification email
    await sendVerificationEmail(email, verificationCode);

    res
      .status(200)
      .json({ message: "Verification code sent to email.", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --- VERIFY EMAIL ---
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Missing email or code." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.verified)
      return res.status(400).json({ message: "User already verified." });

    // 1️⃣ Check if code expired
    if (
      !user.verificationCode ||
      !user.codeExpires ||
      new Date() > user.codeExpires
    ) {
      // ❌ Do NOT delete user. Just ask to resend code
      return res
        .status(400)
        .json({ message: "Code expired. Please resend the code." });
    }

    // 2️⃣ Check if code matches
    if (user.verificationCode !== code)
      return res.status(400).json({ message: "Invalid code." });

    // ✅ Mark user as verified
    user.verified = true;
    user.verificationCode = null;
    user.codeExpires = null;
    await user.save();

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Email verified. Account created successfully!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// --- RESEND CODE ---
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.verified)
      return res.status(400).json({ message: "User already verified." });

    // Generate new code & expiry
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const codeExpires = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes

    user.verificationCode = verificationCode;
    user.codeExpires = codeExpires;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: "Code resent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
