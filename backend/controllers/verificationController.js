import sendEmail from "../utils/sendEmail.js";

// Export the OTP store map so other modules can check verification status
export const otpStore = new Map();

export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(cleanEmail, { code, expiresAt, verified: false });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f8;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1a73e8; text-align: center;">Email Verification</h2>
          <p>Your verification code for pre-registration is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; color: #111827;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `;

    await sendEmail(cleanEmail, "Your Verification Code", emailHtml);

    res.json({ message: "Verification code sent to email." });
  } catch (err) {
    console.error("Error sending verification email:", err);
    res.status(500).json({ message: "Failed to send verification code." });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ message: "No verification code requested for this email." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ message: "Verification code has expired." });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    record.verified = true;
    otpStore.set(cleanEmail, record);

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Error verifying code:", err);
    res.status(500).json({ message: "Server error during verification." });
  }
};