import Student from "../models/Student.js";
import validator from "validator";
import { addLog, getClientIp } from "../utils/logActivity.js";

export const getStudentsByEnrollmentIds = async (req, res) => {
  try {
    const { enrollmentIds } = req.body || {};

    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return res.status(400).json({
        message: "enrollmentIds is required and must be a non-empty array.",
      });
    }

    const students = await Student.find({
      enrollmentId: { $in: enrollmentIds },
    }).sort({ createdAt: -1 });

    return res.json(students);
  } catch (err) {
    console.error("getStudentsByEnrollmentIds error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentsCount = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    return res.json({ total });
  } catch (err) {
    console.error("getStudentsCount error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const buildStudentFilter = (query) => {
  const {
    q = "",
    status = "All",
    course = "All",
    year = "All",
    section = "All",
    exportStatus = "All",
  } = query;

  const filter = {};

  const effectiveStatus = exportStatus !== "All" ? exportStatus : status;

  if (effectiveStatus !== "All") {
    filter.status = effectiveStatus;
  }

  if (course !== "All") {
    filter.program = String(course).trim();
  }

  if (year !== "All") {
    const yearNumber = Number(year);
    if (!Number.isNaN(yearNumber)) {
      filter.yearLevel = yearNumber;
    }
  }

  if (section !== "All") {
    filter.section = String(section).trim();
  }

  const search = String(q).trim();
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { studentIdNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { program: { $regex: search, $options: "i" } },
      { section: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
};

const mapStudentRow = (s) => {
  const fullName = String(s.fullName || "").trim();

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");

  return {
    id: s.studentIdNumber,
    initials,
    name: fullName,
    email: s.email,
    course: s.program || "—",
    section: s.section || "—",
    year: s.yearLevel ?? 0,
    status: s.status || "Active",
  };
};

export const getStudentRecords = async (req, res) => {
  try {
    const filter = buildStudentFilter(req.query);

    const students = await Student.find(filter).sort({ createdAt: -1 });
    const rows = students.map(mapStudentRow);

    return res.json(rows);
  } catch (err) {
    console.error("getStudentRecords error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const exportStudentRecords = async (req, res) => {
  try {
    const filter = buildStudentFilter(req.query);

    const students = await Student.find(filter).sort({ createdAt: -1 });

    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No student records found to export." });
    }

    const rows = students.map((s) => ({
      "Student ID": s.studentIdNumber || "",
      Name: s.fullName || "",
      Email: s.email || "",
      Course: s.program || "",
      Section: s.section || "",
      Year: s.yearLevel ?? "",
      Department: s.department || "",
      Status: s.status || "",
      Phone: s.phone || "",
      Address: s.address || "",
      Guardian: s.guardian || "",
      "Guardian Phone": s.guardianPhone || "",
      Birthdate: s.birthdate
        ? new Date(s.birthdate).toLocaleDateString("en-US")
        : "",
      "Enrolled Date": s.createdAt
        ? new Date(s.createdAt).toLocaleDateString("en-US")
        : "",
    }));

    const headers = Object.keys(rows[0]);

    const escapeCsv = (value) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => escapeCsv(row[header])).join(","),
      ),
    ].join("\n");

    const exportStatus = req.query.exportStatus || "All";
    const suffix =
      exportStatus === "All" ? "all" : String(exportStatus).toLowerCase();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="student-records-${suffix}.csv"`,
    );

    return res.status(200).send(csv);
  } catch (err) {
    console.error("exportStudentRecords error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findOne({ studentIdNumber: id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const formatDate = (d) => {
      if (!d) return null;
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return res.json({
      id: student.studentIdNumber,
      name: student.fullName,
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",

      course: student.program || "",
      year: student.yearLevel ?? 0,
      section: student.section || "—",
      department: student.department || "",

      guardian: student.guardian || "",
      guardianPhone: student.guardianPhone || "",

      birthdate: formatDate(student.birthdate),
      enrolledDate: formatDate(student.createdAt),

      status: student.status || "Active",
    });
  } catch (err) {
    console.error("getStudentById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateStudentInfo = async (req, res) => {
  const updatedBy = req.body?.updatedBy || "registrar";

  try {
    const { id } = req.params;
    const {
      email,
      phone,
      guardian,
      guardianPhone,
      birthdate,
      program,
      yearLevel,
      department,
    } = req.body || {};

    const student = await Student.findOne({ studentIdNumber: id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const changes = [];

    if (email !== undefined) {
      const cleanEmail =
        validator.normalizeEmail(String(email).trim()) || String(email).trim();

      if (!validator.isEmail(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format." });
      }

      const existingEmail = await Student.findOne({
        _id: { $ne: student._id },
        email: cleanEmail,
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists." });
      }

      if (String(student.email || "") !== cleanEmail) {
        changes.push(`email: "${student.email || ""}" -> "${cleanEmail}"`);
        student.email = cleanEmail;
      }
    }

    if (phone !== undefined) {
      let cleanPhone = String(phone).trim().replace(/\s+/g, "");

      if (/^09\d{9}$/.test(cleanPhone)) {
        cleanPhone = "+63" + cleanPhone.slice(1);
      }

      if (/^639\d{9}$/.test(cleanPhone)) {
        cleanPhone = "+" + cleanPhone;
      }

      if (!/^\+639\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          message: "Phone must be in format +639XXXXXXXXX.",
        });
      }

      if (String(student.phone || "") !== cleanPhone) {
        changes.push(`phone updated`);
        student.phone = cleanPhone;
      }
    }

    if (guardian !== undefined) {
      const cleanGuardian = String(guardian).trim();
      if (String(student.guardian || "") !== cleanGuardian) {
        changes.push(`guardian updated`);
        student.guardian = cleanGuardian;
      }
    }

    if (guardianPhone !== undefined) {
      const cleanGuardianPhone = String(guardianPhone).trim();
      if (String(student.guardianPhone || "") !== cleanGuardianPhone) {
        changes.push(`guardianPhone updated`);
        student.guardianPhone = cleanGuardianPhone;
      }
    }

    if (birthdate !== undefined) {
      const nextBirthdate = birthdate || null;
      const prevBirthdate = student.birthdate
        ? new Date(student.birthdate).toISOString().slice(0, 10)
        : "";

      if (String(prevBirthdate) !== String(nextBirthdate || "")) {
        changes.push(`birthdate updated`);
        student.birthdate = nextBirthdate;
      }
    }

    if (program !== undefined) {
      const cleanProgram = String(program).trim();
      if (String(student.program || "") !== cleanProgram) {
        changes.push(`program: "${student.program || ""}" -> "${cleanProgram}"`);
        student.program = cleanProgram;
      }
    }

    if (yearLevel !== undefined) {
      const parsedYearLevel = Number(yearLevel);

      if (Number.isNaN(parsedYearLevel)) {
        return res.status(400).json({ message: "Invalid year level." });
      }

      if (Number(student.yearLevel || 0) !== parsedYearLevel) {
        changes.push(
          `yearLevel: "${student.yearLevel ?? ""}" -> "${parsedYearLevel}"`,
        );
        student.yearLevel = parsedYearLevel;
      }
    }

    if (department !== undefined) {
      const cleanDepartment = String(department).trim();
      if (String(student.department || "") !== cleanDepartment) {
        changes.push(
          `department: "${student.department || ""}" -> "${cleanDepartment}"`,
        );
        student.department = cleanDepartment;
      }
    }

    await student.save();

    addLog({
      action: "Edit Student Record",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details:
        changes.length > 0
          ? `Student record updated (${student.email || student.studentIdNumber}). Changes: ${changes.join(", ")}`
          : `Student record saved with no detected changes (${student.email || student.studentIdNumber}).`,
      ip: getClientIp(req),
      status: "success",
    });

    const formatDate = (d) => {
      if (!d) return null;
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return res.status(200).json({
      message: "Student information updated successfully.",
      student: {
        id: student.studentIdNumber,
        name: student.fullName,
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",

        course: student.program || "",
        year: student.yearLevel ?? 0,
        section: student.section || "—",
        department: student.department || "",

        guardian: student.guardian || "",
        guardianPhone: student.guardianPhone || "",

        birthdate: formatDate(student.birthdate),
        enrolledDate: formatDate(student.createdAt),

        status: student.status || "Active",
      },
    });
  } catch (err) {
    console.error("updateStudentInfo error:", err);

    addLog({
      action: "Edit Student Record",
      user: updatedBy,
      role: "Registrar",
      type: "Data",
      details: `Failed to update student record: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({
      message: "Server error",
    });
  }
};