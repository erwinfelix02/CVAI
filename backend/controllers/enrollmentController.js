import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
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

/**
 * Preview only.
 * Does NOT reserve anything.
 */
export const reserveStudentId = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id)
      .select("_id studentRef studentIdNumber")
      .lean();

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    // If already enrolled, show real saved student ID
    if (enrollment.studentRef && enrollment.studentIdNumber) {
      return res.status(200).json({
        studentIdNumber: enrollment.studentIdNumber,
      });
    }

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
      "department",
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

    // FINAL ID generation happens only here on save
    const studentIdNumber = await generateId({
      prefix: "GIP",
      scope: "student",
      checks: getStudentIdChecks(),
      startAt: 1,
    });

    const studentDoc = await Student.create({
      enrollmentId: enrollment._id,
      studentIdNumber,

      fullName: String(updatedInfo.fullName).trim(),
      email: String(updatedInfo.email).trim(),
      phone: normalizePhone(updatedInfo.phone),
      address: String(updatedInfo.address).trim(),
      birthdate: new Date(updatedInfo.birthdate),

      guardian: String(updatedInfo.guardian).trim(),
      guardianPhone: normalizePhone(updatedInfo.guardianPhone),

      program: String(updatedInfo.program).trim(),
      yearLevel: Number(updatedInfo.yearLevel),
      department: String(updatedInfo.department).trim(),

      notes: String(notes || "").trim(),
      verifiedDocs: Array.isArray(verifiedDocs) ? verifiedDocs : [],
    });

    enrollment.status = "Enrolled";
    enrollment.studentIdNumber = studentIdNumber;
    enrollment.studentRef = studentDoc._id;

    enrollment.email = String(updatedInfo.email).trim();
    enrollment.studentName = String(updatedInfo.fullName).trim();

    enrollment.verifiedDocs = Array.isArray(verifiedDocs) ? verifiedDocs : [];
    enrollment.evaluationNotes = String(notes || "").trim();
    enrollment.evaluatedAt = new Date();

    enrollment.personal = {
      ...(enrollment.personal || {}),
      email: String(updatedInfo.email).trim(),
      phone: normalizePhone(updatedInfo.phone),
      address: String(updatedInfo.address).trim(),
      birthdate: String(updatedInfo.birthdate).trim(),
      guardian: String(updatedInfo.guardian).trim(),
      guardianPhone: normalizePhone(updatedInfo.guardianPhone),
    };

    enrollment.academic = {
      ...(enrollment.academic || {}),
      program: String(updatedInfo.program).trim(),
      yearLevel: String(updatedInfo.yearLevel).trim(),
      department: String(updatedInfo.department).trim(),
    };

    await enrollment.save();

    addLog({
      action: "Evaluate Enrollment",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Enrollment evaluated and student enrolled: ${updatedInfo.email} (${studentIdNumber})`,
      ip: getClientIp(req),
      status: "success",
    });

    return res.json({
      message: "Student enrolled successfully.",
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