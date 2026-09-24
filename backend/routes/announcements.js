import express from "express";
import Announcement from "../models/Announcement.js";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * Clean and extract raw subject code (e.g., "MAT151" from "MAT151 - mathematics in the modern world (BSHTM-01)")
 */
function extractSubjectCode(str) {
  if (!str) return "";
  const clean = String(str).trim();
  const basePart = clean.split("-")[0].split("(")[0].trim();
  return basePart || clean;
}

/**
 * Escapes regex special characters
 */
function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extracts key department keywords (e.g., "Hospitality Management")
 */
function getDepartmentKeywordRegex(dept) {
  if (!dept || dept === "General") return null;
  
  // Extract key phrases like "Hospitality Management" or core acronyms
  const clean = String(dept).trim();
  const keywords = clean
    .replace(/(Bachelor of Science in|College of|System|Department of)/gi, "")
    .trim();

  const pattern = escapeRegex(keywords || clean).replace(/\s+/g, "\\s*");
  return new RegExp(pattern, "i");
}

/**
 * Calculates enrolled recipients for an announcement target
 */
async function calculateEnrolledRecipients(courseCode, section, department) {
  try {
    const cleanCourse = extractSubjectCode(courseCode);
    const cleanSection = String(section || "").trim();
    const cleanDept = String(department || "").trim();

    if (!cleanCourse || cleanCourse.toLowerCase() === "all courses") {
      const filter = { status: { $regex: /^active$/i } };
      if (cleanDept && cleanDept !== "General") {
        const deptRegex = getDepartmentKeywordRegex(cleanDept);
        if (deptRegex) filter.department = deptRegex;
      }
      return await Student.countDocuments(filter);
    }

    const alphaNumericCode = cleanCourse.replace(/[^a-zA-Z0-9]/g, "");
    const codePattern = alphaNumericCode
      ? alphaNumericCode.split("").join("\\s*")
      : escapeRegex(cleanCourse).replace(/\s+/g, "\\s*");
    const courseRegex = new RegExp(codePattern, "i");

    const courseMatchConditions = [
      { enrolledSubjects: courseRegex },
      { course: courseRegex },
      { program: courseRegex },
      { "enrolledSubjects.code": courseRegex },
      { "enrolledCourses.code": courseRegex },
      { "courses.code": courseRegex },
    ];

    const studentQuery = {
      status: { $regex: /^active$/i },
      $or: courseMatchConditions,
    };

    if (cleanSection && !/^all sections$/i.test(cleanSection)) {
      const secRegex = new RegExp(`^${escapeRegex(cleanSection).replace(/\s+/g, "\\s*")}$`, "i");

      const sectionQuery = {
        ...studentQuery,
        $and: [
          { $or: courseMatchConditions },
          { $or: [{ section: secRegex }, { classSection: secRegex }] },
        ],
      };

      let count = await Student.countDocuments(sectionQuery);
      if (count === 0) {
        count = await Student.countDocuments(studentQuery);
      }
      return count;
    }

    return await Student.countDocuments(studentQuery);
  } catch (err) {
    console.error("calculateEnrolledRecipients error:", err);
    return 0;
  }
}

// ==================== GET LIVE RECIPIENTS COUNT ====================
router.get("/recipients/count", async (req, res) => {
  try {
    const { courseCode, section, department } = req.query;
    const count = await calculateEnrolledRecipients(courseCode, section, department);
    return res.status(200).json({ count });
  } catch (error) {
    console.error("GET Recipients Count Error:", error);
    return res.status(500).json({ message: "Server error calculating recipient count.", count: 0 });
  }
});

// ==================== GET ALL ANNOUNCEMENTS FOR STUDENTS & FACULTY ====================
router.get("/", async (req, res) => {
  try {
    const { department, facultyId, studentSection, studentCourses } = req.query;

    const filter = {};

    // 1. Faculty View
    if (facultyId) {
      filter.facultyId = facultyId;
    } 
    // 2. Student View (Filtered by section, courses, and department)
    else if (studentCourses || studentSection || department) {
      const cleanSection = studentSection ? String(studentSection).trim() : "";
      const rawCourses = studentCourses
        ? String(studentCourses).split(",").map((c) => c.trim()).filter(Boolean)
        : [];

      const studentMatchConditions = [
        // Global Broadcasts to all courses
        { course: { $regex: /^all courses$/i } },
        { subjectCode: { $regex: /^all courses$/i } },
      ];

      // Match student's enrolled subject codes & section
      rawCourses.forEach((rawCode) => {
        const cleanCode = extractSubjectCode(rawCode);
        const alphaNumeric = cleanCode.replace(/[^a-zA-Z0-9]/g, "");
        const pattern = alphaNumeric
          ? alphaNumeric.split("").join("\\s*")
          : escapeRegex(cleanCode);
        const codeRegex = new RegExp(pattern, "i");

        const subjectMatch = {
          $or: [
            { subjectCode: codeRegex },
            { course: codeRegex },
            { title: codeRegex },
          ],
        };

        if (cleanSection) {
          const secRegex = new RegExp(`^${escapeRegex(cleanSection).replace(/\s+/g, "\\s*")}$`, "i");
          studentMatchConditions.push({
            $and: [
              subjectMatch,
              {
                $or: [
                  { section: secRegex },
                  { section: "" },
                  { section: { $exists: false } },
                  { section: null },
                  { section: { $regex: /^all sections$/i } },
                ],
              },
            ],
          });
        } else {
          studentMatchConditions.push(subjectMatch);
        }
      });

      // Match Department-level Broadcasts
      if (department && department !== "General") {
        const deptRegex = getDepartmentKeywordRegex(department);
        if (deptRegex) {
          studentMatchConditions.push({
            $and: [
              { department: deptRegex },
              {
                $or: [
                  { course: { $regex: /^all courses$/i } },
                  { subjectCode: { $regex: /^all courses$/i } },
                  { section: { $regex: /^all sections$/i } },
                  { section: "" },
                  { section: { $exists: false } },
                  { section: null },
                ],
              },
            ],
          });
        }
      }

      filter.$or = studentMatchConditions;
    } 
    // 3. Fallback: Department Filter Only
    else if (department && department !== "General") {
      const deptRegex = getDepartmentKeywordRegex(department);
      if (deptRegex) {
        filter.department = deptRegex;
      }
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(announcements);
  } catch (error) {
    console.error("GET Announcements Error:", error);
    return res.status(500).json({ message: "Server error fetching announcements." });
  }
});

// ==================== POST NEW ANNOUNCEMENT ====================
router.post("/", async (req, res) => {
  try {
    const {
      title,
      course,
      subjectCode,
      section,
      priority,
      message,
      scheduledDate,
      sendPush,
      sendEmail,
      facultyId,
      author,
      department,
    } = req.body;

    if (!title || !course || !message) {
      return res.status(400).json({ message: "Title, target course, and message are required." });
    }

    const activeDept = department || "General";
    const extractedCode = extractSubjectCode(subjectCode || course);
    const targetCode = extractedCode || subjectCode || course;

    const realRecipients = await calculateEnrolledRecipients(targetCode, section, activeDept);

    const newAnnouncement = new Announcement({
      title,
      course,
      subjectCode: targetCode,
      section: section || "",
      priority: priority || "medium",
      message,
      scheduledDate: scheduledDate || "",
      sendPush: sendPush ?? true,
      sendEmail: sendEmail ?? false,
      recipients: realRecipients,
      facultyId: facultyId || "system",
      author: author || "Faculty Member",
      department: activeDept,
    });

    const saved = await newAnnouncement.save();
    return res.status(201).json({ message: "Announcement created.", announcement: saved });
  } catch (error) {
    console.error("POST Announcement Error:", error);
    return res.status(500).json({ message: "Server error creating announcement." });
  }
});

// ==================== PUT UPDATE ANNOUNCEMENT ====================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      course,
      subjectCode,
      section,
      priority,
      message,
      scheduledDate,
      sendPush,
      sendEmail,
      department,
    } = req.body;

    const existing = await Announcement.findById(id);
    if (!existing) return res.status(404).json({ message: "Announcement not found." });

    const rawCode = subjectCode || course || existing.subjectCode;
    const targetCode = extractSubjectCode(rawCode) || rawCode;
    const targetSec = section !== undefined ? section : existing.section;
    const targetDept = department || existing.department;

    const realRecipients = await calculateEnrolledRecipients(
      targetCode,
      targetSec,
      targetDept
    );

    const updated = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        course,
        subjectCode: targetCode,
        section: targetSec,
        priority,
        message,
        scheduledDate,
        sendPush,
        sendEmail,
        department: targetDept,
        recipients: realRecipients,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Announcement updated.", announcement: updated });
  } catch (error) {
    console.error("PUT Announcement Error:", error);
    return res.status(500).json({ message: "Server error updating announcement." });
  }
});

// ==================== DELETE ANNOUNCEMENT ====================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Announcement not found." });

    return res.status(200).json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("DELETE Announcement Error:", error);
    return res.status(500).json({ message: "Server error deleting announcement." });
  }
});

export default router;