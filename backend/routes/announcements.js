import express from "express";
import Announcement from "../models/Announcement.js";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * Calculates real enrolled student count matching target course code, section, and department.
 */
async function calculateEnrolledRecipients(courseCode, section, department) {
  try {
    const cleanCourse = String(courseCode || "").trim();
    const cleanSection = String(section || "").trim();
    const cleanDept = String(department || "").trim();

    if (!cleanCourse || cleanCourse.toLowerCase() === "all courses") {
      const filter = { status: { $regex: /^active$/i } };
      if (cleanDept && cleanDept !== "General") {
        filter.department = { $regex: new RegExp(`^${cleanDept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
      }
      return await Student.countDocuments(filter);
    }

    const alphaNumericCode = cleanCourse.replace(/[^a-zA-Z0-9]/g, "");
    const codePattern = alphaNumericCode
      ? alphaNumericCode.split("").join("\\s*")
      : cleanCourse.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
    const courseRegex = new RegExp(`^${codePattern}$`, "i");

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

    if (cleanDept && cleanDept !== "General") {
      studentQuery.department = { $regex: new RegExp(`^${cleanDept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
    }

    if (cleanSection) {
      const escapedSection = cleanSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const secRegex = new RegExp(`^${escapedSection.replace(/\s+/g, "\\s*")}$`, "i");

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

// ==================== GET ALL ANNOUNCEMENTS FOR STUDENTS ====================
router.get("/", async (req, res) => {
  try {
    const { department, facultyId, studentSection, studentCourses } = req.query;
    const filter = {};

    if (facultyId) {
      filter.facultyId = facultyId;
    } else if (studentCourses || studentSection) {
      const cleanSection = studentSection ? String(studentSection).trim() : "";
      const rawCourses = studentCourses
        ? String(studentCourses).split(",").map((c) => c.trim()).filter(Boolean)
        : [];

      const secRegex = cleanSection
        ? new RegExp(`^${cleanSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")}$`, "i")
        : null;

      const studentMatchConditions = [
        // Global broadcasts targeting all courses
        { course: /^all courses$/i },
        { subjectCode: /^all courses$/i },
      ];

      // Match each course code
      rawCourses.forEach((rawCode) => {
        const cleanCode = rawCode.split("-")[0].trim();
        const alphaNumeric = cleanCode.replace(/[^a-zA-Z0-9]/g, "");
        const pattern = alphaNumeric ? alphaNumeric.split("").join("\\s*") : cleanCode;
        const codeRegex = new RegExp(pattern, "i");

        const subjectMatch = {
          $or: [
            { subjectCode: codeRegex },
            { course: codeRegex },
          ],
        };

        if (secRegex) {
          studentMatchConditions.push({
            $and: [
              subjectMatch,
              {
                $or: [
                  { section: secRegex },
                  { section: "" },
                  { section: { $exists: false } },
                  { section: /^all sections$/i },
                ],
              },
            ],
          });
        } else {
          studentMatchConditions.push(subjectMatch);
        }
      });

      // Department broadcast fallback
      if (department && department !== "General") {
        const deptRegex = new RegExp(`^${department.trim()}$`, "i");
        studentMatchConditions.push({
          $and: [
            { department: deptRegex },
            {
              $or: [
                { course: /^all courses$/i },
                { subjectCode: /^all courses$/i },
                { section: /^all sections$/i },
                { section: "" },
                { section: { $exists: false } },
              ],
            },
          ],
        });
      }

      filter.$or = studentMatchConditions;
    } else if (department && department !== "General") {
      filter.department = { $regex: new RegExp(`^${department.trim()}$`, "i") };
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
    const targetCode = subjectCode || course;
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
    const { title, course, subjectCode, section, priority, message, scheduledDate, sendPush, sendEmail } = req.body;

    const existing = await Announcement.findById(id);
    if (!existing) return res.status(404).json({ message: "Announcement not found." });

    const targetCode = subjectCode || course || existing.subjectCode;
    const targetSec = section !== undefined ? section : existing.section;
    const realRecipients = await calculateEnrolledRecipients(targetCode, targetSec, existing.department);

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