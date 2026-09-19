import Student from "../models/Student.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import validator from "validator";
import { addLog, getClientIp } from "../utils/logActivity.js";

const formatYearLevel = (year) => {
  const y = Number(year);
  if (!y || isNaN(y)) return "1st Year";
  if (y === 1) return "1st Year";
  if (y === 2) return "2nd Year";
  if (y === 3) return "3rd Year";
  if (y >= 4) return `${y}th Year`;
  return `${y} Year`;
};

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
    facultyId = "",
    facultyName = "",
  } = query;

  const filter = {};

  if (facultyId) {
    filter.facultyId = String(facultyId).trim();
  } else if (facultyName) {
    filter.facultyName = String(facultyName).trim();
  }

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
      { fullName: { $regex: search,$options: "i" } },
      { studentIdNumber: { $regex: search,$options: "i" } },
      { email: { $regex: search,$options: "i" } },
      { program: { $regex: search,$options: "i" } },
      { section: { $regex: search,$options: "i" } },
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
    _id: s._id,
    id: s.studentIdNumber,
    initials,
    name: fullName,
    email: s.email || "",
    phone: s.phone || "",
    address: s.address || "N/A",
    course: s.program || "—",
    program: s.program || "—",
    section: s.section || "—",
    year: s.yearLevel ?? 1,
    yearLevel: formatYearLevel(s.yearLevel),
    department: s.department || "—",
    enrolledSubjects: s.enrolledSubjects || [],
    status: s.status === "Active" ? "good" : "warning",
    gpa: 3.5,
    attendance: 100,
    facultyId: s.facultyId || "",
    facultyName: s.facultyName || "",
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
      Year: formatYearLevel(s.yearLevel),
      Department: s.department || "",
      "Enrolled Subjects": Array.isArray(s.enrolledSubjects)
        ? s.enrolledSubjects.join("; ")
        : "",
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
        headers.map((header) => escapeCsv(row[header])).join(",")
      ),
    ].join("\n");

    const exportStatus = req.query.exportStatus || "All";
    const suffix =
      exportStatus === "All" ? "all" : String(exportStatus).toLowerCase();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="student-records-${suffix}.csv"`
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
    const cleanId = String(id).trim();

    const query = [];

    // 1. Match MongoDB _id if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      query.push({ _id: cleanId });
    }

    // 2. Match studentIdNumber or email
    query.push({ studentIdNumber: cleanId });
    query.push({ email: cleanId.toLowerCase() });

    let student = await Student.findOne({ $or: query });

    // 3. Fallback: If id belongs to a User document, search Student by User's email/idNumber
    if (!student && mongoose.Types.ObjectId.isValid(cleanId)) {
      const user = await User.findById(cleanId);
      if (user) {
        student = await Student.findOne({
          $or: [
            { email: user.email?.toLowerCase() },
            { studentIdNumber: user.idNumber || user.studentIdNumber },
          ],
        });
      }
    }

    if (!student) {
      console.warn(`[getStudentById] No student record found for: "${id}"`);
      return res.status(404).json({ message: "Student record not found." });
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
      _id: student._id,
      id: student.studentIdNumber,
      studentIdNumber: student.studentIdNumber,
      name: student.fullName,
      fullName: student.fullName,
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",
      course: student.program || "",
      program: student.program || "",
      year: student.yearLevel ?? 1,
      yearLevel: student.yearLevel,
      section: student.section || "—",
      department: student.department || "",
      enrolledSubjects: Array.isArray(student.enrolledSubjects)
        ? student.enrolledSubjects
        : [],
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
      address,
      guardian,
      guardianPhone,
      birthdate,
      program,
      course,
      yearLevel,
      department,
      enrolledSubjects,
    } = req.body || {};

    const student = await Student.findOne({ studentIdNumber: id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const changes = [];

    if (Array.isArray(enrolledSubjects)) {
      const cleanSubjects = enrolledSubjects
        .map((s) => String(s).trim())
        .filter(Boolean);

      student.enrolledSubjects = Array.from(new Set(cleanSubjects));
      changes.push(`enrolledSubjects updated (${cleanSubjects.length} subjects)`);
    }

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

    if (address !== undefined) {
      const cleanAddress = String(address).trim();
      if (String(student.address || "") !== cleanAddress) {
        changes.push(`address updated`);
        student.address = cleanAddress;
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

    const targetProgram = program || course;
    if (targetProgram !== undefined) {
      const cleanProgram = String(targetProgram).trim();
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
          `yearLevel: "${student.yearLevel ?? ""}" -> "${parsedYearLevel}"`
        );
        student.yearLevel = parsedYearLevel;
      }
    }

    if (department !== undefined) {
      const cleanDepartment = String(department).trim();
      if (String(student.department || "") !== cleanDepartment) {
        changes.push(
          `department: "${student.department || ""}" -> "${cleanDepartment}"`
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
        program: student.program || "",
        year: student.yearLevel ?? 1,
        yearLevel: formatYearLevel(student.yearLevel),
        section: student.section || "—",
        department: student.department || "",
        enrolledSubjects: student.enrolledSubjects || [],
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

export const createStudent = async (req, res) => {
  const createdBy = req.body?.createdBy || req.body?.facultyName || "Faculty";

  try {
    const {
      name,
      fullName,
      id,
      studentIdNumber,
      email,
      section,
      course,
      program,
      department,
      yearLevel,
      phone,
      address,
      birthdate,
      guardian,
      guardianPhone,
      facultyId,
      facultyName,
      enrolledSubjects = [],
      enrollmentId,
    } = req.body || {};

    const cleanName = String(fullName || name || "").trim();
    const cleanIdNumber = String(studentIdNumber || id || "").trim();
    const cleanSection = String(section || "").trim();

    if (!cleanName || !cleanIdNumber || !cleanSection) {
      return res.status(400).json({
        message: "Full name, Student ID number, and Class/Section are required.",
      });
    }

    let student = await Student.findOne({ studentIdNumber: cleanIdNumber });

    if (student && student.section === cleanSection) {
      return res.status(400).json({
        message: `Student "${cleanName}" (${cleanIdNumber}) is already enrolled in section "${cleanSection}".`,
      });
    }

    const providedProgram = String(program || course || "").trim();

    if (student) {
      student.section = cleanSection;
      student.facultyId = facultyId || student.facultyId;
      student.facultyName = facultyName || student.facultyName;
      if (address) student.address = address;
      if (yearLevel) student.yearLevel = Number(yearLevel);
      if (department) student.department = department;

      if (providedProgram) {
        student.program = providedProgram;
      }

      if (Array.isArray(enrolledSubjects) && enrolledSubjects.length > 0) {
        student.enrolledSubjects = Array.from(
          new Set([...(student.enrolledSubjects || []), ...enrolledSubjects.map((s) => String(s).trim())])
        );
      }

      await student.save();

      const initials = cleanName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase())
        .join("");

      return res.status(200).json({
        message: `Student assigned to section "${cleanSection}" successfully.`,
        student: {
          _id: student._id,
          initials,
          name: student.fullName,
          id: student.studentIdNumber,
          section: student.section || "—",
          gpa: 3.5,
          attendance: 100,
          status: "good",
          course: student.program,
          program: student.program,
          year: student.yearLevel ?? 1,
          yearLevel: formatYearLevel(student.yearLevel),
          department: student.department,
          enrolledSubjects: student.enrolledSubjects || [],
          email: student.email,
          phone: student.phone,
          address: student.address || "",
          facultyId: student.facultyId,
          facultyName: student.facultyName,
        },
      });
    }

    let defaultProgram = providedProgram;
    if (!defaultProgram) {
      const existingUser = await User.findOne({
        $or: [{ idNumber: cleanIdNumber }, { email: email }],
      });
      defaultProgram = existingUser?.program || existingUser?.course || "BS Computer Science";
    }

    let finalEnrollmentId = enrollmentId;
    if (!finalEnrollmentId || !mongoose.Types.ObjectId.isValid(finalEnrollmentId)) {
      finalEnrollmentId = new mongoose.Types.ObjectId();
    }

    const cleanEmail = email ? validator.normalizeEmail(String(email).trim()) : "";

    student = new Student({
      enrollmentId: finalEnrollmentId,
      studentIdNumber: cleanIdNumber,
      fullName: cleanName,
      email: cleanEmail || `${cleanIdNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@university.edu`,
      phone: phone || "+639000000000",
      address: address || "N/A",
      birthdate: birthdate ? new Date(birthdate) : new Date("2000-01-01"),
      guardian: guardian || "N/A",
      guardianPhone: guardianPhone || "+639000000000",
      program: defaultProgram,
      yearLevel: yearLevel ? Number(yearLevel) : 1,
      section: cleanSection,
      department: department || "College of Computer Studies",
      enrolledSubjects: Array.isArray(enrolledSubjects)
        ? Array.from(new Set(enrolledSubjects.map((s) => String(s).trim())))
        : [],
      facultyId: facultyId || "",
      facultyName: facultyName || "",
      status: "Active",
    });

    const savedStudent = await student.save();

    const initials = cleanName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("");

    return res.status(201).json({
      message: "Student added successfully.",
      student: {
        _id: savedStudent._id,
        initials,
        name: savedStudent.fullName,
        id: savedStudent.studentIdNumber,
        section: savedStudent.section || "—",
        gpa: 3.5,
        attendance: 100,
        status: "good",
        course: savedStudent.program,
        program: savedStudent.program,
        year: savedStudent.yearLevel ?? 1,
        yearLevel: formatYearLevel(savedStudent.yearLevel),
        department: savedStudent.department,
        enrolledSubjects: savedStudent.enrolledSubjects || [],
        email: savedStudent.email,
        phone: savedStudent.phone,
        address: savedStudent.address || "",
        facultyId: savedStudent.facultyId,
        facultyName: savedStudent.facultyName,
      },
    });
  } catch (err) {
    console.error("createStudent error:", err);
    return res.status(500).json({
      message: err.message || "Server error while processing student record.",
    });
  }
};