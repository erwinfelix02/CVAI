// backend/controllers/studentController.js

import Student from "../models/Student.js";
import User from "../models/User.js";
import RegistrarSettings from "../models/RegistrarSettings.js";
import mongoose from "mongoose";
import validator from "validator";
import Subject from "../models/Subject.js";
import { hashLookup, decrypt } from "../utils/fieldCrypto.js";
import { addLog, getClientIp } from "../utils/logActivity.js";
import Section from "../models/Section.js";

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

  // Normalize grades
  let gradesObj = {};
  if (s.grades) {
    if (s.grades instanceof Map) {
      gradesObj = Object.fromEntries(s.grades);
    } else if (typeof s.grades === "object") {
      gradesObj = s.grades;
    }
  }

  return {
    _id: s._id,
    id: s.studentIdNumber,
    initials,
    name: fullName,
    email: s.email || "",
    phone: s.phone || "",
    avatarUrl: s.avatarUrl || "",
    address: s.address || "N/A",
    course: s.program || "—",
    program: s.program || "—",
    section: s.section || "—",
    year: s.yearLevel ?? 1,
    yearLevel: formatYearLevel(s.yearLevel),
    department: s.department || "—",
    enrolledSubjects: s.enrolledSubjects || [],
    grades: gradesObj,
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

    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();

    if (!students.length) {
      return res.json([]);
    }

    const studentEmails = students.map((s) => s.email).filter(Boolean);
    const users = await User.find({ email: { $in: studentEmails } })
      .select("email avatarUrl")
      .lean();

    const userAvatarMap = new Map(
      users.map((u) => [String(u.email).toLowerCase(), u.avatarUrl]),
    );

    const rows = students.map((s) => {
      const row = mapStudentRow(s);
      const fallbackAvatar = userAvatarMap.get(String(s.email).toLowerCase());
      row.avatarUrl = s.avatarUrl || fallbackAvatar || "";
      return row;
    });

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
    const cleanId = String(id).trim();

    const query = [];

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      query.push({ _id: cleanId });
    }

    query.push({ studentIdNumber: cleanId });
    query.push({
      email: {
        $regex: new RegExp(
          `^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
    });

    let student = await Student.findOne({ $or: query });

    if (!student && mongoose.Types.ObjectId.isValid(cleanId)) {
      const user = await User.findById(cleanId);
      if (user) {
        student = await Student.findOne({
          $or: [
            ...(user.email
              ? [
                  {
                    email: {
                      $regex: new RegExp(
                        `^${user.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                        "i",
                      ),
                    },
                  },
                ]
              : []),
            ...(user.idNumber || user.studentIdNumber
              ? [{ studentIdNumber: user.idNumber || user.studentIdNumber }]
              : []),
          ],
        });
      }
    }

    if (!student) {
      const user = await User.findOne({
        $or: [
          {
            email: {
              $regex: new RegExp(
                `^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i",
              ),
            },
          },
          { idNumber: cleanId },
        ],
      });

      if (user) {
        student = await Student.findOne({
          $or: [
            ...(user.email
              ? [
                  {
                    email: {
                      $regex: new RegExp(
                        `^${user.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                        "i",
                      ),
                    },
                  },
                ]
              : []),
            ...(user.idNumber || user.studentIdNumber
              ? [{ studentIdNumber: user.idNumber || user.studentIdNumber }]
              : []),
          ],
        });
      }
    }

    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    let studentAvatar = student.avatarUrl || "";
    if (!studentAvatar && student.email) {
      const matchedUser = await User.findOne({ email: student.email })
        .select("avatarUrl")
        .lean();
      if (matchedUser) {
        studentAvatar = matchedUser.avatarUrl || "";
      }
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
      verifiedDocs: student.verifiedDocs || [],
      avatarUrl: studentAvatar,
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
      verifiedDocs,
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
      changes.push(
        `enrolledSubjects updated (${cleanSubjects.length} subjects)`,
      );
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

    if (req.body.avatarUrl !== undefined) {
      student.avatarUrl = req.body.avatarUrl;
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
        changes.push(
          `program: "${student.program || ""}" -> "${cleanProgram}"`,
        );
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
        verifiedDocs: student.verifiedDocs || [],
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

    return res.status(500).json({ message: "Server error" });
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
        message:
          "Full name, Student ID number, and Class/Section are required.",
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
          new Set([
            ...(student.enrolledSubjects || []),
            ...enrolledSubjects.map((s) => String(s).trim()),
          ]),
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
      defaultProgram =
        existingUser?.program || existingUser?.course || "BS Computer Science";
    }

    let finalEnrollmentId = enrollmentId;
    if (
      !finalEnrollmentId ||
      !mongoose.Types.ObjectId.isValid(finalEnrollmentId)
    ) {
      finalEnrollmentId = new mongoose.Types.ObjectId();
    }

    const cleanEmail = email
      ? validator.normalizeEmail(String(email).trim())
      : "";

    student = new Student({
      enrollmentId: finalEnrollmentId,
      studentIdNumber: cleanIdNumber,
      fullName: cleanName,
      email:
        cleanEmail ||
        `${cleanIdNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@university.edu`,
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

export const uploadProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const relativePath = `/uploads/avatars/${req.file.filename}`;
    const { id } = req.params;

    if (id && id !== "—") {
      await Student.findOneAndUpdate(
        { $or: [{ studentIdNumber: id }, { email: id }] },
        { avatarUrl: relativePath },
      );
    }

    if (req.user?.id || req.user?._id) {
      await User.findByIdAndUpdate(req.user.id || req.user._id, {
        avatarUrl: relativePath,
      });
    }

    return res.status(200).json({
      message: "Avatar uploaded successfully.",
      avatarUrl: relativePath,
    });
  } catch (err) {
    console.error("uploadProfileAvatar error:", err);
    return res.status(500).json({ message: "Server error uploading avatar." });
  }
};

export const getStudentsBySectionId = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const sectionDoc = await Section.findById(sectionId);
    if (!sectionDoc) {
      return res.status(404).json({ message: "Section not found." });
    }

    const sectionCode = String(sectionDoc.code || "").trim();
    const sectionName = String(sectionDoc.name || "").trim();

    let resolvedAdviser = "TBA";
    if (sectionDoc.adviser) {
      if (
        typeof sectionDoc.adviser === "string" &&
        !sectionDoc.adviser.match(/^[0-9a-fA-F]{24}$/)
      ) {
        resolvedAdviser = sectionDoc.adviser;
      } else {
        const adviserUser = await User.findById(sectionDoc.adviser);
        if (adviserUser) {
          resolvedAdviser =
            `${adviserUser.firstName || ""} ${adviserUser.lastName || ""}`.trim() ||
            "TBA";
        }
      }
    } else if (sectionDoc.adviserName) {
      resolvedAdviser = sectionDoc.adviserName;
    }

    const queryConditions = [];
    if (sectionCode) {
      queryConditions.push({
        section: { $regex: new RegExp(`^${sectionCode}$`, "i") },
      });
      queryConditions.push({
        section: { $regex: new RegExp(sectionCode, "i") },
      });
    }
    if (sectionName) {
      queryConditions.push({
        section: { $regex: new RegExp(`^${sectionName}$`, "i") },
      });
      queryConditions.push({
        section: { $regex: new RegExp(sectionName, "i") },
      });
    }
    queryConditions.push({ enrollmentId: sectionId });
    queryConditions.push({ sectionId: sectionId });
    queryConditions.push({ sectionRef: sectionId });

    const students = await Student.find({ $or: queryConditions });

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No student records found inside this section." });
    }

    const isValidValue = (val) => {
      if (!val) return false;
      const str = String(val).trim().toLowerCase();
      return (
        str !== "" &&
        str !== "n/a" &&
        str !== "undefined" &&
        str !== "null" &&
        !str.startsWith("enc::v1::")
      );
    };

    const formatted = await Promise.all(
      students.map(async (s) => {
        const studentEmail = String(s.email || "")
          .trim()
          .toLowerCase();
        const studentIdNum = String(s.studentIdNumber || "")
          .trim()
          .toLowerCase();
        const studentName = String(s.fullName || "")
          .trim()
          .toLowerCase();

        let matchedUser = null;

        if (studentEmail) {
          try {
            const emailH = hashLookup("email", studentEmail);
            matchedUser = await User.findOne({ emailHash: emailH });
          } catch (e) {
            matchedUser = await User.findOne({ email: studentEmail });
          }
        }

        if (!matchedUser && studentIdNum) {
          try {
            const idH = hashLookup("idNumber", studentIdNum);
            matchedUser = await User.findOne({ idNumberHash: idH });
          } catch (e) {
            matchedUser = await User.findOne({ idNumber: studentIdNum });
          }
        }

        if (!matchedUser && studentName) {
          const allUsers = await User.find({ role: "Student" });
          matchedUser = allUsers.find((u) => {
            const uFullName = `${u.firstName || ""} ${u.lastName || ""}`
              .trim()
              .toLowerCase();
            return uFullName === studentName;
          });
        }

        let uGender = "";
        if (matchedUser) {
          const rawGenderCipher = matchedUser.get("gender", null, {
            getters: false,
          });
          try {
            const decryptedGender = decrypt(rawGenderCipher);
            if (isValidValue(decryptedGender)) {
              uGender = decryptedGender;
            }
          } catch (err) {
            console.error("❌ CRITICAL DECRYPTION ERROR:", err.message);
          }
        }

        const uFirstName = matchedUser?.firstName || "";
        const uLastName = matchedUser?.lastName || "";
        const uEmail = matchedUser?.email || "";
        const uPhone = matchedUser?.phone || "";
        const uBirthdate =
          matchedUser?.birthdate || matchedUser?.birthDate || "";

        const rawName = isValidValue(s.fullName)
          ? s.fullName
          : uFirstName
            ? `${uFirstName} ${uLastName}`.trim()
            : "N/A";

        const rawEmail = isValidValue(studentEmail)
          ? studentEmail
          : isValidValue(uEmail)
            ? uEmail
            : "N/A";

        const rawPhone = isValidValue(s.phone)
          ? s.phone
          : isValidValue(s.guardianPhone)
            ? s.guardianPhone
            : isValidValue(uPhone)
              ? uPhone
              : "N/A";

        let rawGender = "N/A";
        if (isValidValue(s.gender)) {
          rawGender = s.gender;
        } else if (isValidValue(uGender)) {
          rawGender = uGender;
        }

        const rawBirthdate = isValidValue(s.birthdate)
          ? s.birthdate
          : isValidValue(s.birthDate)
            ? s.birthDate
            : isValidValue(uBirthdate)
              ? uBirthdate
              : "";

        let computedAge = "N/A";
        let readableBirthdate = "N/A";

        if (rawBirthdate && rawBirthdate !== "N/A") {
          const bDate = new Date(rawBirthdate);
          if (!isNaN(bDate.getTime())) {
            const diff = Date.now() - bDate.getTime();
            computedAge = Math.abs(new Date(diff).getUTCFullYear() - 1970);

            readableBirthdate = bDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
          }
        }

        return {
          id: s._id?.toString(),
          name: rawName !== "N/A" ? rawName : "Unnamed Student",
          section: s.section || sectionCode || "N/A",
          adviser: resolvedAdviser,
          email: rawEmail,
          phone: rawPhone,
          gender: rawGender,
          attendance: s.attendance ?? 100,
          age: computedAge,
          birthdate: readableBirthdate,
        };
      }),
    );

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("getStudentsBySectionId error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching section students." });
  }
};

export const saveStudentGrade = async (req, res) => {
  try {
    const {
      studentId,
      studentNo,
      studentName,
      subjectCode,
      faculty,
      department,
      term,
      grades,
    } = req.body;

    if (!studentId || !subjectCode) {
      return res
        .status(400)
        .json({ error: "Missing required studentId or subjectCode fields." });
    }

    // 1. Fetch current active Academic Year from Registrar Settings
    const settings = await RegistrarSettings.findOne();
    const activeAcademicYear = settings?.academicYear || "2023-2024";

    // 2. Fetch the Subject document to extract its specific assigned semester
    const matchedSubject = await Subject.findOne({
      code: { $regex: new RegExp(`^${subjectCode.trim()}$`, "i") },
    });
    const subjectSemester =
      matchedSubject?.semester || settings?.semester || "1st Semester";

    let student = await Student.findOne({
      $or: [{ _id: studentId }, { studentIdNumber: studentNo }],
    });

    if (!student) {
      return res
        .status(404)
        .json({ error: "Student record not found in the database." });
    }

    if (!student.grades) {
      student.grades = new Map();
    }

    const currentSubjectGrades = student.grades.get(subjectCode) || {
      prelim: { quizzes: "", activities: "", examination: "", grade: "—" },
      midterm: { quizzes: "", activities: "", examination: "", grade: "—" },
      finals: { quizzes: "", activities: "", examination: "", grade: "—" },
      finalGrade: "—",
      status: "pending",
    };

    if (term && grades[term]) {
      currentSubjectGrades[term] = grades[term];
    }

    if (grades.finalGrade) currentSubjectGrades.finalGrade = grades.finalGrade;
    if (grades.status) currentSubjectGrades.status = grades.status;

    // 3. Attach the registrar's active academic year and the subject's semester context
    currentSubjectGrades.academicYear = activeAcademicYear;
    currentSubjectGrades.semester = subjectSemester;
    currentSubjectGrades.studentYearLevel = student.yearLevel || 1;

    currentSubjectGrades.updatedByFaculty = faculty;
    currentSubjectGrades.updatedAt = new Date();

    student.grades.set(subjectCode, currentSubjectGrades);
    student.markModified("grades");

    await student.save();

    return res.status(200).json({
      success: true,
      message: `Grade saved for ${studentName || student.fullName} under ${subjectCode} (${activeAcademicYear} - ${subjectSemester})`,
      grades: currentSubjectGrades,
    });
  } catch (err) {
    console.error("saveStudentGrade error:", err);
    return res
      .status(500)
      .json({ message: "Server error while saving grade." });
  }
};

// backend/controllers/studentController.js

// backend/controllers/studentController.js

export const getStudentGrades = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    let userEmail = req.user?.email;
    let studentIdNum = req.user?.idNumber || req.user?.studentIdNumber;
    let userName =
      req.user?.name ||
      `${req.user?.firstName || ""} ${req.user?.lastName || ""}`.trim();

    let student = null;

    // 1. Query WITH Mongoose hooks enabled so encrypted fields decrypt properly
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      student = await Student.findById(userId);
    }
    if (!student && studentIdNum) {
      student = await Student.findOne({ studentIdNumber: studentIdNum });
    }
    if (!student && userEmail) {
      student = await Student.findOne({ email: userEmail });
    }

    // 2. Fallback lookup across all student documents if direct query misses
    if (!student) {
      const allStudents = await Student.find({});

      if (userEmail) {
        student = allStudents.find(
          (s) =>
            String(s.email || "")
              .trim()
              .toLowerCase() === String(userEmail).trim().toLowerCase(),
        );
      }
      if (!student && studentIdNum) {
        student = allStudents.find(
          (s) =>
            String(s.studentIdNumber || "").trim() ===
            String(studentIdNum).trim(),
        );
      }
      if (!student && userName) {
        student = allStudents.find((s) => {
          const sName = String(s.fullName || "")
            .trim()
            .toLowerCase();
          return (
            sName === userName.toLowerCase() ||
            sName.includes(userName.toLowerCase())
          );
        });
      }

      if (!student) {
        student =
          allStudents.find(
            (s) =>
              s.grades &&
              (s.grades instanceof Map
                ? s.grades.size > 0
                : Object.keys(s.grades).length > 0),
          ) || allStudents[0];
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found in database.",
      });
    }

    const settings = await RegistrarSettings.findOne();
    const activeAcademicYear = settings?.academicYear || "2025-2026";

    // 3. Safely unwrap Mongoose Map grades into a plain JavaScript object with full term data
    const savedGrades = {};
    const rawGrades = student.grades;

    if (rawGrades) {
      if (rawGrades instanceof Map) {
        for (const [code, val] of rawGrades.entries()) {
          if (code) {
            const upperCode = String(code).trim().toUpperCase();
            savedGrades[upperCode] =
              typeof val?.toObject === "function" ? val.toObject() : val;
          }
        }
      } else if (typeof rawGrades.forEach === "function") {
        rawGrades.forEach((val, code) => {
          if (code) {
            const upperCode = String(code).trim().toUpperCase();
            savedGrades[upperCode] =
              typeof val?.toObject === "function" ? val.toObject() : val;
          }
        });
      } else if (typeof rawGrades === "object") {
        for (const [code, val] of Object.entries(rawGrades)) {
          if (code && val) {
            const upperCode = String(code).trim().toUpperCase();
            savedGrades[upperCode] =
              typeof val?.toObject === "function" ? val.toObject() : val;
          }
        }
      }
    }

    // 4. Build available semesters dynamically
    const availableSemestersSet = new Set();
    Object.values(savedGrades).forEach((gradeRecord) => {
      const sem = gradeRecord?.semester || "1st Sem";
      const ay = gradeRecord?.academicYear || activeAcademicYear;
      availableSemestersSet.add(`${sem} (${ay})`);
    });

    if (availableSemestersSet.size === 0) {
      availableSemestersSet.add(`1st Sem (${activeAcademicYear})`);
      availableSemestersSet.add(`2nd Sem (${activeAcademicYear})`);
    }

    const availableSemesters = Array.from(availableSemestersSet);
    const requestedDropdown = req.query.semester || availableSemesters[0];

    // 5. Fetch subject catalog for descriptive metadata (names & units)
    const allSubjects = await Subject.find({});
    const subjectDetailsMap = new Map();
    allSubjects.forEach((sub) => {
      if (sub.code) {
        subjectDetailsMap.set(String(sub.code).trim().toUpperCase(), sub);
      }
    });

    // 6. Get student's enrolled subjects strictly
    const enrolledCodes = Array.isArray(student.enrolledSubjects)
      ? student.enrolledSubjects
          .map((s) => String(s).trim().toUpperCase())
          .filter(Boolean)
      : [];

    const allCodes = new Set([...enrolledCodes, ...Object.keys(savedGrades)]);

    const gradesMap = {};

    allCodes.forEach((code) => {
      const upperCode = String(code).trim().toUpperCase();

      if (
        enrolledCodes.length > 0 &&
        !enrolledCodes.includes(upperCode) &&
        !savedGrades[upperCode]
      ) {
        return;
      }

      const gradeRecord = savedGrades[upperCode];
      const subInfo = subjectDetailsMap.get(upperCode);

      if (gradeRecord) {
        gradesMap[upperCode] = {
          subjectName: subInfo?.name || gradeRecord.subjectName || upperCode,
          units: subInfo?.units || gradeRecord.units || 3,
          prelim: gradeRecord.prelim || {
            quizzes: "",
            activities: "",
            examination: "",
            grade: "—",
          },
          midterm: gradeRecord.midterm || {
            quizzes: "",
            activities: "",
            examination: "",
            grade: "—",
          },
          finals: gradeRecord.finals || {
            quizzes: "",
            activities: "",
            examination: "",
            grade: "—",
          },
          finalGrade: gradeRecord.finalGrade || "—",
          status: gradeRecord.status || "In Progress",
          academicYear: gradeRecord.academicYear || activeAcademicYear,
          semester: gradeRecord.semester || requestedDropdown,
        };
      } else {
        gradesMap[upperCode] = {
          subjectName: subInfo?.name || upperCode,
          units: subInfo?.units || 3,
          prelim: { quizzes: "", activities: "", examination: "", grade: "—" },
          midterm: { quizzes: "", activities: "", examination: "", grade: "—" },
          finals: { quizzes: "", activities: "", examination: "", grade: "—" },
          finalGrade: "—",
          status: "In Progress",
          academicYear: activeAcademicYear,
          semester: requestedDropdown,
        };
      }
    });

    // 7. Compute GPA, Units, and Academic Standing
    let totalWeightedGrades = 0;
    let totalUnitsEnrolled = 0;

    Object.values(gradesMap).forEach((item) => {
      const fg = Number(item.finalGrade);
      const units = Number(item.units) || 3;
      totalUnitsEnrolled += units;

      if (!isNaN(fg) && fg > 0) {
        totalWeightedGrades += fg * units;
      }
    });

    const computedGpa =
      totalWeightedGrades > 0 && totalUnitsEnrolled > 0
        ? (totalWeightedGrades / totalUnitsEnrolled).toFixed(2)
        : "1.75";

    let academicStanding = "Regular Student";
    const gpaVal = parseFloat(computedGpa);
    if (gpaVal <= 1.75) {
      academicStanding = "Dean's List";
    } else if (gpaVal <= 3.0) {
      academicStanding = "Regular";
    } else {
      academicStanding = "Academic Warning";
    }

    return res.status(200).json({
      success: true,
      program: student.program || "",
      yearLevel: student.yearLevel || 1,
      gpa: computedGpa,
      unitsEnrolled: totalUnitsEnrolled,
      academicStanding: academicStanding,
      availableSemesters,
      grades: gradesMap,
    });
  } catch (err) {
    console.error("getStudentGrades error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error while fetching grades.",
    });
  }
};
