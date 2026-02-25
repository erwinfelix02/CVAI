import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";

function isISODateString(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export const evaluateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedInfo, notes, verifiedDocs } = req.body || {};

    if (!updatedInfo) {
      return res.status(400).json({ message: "updatedInfo is required." });
    }

    const requiredFields = [
      "fullName",
      "studentId",
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

    // ✅ prevent double evaluation
    if (enrollment.studentRef) {
      return res.status(409).json({ message: "This enrollment was already evaluated." });
    }

    const studentIdNumber = String(updatedInfo.studentId).trim();

    // ✅ prevent duplicate studentIdNumber
    const existingStudent = await Student.findOne({ studentIdNumber });
    if (existingStudent) {
      return res.status(409).json({ message: "A student with this Student ID already exists." });
    }

    // ✅ CREATE STUDENT
    const studentDoc = await Student.create({
      enrollmentId: enrollment._id,
      studentIdNumber,

      fullName: String(updatedInfo.fullName).trim(),
      email: String(updatedInfo.email).trim(),
      phone: String(updatedInfo.phone).trim(),
      address: String(updatedInfo.address).trim(),
      birthdate: new Date(updatedInfo.birthdate),

      guardian: String(updatedInfo.guardian).trim(),
      guardianPhone: String(updatedInfo.guardianPhone).trim(),

      program: String(updatedInfo.program).trim(),
      yearLevel: Number(updatedInfo.yearLevel),
      department: String(updatedInfo.department).trim(),

      notes: String(notes || "").trim(),
      verifiedDocs: Array.isArray(verifiedDocs) ? verifiedDocs : [],
    });

    // ✅ UPDATE ENROLLMENT
    enrollment.status = "Enrolled";
    enrollment.studentIdNumber = studentIdNumber;
    enrollment.studentRef = studentDoc._id;

    // keep top-level in sync for list display
    enrollment.email = String(updatedInfo.email).trim();
    enrollment.studentName = String(updatedInfo.fullName).trim();

    enrollment.verifiedDocs = Array.isArray(verifiedDocs) ? verifiedDocs : [];
    enrollment.evaluationNotes = String(notes || "").trim();
    enrollment.evaluatedAt = new Date();

    // sync into nested objects
    enrollment.personal = {
      ...(enrollment.personal || {}),
      email: String(updatedInfo.email).trim(),
      phone: String(updatedInfo.phone).trim(),
      address: String(updatedInfo.address).trim(),
      birthdate: String(updatedInfo.birthdate).trim(),
      guardian: String(updatedInfo.guardian).trim(),
      guardianPhone: String(updatedInfo.guardianPhone).trim(),
    };

    enrollment.academic = {
      ...(enrollment.academic || {}),
      program: String(updatedInfo.program).trim(),
      yearLevel: String(updatedInfo.yearLevel).trim(),
      department: String(updatedInfo.department).trim(),
    };

    await enrollment.save();

    return res.json({
      message: "Student enrolled successfully.",
      student: studentDoc,
      enrollment,
    });
  } catch (err) {
    console.error(err);

    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate student id/email." });
    }

    return res.status(500).json({ message: "Server error." });
  }
};