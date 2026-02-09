import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const createUser = async (req, res) => {
  try {
    console.log("📩 Incoming payload:", req.body);

    const {
      firstName,
      middleName,
      lastName,
      idNumber,
      email,
      phone,
      gender,
      role,
      department,
      status,
      notes,
      tempPassword,
    } = req.body;

    // 1. Check if user exists
    const exists = await User.findOne({
      $or: [{ email }, { idNumber }],
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Create and Save User
    const user = new User({
      firstName,
      middleName,
      lastName,
      idNumber,
      email,
      phone,
      gender,
      role,
      department,
      status: status || "active",
      notes,
      password: tempPassword,
    });

    const saved = await user.save();
    console.log("✅ User saved:", saved._id);

    // 3. Prepare Email Data
    // Handle middle name gracefully (add space only if it exists)
    const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`;
    const appName = process.env.APP_NAME || "CVAI Portal";

    // 4. Enhanced HTML Template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        
        <div style="background-color: #0F172A; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to ${appName}</h1>
        </div>

        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; color: #333333; margin-top: 0;">Hello <strong>${fullName}</strong>,</p>
          
          <p style="font-size: 16px; color: #555555; line-height: 1.5;">
            Your account has been successfully created by the administration. You can now access the portal using the credentials below.
          </p>

          <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>ID Number:</strong></p>
            <p style="margin: 0 0 15px 0; font-size: 18px; color: #000;">${idNumber}</p>

            <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Temporary Password:</strong></p>
            <div style="background-color: #ffffff; display: inline-block; padding: 8px 12px; border: 1px solid #cccccc; border-radius: 4px; font-family: monospace; font-size: 18px; color: #d946ef; font-weight: bold;">
              ${tempPassword}
            </div>
          </div>

          <p style="font-size: 14px; color: #666666; margin-bottom: 0;">
            * Please log in and change your password immediately for security purposes.
          </p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">This is an automated message. Please do not reply.</p>
          <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    `;

    // 5. Send Email (Non-blocking)
    try {
      await sendEmail(
        email, 
        `Welcome to ${appName} - Your Login Credentials`, 
        emailHtml
      );
      console.log("📧 Email sent successfully");
    } catch (emailError) {
      console.warn("⚠️ Email failed to send, but user was created:", emailError.message);
      // We do NOT throw an error here, so the frontend still gets a success response
    }

    res.status(201).json({ message: "User created successfully", userId: saved._id });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
