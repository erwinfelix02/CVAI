import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js"; // ✅ Make sure Course is imported
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { addLog, getClientIp } from "../utils/logActivity.js";
import { generateId, peekNextId } from "../utils/generateId.js";

function isISODateString(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function normalizePhone(value = "") {
  let cleanPhone = String(value).trim().replace(/\s+/g, "");
  if (/^09\d{9}$/.test(cleanPhone)) {
    cleanPhone = "+63" + cleanPhone.slice(1);
  }
  if (/^639\d{9}$/.test(cleanPhone)) {
    cleanPhone = "+" + cleanPhone;
  }
  return cleanPhone;
}

function getStudentIdChecks() {
  return [
    { model: Student, field: "studentIdNumber" },
    { model: User, field: "idNumber" },
  ];
}

function generateTempPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

export const reserveStudentId = async (req, res) => {
  try {
    const { id } = req.params;

    // 🟢 Removed .lean() so Mongoose getters run and decrypt the email correctly
    const enrollment = await Enrollment.findById(id).select(
      "_id studentRef studentIdNumber email personal",
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.studentRef && enrollment.studentIdNumber) {
      return res.status(200).json({
        studentIdNumber: enrollment.studentIdNumber,
      });
    }

    // 🟢 Now this will correctly get the decrypted plain-text email
    const applicantEmail = String(
      enrollment.email || enrollment.personal?.email || "",
    )
      .trim()
      .toLowerCase();

    if (applicantEmail) {
      const existingStudent = await Student.findOne({ email: applicantEmail });
      if (existingStudent && existingStudent.studentIdNumber) {
        return res.status(200).json({
          studentIdNumber: existingStudent.studentIdNumber, // Reuses their original ID!
        });
      }
    }

    // Otherwise, peek the next ID in sequence for a brand-new student
    const studentIdNumber = await peekNextId({
      prefix: "GIP",
      scope: "student",
      checks: getStudentIdChecks(),
      startAt: 1,
    });

    return res.status(200).json({ studentIdNumber });
  } catch (err) {
    console.error("reserveStudentId preview error:", err);
    return res.status(500).json({
      message: err.message || "Failed to preview student ID.",
    });
  }
};

export const evaluateEnrollment = async (req, res) => {
  const updatedBy = req.body?.updatedBy || "registrar";

  try {
    const { id } = req.params;
    const { updatedInfo, notes, verifiedDocs } = req.body || {};

    if (!updatedInfo) {
      return res.status(400).json({ message: "updatedInfo is required." });
    }

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "birthdate",
      "guardian",
      "guardianPhone",
      "program",
      "yearLevel",
    ];

    for (const f of requiredFields) {
      if (!updatedInfo[f] || String(updatedInfo[f]).trim() === "") {
        return res.status(400).json({ message: `${f} is required.` });
      }
    }

    if (!isISODateString(updatedInfo.birthdate)) {
      return res.status(400).json({ message: "birthdate must be YYYY-MM-DD." });
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.studentRef) {
      return res.status(409).json({
        message: "This enrollment was already evaluated.",
      });
    }

    const email = String(updatedInfo.email).trim().toLowerCase();
    const phone = normalizePhone(updatedInfo.phone);
    const fullName = String(updatedInfo.fullName).trim();
    const selectedProgram = String(updatedInfo.program || "").trim();
    const yearLevel = Number(updatedInfo.yearLevel);

    // 🟢 Automatically delete/overwrite old duplicate enrollments for this email
    await Enrollment.deleteMany({
      _id: { $ne: enrollment._id },
      email: email,
    });

    // ✅ AUTO-RESOLVE DEPARTMENT BY FETCHING COURSES & MATCHING IN MEMORY
    let resolvedDepartment = String(updatedInfo.department || "").trim();

    if (selectedProgram) {
      const allCourses = await Course.find({});

      const matchedCourse = allCourses.find((c) => {
        const courseName = String(c.name || "")
          .trim()
          .toLowerCase();
        const courseCode = String(c.code || "")
          .trim()
          .toLowerCase();
        const target = selectedProgram.toLowerCase();
        return courseName === target || courseCode === target;
      });

      if (matchedCourse && matchedCourse.department) {
        resolvedDepartment = matchedCourse.department;
      }
    }

    if (!resolvedDepartment) {
      resolvedDepartment = selectedProgram; // Fallback
    }

    // 🟢 Check if student or user already exists (handling previously dropped/inactive students)
    let studentDoc = await Student.findOne({ email });
    let userDoc = await User.findOne({ email });

    let studentIdNumber = "";

    if (studentDoc) {
      // Reuse existing student ID and reactivate status
      studentIdNumber = studentDoc.studentIdNumber;

      // 🟢 FIX: Update enrollmentId reference to point to the NEW current enrollment!
      studentDoc.enrollmentId = enrollment._id;

      studentDoc.status = "Active";
      studentDoc.workflowState = "None";
      studentDoc.fullName = fullName;
      studentDoc.email = email;
      studentDoc.phone = phone;
      studentDoc.address = String(updatedInfo.address).trim();
      studentDoc.birthdate = new Date(updatedInfo.birthdate);
      studentDoc.guardian = String(updatedInfo.guardian).trim();
      studentDoc.guardianPhone = normalizePhone(updatedInfo.guardianPhone);
      studentDoc.program = selectedProgram;
      studentDoc.yearLevel = yearLevel;
      studentDoc.department = resolvedDepartment;
      studentDoc.notes = String(notes || "").trim();
      studentDoc.verifiedDocs = Array.isArray(verifiedDocs) ? verifiedDocs : [];
      await studentDoc.save();
    } else {
      // FINAL ID generation happens only here on save for brand new students
      studentIdNumber = await generateId({
        prefix: "GIP",
        scope: "student",
        checks: getStudentIdChecks(),
        startAt: 1,
      });

      studentDoc = await Student.create({
        enrollmentId: enrollment._id,
        studentIdNumber,
        fullName,
        email,
        phone,
        address: String(updatedInfo.address).trim(),
        birthdate: new Date(updatedInfo.birthdate),
        guardian: String(updatedInfo.guardian).trim(),
        guardianPhone: normalizePhone(updatedInfo.guardianPhone),
        program: selectedProgram,
        yearLevel,
        department: resolvedDepartment,
        notes: String(notes || "").trim(),
        verifiedDocs: Array.isArray(verifiedDocs) ? verifiedDocs : [],
        status: "Active",
        workflowState: "None",
      });
    }

    // 🟢 Generate a new temporary password and reactivate/create the User login account
    const tempPassword = generateTempPassword(10);

    if (userDoc) {
      userDoc.status = "active";
      userDoc.department = resolvedDepartment;
      userDoc.idNumber = studentIdNumber;
      userDoc.password = tempPassword;
      userDoc.credentialsSent = false;
      await userDoc.save();
    } else {
      userDoc = await User.create({
        firstName: fullName.split(" ")[0] || fullName,
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        idNumber: studentIdNumber,
        email,
        phone,
        gender: updatedInfo.gender || "Not Specified",
        role: "Student",
        department: resolvedDepartment,
        status: "inactive",
        password: tempPassword,
        isTemporaryPassword: true,
        credentialsSent: false,
      });
    }

    // ✉️ Send reactivated account credentials via email
    const appName = process.env.APP_NAME || "CVAI Portal";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f766e; margin-top: 0;">Welcome Back to ${appName}</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your enrollment has been successfully approved and your student account has been reactivated.</p>
        <p><strong>ID Number / Username:</strong> ${studentIdNumber}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please log in to your student portal and change your password immediately.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          This is an official automated notification sent via ${appName}. Please do not reply directly to this email.
        </p>
      </div>
    `;

    await sendEmail(
      email,
      `Your Reactivated Login Credentials - ${appName}`,
      emailHtml,
    );

    enrollment.status = "Enrolled";
    enrollment.studentIdNumber = studentIdNumber;
    enrollment.studentRef = studentDoc._id;

    enrollment.email = email;
    enrollment.studentName = fullName;

    enrollment.verifiedDocs = Array.isArray(verifiedDocs) ? verifiedDocs : [];
    enrollment.evaluationNotes = String(notes || "").trim();
    enrollment.evaluatedAt = new Date();
    enrollment.credentialsSent = false;

    enrollment.personal = {
      ...(enrollment.personal || {}),
      email: email,
      phone: phone,
      address: String(updatedInfo.address).trim(),
      birthdate: String(updatedInfo.birthdate).trim(),
      guardian: String(updatedInfo.guardian).trim(),
      guardianPhone: normalizePhone(updatedInfo.guardianPhone),
    };

    enrollment.academic = {
      ...(enrollment.academic || {}),
      program: selectedProgram,
      yearLevel: String(updatedInfo.yearLevel).trim(),
      department: resolvedDepartment,
    };

    await enrollment.save();

    addLog({
      action: "Evaluate Enrollment & Send Credentials",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Enrollment evaluated, student reactivated & enrolled: ${email} (${studentIdNumber}) under dept: ${resolvedDepartment}`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.json({
      message:
        "Student enrolled, reactivated, and credentials sent successfully.",
      student: studentDoc,
      enrollment,
      studentIdNumber,
    });
  } catch (err) {
    console.error(err);

    addLog({
      action: "Evaluate Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed to evaluate enrollment: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate student id/email." });
    }

    return res.status(500).json({ message: err.message || "Server error." });
  }
};
