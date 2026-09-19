// ✅ src/controllers/scheduleController.js

import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";
import {
  getTodayAbbr,
  calculateScheduleStatus,
} from "../utils/scheduleHelpers.js";

/**
 * Extract target faculty query filter from JWT token (req.user) or query string
 */
const getFacultyFilter = (req) => {
  const queryFaculty = req.query.faculty?.trim();
  const authName = req.user?.name?.trim();
  const authId = req.user?._id || req.user?.id;

  if (authId) {
    return {
      $or: [
        { "createdBy.userId": authId },
        {
          faculty: { $regex: new RegExp(`^${authName || queryFaculty}$`, "i") },
        },
      ],
    };
  }

  const targetName = authName || queryFaculty;
  if (targetName) {
    return { faculty: { $regex: new RegExp(`^${targetName}$`, "i") } };
  }

  return null;
};

// GET schedules filtered by Department AND/OR Signed-In Faculty (with dynamic student counts)
export const getSchedules = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};

    // 1. Filter by Department
    const targetDepartment = department || req.user?.department;
    if (targetDepartment) {
      filter.department = {
        $regex: new RegExp(`^${targetDepartment.trim()}$`, "i"),
      };
    }

    // 2. Filter by Faculty account context
    const facultyFilter = getFacultyFilter(req);
    if (facultyFilter) {
      Object.assign(filter, facultyFilter);
    }

    const schedules = await Schedule.find(filter).sort({ createdAt: -1 });

    // 3. Dynamically count enrolled students per schedule/section from Student collection
    const schedulesWithStudentCounts = await Promise.all(
      schedules.map(async (sch) => {
        const schObj = sch.toObject();

        const sectionName = String(sch.section || "").trim();
        const courseCode = String(sch.code || "").trim();

        const escapedCode = courseCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const courseRegex = new RegExp(
          `^${escapedCode.replace(/\s+/g, "\\s*")}$`,
          "i",
        );

        const matchConditions = [];

        if (sectionName) {
          matchConditions.push({
            section: { $regex: new RegExp(`^${sectionName}$`, "i") },
          });
          matchConditions.push({
            classSection: { $regex: new RegExp(`^${sectionName}$`, "i") },
          });
        }

        if (courseCode) {
          matchConditions.push({ "enrolledCourses.code": courseRegex });
          matchConditions.push({ "courses.code": courseRegex });
          matchConditions.push({ course: courseRegex });
          matchConditions.push({ enrolledSubjects: courseRegex });
        }

        let studentCount = 0;
        if (matchConditions.length > 0) {
          studentCount = await Student.countDocuments({
            status: { $regex: /^active$/i },
            $or: matchConditions,
          });
        }

        return {
          ...schObj,
          students: studentCount,
        };
      }),
    );

    return res.status(200).json(schedulesWithStudentCounts);
  } catch (err) {
    console.error("getSchedules error:", err);
    return res.status(500).json({ message: "Failed to fetch schedules." });
  }
};

// GET today's schedules specifically assigned to the signed-in faculty
export const getTodaySchedules = async (req, res) => {
  try {
    const facultyFilter = getFacultyFilter(req);

    if (!facultyFilter) {
      return res
        .status(400)
        .json({ message: "Faculty identity could not be resolved." });
    }

    const todayAbbr = getTodayAbbr();

    const queryFilter = {
      status: "Active",
      days: { $regex: new RegExp(todayAbbr, "i") },
      ...facultyFilter,
    };

    const schedules = await Schedule.find(queryFilter);

    const formattedSchedules = schedules.map((sch) => ({
      id: sch._id,
      time: sch.time,
      code: sch.code,
      title: sch.title,
      meta: `${sch.room} • ${sch.section}`,
      status: calculateScheduleStatus(sch.time),
    }));

    return res.status(200).json(formattedSchedules);
  } catch (err) {
    console.error("getTodaySchedules error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch today's schedule." });
  }
};

// GET dashboard metrics for the assigned faculty
export const getFacultyDashboardStats = async (req, res) => {
  try {
    const facultyFilter = getFacultyFilter(req);

    if (!facultyFilter) {
      return res
        .status(400)
        .json({ message: "Faculty identity could not be resolved." });
    }

    const todayAbbr = getTodayAbbr();

    const todaySchedules = await Schedule.find({
      status: "Active",
      days: { $regex: new RegExp(todayAbbr, "i") },
      ...facultyFilter,
    });

    const completedCount = todaySchedules.filter(
      (sch) => calculateScheduleStatus(sch.time) === "completed",
    ).length;

    const totalAssignedClasses = await Schedule.countDocuments({
      status: "Active",
      ...facultyFilter,
    });

    return res.status(200).json({
      totalAssignedClasses,
      classesTodayCount: todaySchedules.length,
      classesCompletedCount: completedCount,
    });
  } catch (err) {
    console.error("getFacultyDashboardStats error:", err);
    return res.status(500).json({ message: "Failed to fetch faculty stats." });
  }
};

// GET detected schedule conflicts
export const getScheduleConflicts = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = { status: "Active" };

    if (department) {
      filter.department = { $regex: new RegExp(`^${department}$`, "i") };
    }

    const schedules = await Schedule.find(filter);

    const conflictMap = new Map();

    schedules.forEach((sch) => {
      const roomKey = sch.room ? sch.room.trim().toLowerCase() : "";
      const daysKey = sch.days ? sch.days.trim().toUpperCase() : "";
      const timeKey = sch.time ? sch.time.trim().toLowerCase() : "";

      if (roomKey && daysKey && timeKey) {
        const compositeKey = `${roomKey}__${daysKey}__${timeKey}`;
        if (!conflictMap.has(compositeKey)) {
          conflictMap.set(compositeKey, []);
        }
        conflictMap.get(compositeKey).push(sch);
      }
    });

    const conflicts = [];

    conflictMap.forEach((matchedSchedules) => {
      if (matchedSchedules.length > 1) {
        const first = matchedSchedules[0];
        const subjectCodes = Array.from(
          new Set(matchedSchedules.map((s) => s.code)),
        ).join(" & ");

        conflicts.push({
          id: matchedSchedules.map((s) => s._id).join("-"),
          room: first.room,
          time: `${first.days} ${first.time}`,
          details: `Conflicting subjects: ${subjectCodes}`,
          schedules: matchedSchedules,
        });
      }
    });

    return res.status(200).json(conflicts);
  } catch (err) {
    console.error("getScheduleConflicts error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch schedule conflicts." });
  }
};

// RESOLVE schedule conflicts by updating target schedule records
export const resolveScheduleConflicts = async (req, res) => {
  try {
    const { resolutions } = req.body;

    if (!Array.isArray(resolutions) || resolutions.length === 0) {
      return res
        .status(400)
        .json({ message: "No resolution parameters provided." });
    }

    const updatePromises = resolutions.map(async (resItem) => {
      const { scheduleId, resolutionType, targetValue } = resItem;

      if (!scheduleId || !resolutionType || !targetValue) return null;

      if (resolutionType === "Unassigned / Pending") return null;

      if (resolutionType === "Move to another room") {
        return Schedule.findByIdAndUpdate(
          scheduleId,
          { room: targetValue.trim() },
          { new: true },
        );
      }

      if (resolutionType === "Move to another time slot") {
        const cleanTarget = targetValue.trim();
        const spaceIndex = cleanTarget.indexOf(" ");

        let newDays = "MWF";
        let newTime = cleanTarget;

        if (spaceIndex !== -1) {
          newDays = cleanTarget.substring(0, spaceIndex).trim();
          newTime = cleanTarget.substring(spaceIndex + 1).trim();
        }

        return Schedule.findByIdAndUpdate(
          scheduleId,
          { days: newDays, time: newTime },
          { new: true },
        );
      }

      return null;
    });

    await Promise.all(updatePromises);

    return res
      .status(200)
      .json({ message: "Conflicts resolved successfully." });
  } catch (err) {
    console.error("resolveScheduleConflicts error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to resolve conflicts." });
  }
};

// CREATE a new schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      code,
      title,
      faculty,
      room,
      section,
      days,
      time,
      status,
      department,
      createdBy,
    } = req.body;

    if (!code || !title || !faculty || !room || !section || !days || !time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const activeDepartment = department || req.user?.department || "General";
    const activeCreatedBy = {
      userId: createdBy?.userId || req.user?._id || null,
      userName: createdBy?.userName || req.user?.name || "Department Head",
      userRole: createdBy?.userRole || req.user?.role || "Dept Head",
    };

    const newSchedule = new Schedule({
      code: String(code).trim(),
      title: String(title).trim(),
      faculty: String(faculty).trim(),
      room: String(room).trim(),
      section: String(section).trim(),
      days: String(days).trim(),
      time: String(time).trim(),
      status: status || "Active",
      department: String(activeDepartment).trim(),
      createdBy: activeCreatedBy,
    });

    await newSchedule.save();

    return res.status(201).json({
      message: "Schedule created successfully.",
      schedule: newSchedule,
    });
  } catch (err) {
    console.error("createSchedule error:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: err.message || "Invalid schedule data submitted." });
    }
    return res
      .status(500)
      .json({ message: err.message || "Failed to create schedule." });
  }
};

// UPDATE an existing schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    return res.status(200).json({
      message: "Schedule updated successfully.",
      schedule: updatedSchedule,
    });
  } catch (err) {
    console.error("updateSchedule error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to update schedule." });
  }
};

// DELETE a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    return res.status(200).json({ message: "Schedule deleted successfully." });
  } catch (err) {
    console.error("deleteSchedule error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to delete schedule." });
  }
};

export const getStudentSchedules = async (req, res) => {
  try {
    console.log("=== [DEBUG] GET /api/schedules/student Query Params ===");
    console.log(req.query);

    const { section, enrolledSubjects } = req.query;

    const matchConditions = [];

    // 1. Match Enrolled Subjects by Course Code or Course Title
    if (enrolledSubjects) {
      const raw = Array.isArray(enrolledSubjects)
        ? enrolledSubjects
        : String(enrolledSubjects).split(",");

      const cleanCodes = raw
        .map((s) => String(s).split("-")[0].trim().split(" ")[0].trim())
        .filter((s) => s && s !== "—" && s !== "N/A");

      cleanCodes.forEach((code) => {
        const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        matchConditions.push({ code: { $regex: `^${escapedCode}$`, $options: "i" } });
        matchConditions.push({ code: { $regex: escapedCode,$options: "i" } });
        matchConditions.push({ title: { $regex: escapedCode,$options: "i" } });
      });

      console.log("👉 Applied Subject Filters:", cleanCodes);
    }

    // 2. Match Section ONLY if no enrolled subjects were supplied
    if (matchConditions.length === 0 && section && typeof section === "string") {
      const cleanSec = section.trim();
      if (cleanSec !== "" && cleanSec !== "—" && cleanSec !== "N/A") {
        const escapedSec = cleanSec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        matchConditions.push({ section: { $regex: `^${escapedSec}$`, $options: "i" } });
      }
    }

    if (matchConditions.length === 0) {
      console.log("⚠️ No specific subjects or section provided. Returning empty array.");
      return res.status(200).json([]);
    }

    const filter = {
      status: "Active",
      $or: matchConditions,
    };

    console.log("👉 Executing MongoDB Filter:", JSON.stringify(filter, null, 2));

    const schedules = await Schedule.find(filter).sort({ time: 1 });

    console.log(`✅ MongoDB returned ${schedules.length} enrolled schedule(s).`);
    console.log("====================================================");

    return res.status(200).json(schedules);
  } catch (err) {
    console.error("❌ [ERROR] getStudentSchedules error:", err);
    return res.status(500).json({ message: "Failed to fetch student schedule." });
  }
};