// ✅ src/controllers/scheduleController.js

import Schedule from "../models/Schedule.js";


// GET schedules filtered by Department AND Signed-In Faculty
export const getSchedules = async (req, res) => {
  try {
    const { department, faculty } = req.query;
    const filter = {};

    // 1. Filter by Department (query param or auth user context)
    const targetDepartment = department || req.user?.department;
    if (targetDepartment) {
      filter.department = { $regex: new RegExp(`^${targetDepartment.trim()}$`, "i") };
    }

    // 2. Filter by Faculty Name/ID (query param or auth user context)
    const targetFaculty = faculty || req.user?.name;
    if (targetFaculty) {
      filter.faculty = { $regex: new RegExp(`^${targetFaculty.trim()}$`, "i") };
    }

    const schedules = await Schedule.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(schedules);
  } catch (err) {
    console.error("getSchedules error:", err);
    return res.status(500).json({ message: "Failed to fetch schedules." });
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

    // Group schedules by Room + Days + Time
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
          new Set(matchedSchedules.map((s) => s.code))
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
    return res.status(500).json({ message: "Failed to fetch schedule conflicts." });
  }
};

// RESOLVE schedule conflicts by updating target schedule records
export const resolveScheduleConflicts = async (req, res) => {
  try {
    const { resolutions } = req.body;

    if (!Array.isArray(resolutions) || resolutions.length === 0) {
      return res.status(400).json({ message: "No resolution parameters provided." });
    }

    const updatePromises = resolutions.map(async (resItem) => {
      const { scheduleId, resolutionType, targetValue } = resItem;

      if (!scheduleId || !resolutionType || !targetValue) return null;

      // Skip unassigned or invalid types
      if (resolutionType === "Unassigned / Pending") return null;

      // Case 1: Room Relocation
      if (resolutionType === "Move to another room") {
        return Schedule.findByIdAndUpdate(
          scheduleId,
          { room: targetValue.trim() },
          { new: true }
        );
      }

      // Case 2: Time Slot Adjustment
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
          { new: true }
        );
      }

      return null;
    });

    await Promise.all(updatePromises);

    return res.status(200).json({ message: "Conflicts resolved successfully." });
  } catch (err) {
    console.error("resolveScheduleConflicts error:", err);
    return res.status(500).json({ message: err.message || "Failed to resolve conflicts." });
  }
};

// CREATE a new schedule
export const createSchedule = async (req, res) => {
  try {
    const { code, title, faculty, room, section, days, time, status, department, createdBy } =
      req.body;

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
      return res.status(400).json({ message: err.message || "Invalid schedule data submitted." });
    }
    return res.status(500).json({ message: err.message || "Failed to create schedule." });
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
    return res.status(500).json({ message: err.message || "Failed to update schedule." });
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
    return res.status(500).json({ message: err.message || "Failed to delete schedule." });
  }
};