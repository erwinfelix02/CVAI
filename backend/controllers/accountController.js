// controllers/accountController.js

import User from "../models/User.js";
import Student from "../models/Student.js";
import Enrollment from "../models/Enrollment.js"; // ✅ ADD (for UI button state)
import sendEmail from "../utils/sendEmail.js";
import validator from "validator";

function generateTempPassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

export const sendStudentCredentialsBulk = async (req, res) => {
  try {
    const { studentIds, subject, message } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "studentIds is required." });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (!students.length) {
      return res.status(404).json({ message: "No students found." });
    }

    const appName = process.env.APP_NAME || "CVAI Portal";
    const results = [];
    const sentStudentIds = [];

    for (const s of students) {
      try {
        const fullNameRaw = (s.fullName || "").trim();
        const emailRaw = (s.email || "").trim();
        const phoneRaw = (s.phone || "").trim();
        const genderRaw = (s.gender || "").trim();
        const departmentRaw = (s.department || "").trim();
        const idNumberRaw = (s.studentIdNumber || s.idNumber || "").trim();

        if (!emailRaw) {
          results.push({ studentId: s._id, status: "skipped", reason: "No email" });
          continue;
        }

        if (!idNumberRaw) {
          results.push({
            studentId: s._id,
            status: "skipped",
            reason: "No student ID number",
          });
          continue;
        }

        const cleanEmail = validator.normalizeEmail(emailRaw) || emailRaw;
        if (!validator.isEmail(cleanEmail)) {
          results.push({
            studentId: s._id,
            status: "skipped",
            reason: "Invalid email",
          });
          continue;
        }

        const cleanIdNumber = validator.escape(idNumberRaw);

        // phone normalization fallback (User.phone required)
        let cleanPhone = phoneRaw.replace(/\s+/g, "");
        if (/^09\d{9}$/.test(cleanPhone)) cleanPhone = "+63" + cleanPhone.slice(1);
        if (/^639\d{9}$/.test(cleanPhone)) cleanPhone = "+" + cleanPhone;
        if (!/^\+639\d{9}$/.test(cleanPhone)) cleanPhone = "+639000000000";

        const cleanDepartment = departmentRaw ? validator.escape(departmentRaw) : "N/A";

        const parts = fullNameRaw.split(" ").filter(Boolean);
        const firstName = validator.escape((parts[0] || "Student").trim());
        const lastName = validator.escape((parts.slice(1).join(" ") || "User").trim());

        const gender = genderRaw || "N/A";

        let user =
          (await User.findOne({ email: cleanEmail })) ||
          (await User.findOne({ idNumber: cleanIdNumber }));

        // skip if already sent
        if (user && user.credentialsSent) {
          results.push({
            studentId: s._id,
            status: "skipped",
            reason: "Credentials already sent",
            email: cleanEmail,
          });

          // ✅ keep Enrollment button consistent too
          await Enrollment.updateMany(
            { studentRef: s._id },
            {
              $set: {
                credentialsSent: true,
                "credentials.credentialsSentAt": new Date(),
              },
            },
          );

          continue;
        }

        // create/update user but do NOT mark as sent yet
        if (!user) {
          user = new User({
            firstName,
            middleName: "",
            lastName,
            idNumber: cleanIdNumber,
            email: cleanEmail,
            phone: cleanPhone,
            gender,
            role: "Student",
            department: cleanDepartment,
            status: "inactive",
            notes: "Created from enrollment send credentials",
            password: "TEMP_LOCKED",
            credentialsSent: false,
            createdBy: "Registrar",
          });
          await user.save();
        } else {
          user.firstName = user.firstName || firstName;
          user.lastName = user.lastName || lastName;
          user.idNumber = user.idNumber || cleanIdNumber;
          user.email = user.email || cleanEmail;
          user.phone = user.phone || cleanPhone;
          user.gender = user.gender || gender;
          user.role = "Student";
          user.department = user.department || cleanDepartment;
          user.status = "inactive";
          user.createdBy = user.createdBy || "Registrar";
          user.credentialsSent = false;
          await user.save();
        }

        // generate temp password (do NOT save as active yet)
        const tempPassword = generateTempPassword(10);

        const fullName = `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`;
        const safeMessage = message ? validator.escape(message) : "";

       const emailHtml = `
  <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f4f6f8;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:#1d4ed8; color:#ffffff; padding:20px; text-align:center;">
                <h2 style="margin:0; font-size:24px;">Welcome to ${appName}</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="margin-top:0; font-size:16px;">
                  Hello <strong>${fullName}</strong>,
                </p>

                ${
                  safeMessage
                    ? `<p style="font-size:15px; line-height:1.6;">${safeMessage}</p>`
                    : `<p style="font-size:15px; line-height:1.6;">Your account has been successfully <strong>activated</strong>.</p>`
                }

                <p style="font-size:15px; line-height:1.6; margin-bottom:20px;">
                  You may now use the following credentials to log in:
                </p>

                <!-- Credentials Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; margin-bottom:20px;">
                  <tr>
                    <td style="padding:14px; width:35%; background:#f9fafb; font-weight:bold;">Login Email</td>
                    <td style="padding:14px;">${user.email}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px; background:#f9fafb; font-weight:bold; border-top:1px solid #e5e7eb;">ID Number</td>
                    <td style="padding:14px; border-top:1px solid #e5e7eb;">${user.idNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px; background:#f9fafb; font-weight:bold; border-top:1px solid #e5e7eb;">Temporary Password</td>
                    <td style="padding:14px; border-top:1px solid #e5e7eb;"><strong>${tempPassword}</strong></td>
                  </tr>
                </table>

                <!-- Reminder Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; background:#fff7ed; border:1px solid #fdba74; border-radius:6px;">
                  <tr>
                    <td style="padding:14px; color:#9a3412; font-size:14px; line-height:1.6;">
                      <strong>Important:</strong> Please log in and change your password immediately for security purposes.
                    </td>
                  </tr>
                </table>

                <p style="font-size:14px; line-height:1.6; color:#555555; margin-bottom:0;">
                  Keep your login details secure and do not share them with anyone.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#777777;">
                This is an automated message from ${appName}. Please do not reply directly to this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
`;

        // ✅ SEND EMAIL FIRST (sendEmail unchanged)
        await sendEmail(
          user.email,
          subject?.trim() ? subject.trim() : `Your Login Credentials - ${appName}`,
          emailHtml,
        );

        // ✅ update Enrollment FIRST so UI button changes after refresh
        await Enrollment.updateMany(
          { studentRef: s._id },
          {
            $set: {
              credentialsSent: true,
              "credentials.credentialsSentAt": new Date(),
            },
          },
        );

        // ✅ only after email success: activate + save password + mark sent
        user.password = tempPassword; // hashed by schema
        user.status = "active";
        user.credentialsSent = true;
        user.isTemporaryPassword = true;
        await user.save();

        sentStudentIds.push(String(s._id));
        results.push({ studentId: s._id, status: "sent", email: user.email });
      } catch (innerErr) {
        console.error("❌ Bulk credentials error:", s?._id, innerErr);

        // ✅ return useful reason to frontend
        results.push({
          studentId: s?._id,
          status: "failed",
          reason: innerErr?.response || innerErr?.message || "Unknown error",
        });
      }
    }

    return res.status(200).json({
      message: "Bulk credentials processing complete.",
      results,
      sentStudentIds,
    });
  } catch (err) {
    console.error("❌ sendStudentCredentialsBulk error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};