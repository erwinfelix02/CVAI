import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log("✅ SMTP ready to send emails"))
  .catch(console.error);

export const sendVerificationEmail = async (to, code) => {
  try {
    await transporter.sendMail({
      from: `"Campus AI" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify Your Email",
      html: `<h2>Your verification code: ${code}</h2>`,
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
