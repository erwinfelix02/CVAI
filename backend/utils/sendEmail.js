import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });

  console.log("📧 Email sent to:", to);
};

export default sendEmail;
