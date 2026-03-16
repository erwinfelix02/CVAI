import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import courseContract from "../utils/courseBlockchain.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

const router = express.Router();

const getRegistrarForLog = async () => {
  const registrar = await User.findOne({ role: "Registrar" }).select("email role");
  return {
    email: registrar?.email || "unknown",
    role: registrar?.role || "Registrar",
  };
};

/** GET all (optional status filter) */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && ["Active", "Inactive"].includes(status)) {
      filter.status = status;
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load courses" });
  }
});

/** CREATE (Mongo + Blockchain) */
router.post("/", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const { code, name, yearLevels, department, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedDept = String(department || "").trim();
    const normalizedStatus = String(status || "Active").trim();
    const y = Number(yearLevels);

    if (!normalizedCode || !normalizedName || !normalizedDept || !y) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Creation Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: "Missing required course fields.",
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Creation Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Invalid course status: ${normalizedStatus}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Invalid status value." });
    }

    const exists = await Course.findOne({ code: normalizedCode });
    if (exists) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Creation Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Duplicate course code: ${normalizedCode}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Course code already exists." });
    }

    const course = await Course.create({
      code: normalizedCode,
      name: normalizedName,
      yearLevels: y,
      department: normalizedDept,
      status: normalizedStatus,
      chainIndex: null,
      chainTxHash: "",
    });

    try {
      const tx = await courseContract.addCourse(
        normalizedCode,
        normalizedName,
        y,
        normalizedDept,
        normalizedStatus
      );

      const receipt = await tx.wait();

      const total = await courseContract.getTotalCourses();
      const index = Number(total) - 1;

      course.chainIndex = index;
      course.chainTxHash = receipt.hash;
      await course.save();
    } catch (chainErr) {
      await Course.findByIdAndDelete(course._id);

      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Creation Error",
        user: registrar.email,
        role: registrar.role,
        type: "System",
        details: `Blockchain save failed for course ${normalizedCode}: ${chainErr.message || "Unknown blockchain error"}`,
        ip,
        status: "error",
      });

      console.error("Blockchain addCourse failed:", chainErr);
      return res.status(500).json({ message: "Blockchain save failed." });
    }

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Course Created",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Created course ${course.code} - ${course.name}, ${course.yearLevels} year level(s), ${course.department}`,
      ip,
      status: "success",
    });

    res.status(201).json(course);
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    addLog({
      action: "Course Creation Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to create course",
      ip,
      status: "error",
    });

    console.error(err);
    res.status(500).json({ message: "Failed to create course" });
  }
});

/** UPDATE (Mongo + Blockchain) */
router.put("/:id", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const { id } = req.params;
    const { code, name, yearLevels, department, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedDept = String(department || "").trim();
    const normalizedStatus = String(status || "Active").trim();
    const y = Number(yearLevels);

    const course = await Course.findById(id);
    if (!course) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Course not found. ID: ${id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Course not found" });
    }

    const oldCode = course.code;
    const oldName = course.name;
    const oldYearLevels = course.yearLevels;
    const oldDepartment = course.department;
    const oldStatus = course.status;

    if (!normalizedCode || !normalizedName || !normalizedDept || !y) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Missing required fields while updating course ${oldCode}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Invalid course status while updating ${oldCode}: ${normalizedStatus}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Invalid status value." });
    }

    const exists = await Course.findOne({ code: normalizedCode, _id: { $ne: id } });
    if (exists) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Duplicate course code on update: ${normalizedCode}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Course code already exists." });
    }

    course.code = normalizedCode;
    course.name = normalizedName;
    course.yearLevels = y;
    course.department = normalizedDept;
    course.status = normalizedStatus;

    if (course.chainIndex !== null && course.chainIndex !== undefined) {
      try {
        const tx = await courseContract.updateCourse(
          Number(course.chainIndex),
          normalizedCode,
          normalizedName,
          y,
          normalizedDept,
          normalizedStatus
        );

        const receipt = await tx.wait();
        course.chainTxHash = receipt.hash;
      } catch (chainErr) {
        const registrar = await getRegistrarForLog();

        addLog({
          action: "Course Update Error",
          user: registrar.email,
          role: registrar.role,
          type: "System",
          details: `Blockchain update failed for ${oldCode}: ${chainErr.message || "Unknown blockchain error"}`,
          ip,
          status: "error",
        });

        console.error("Blockchain updateCourse failed:", chainErr);
        return res.status(500).json({ message: "Blockchain update failed." });
      }
    } else {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Course ${oldCode} has no chainIndex. Recreate it to sync blockchain.`,
        ip,
        status: "warning",
      });

      return res.status(400).json({
        message: "This course has no chainIndex. Recreate it to sync blockchain.",
      });
    }

    await course.save();

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Course Updated",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Updated course ${oldCode} -> ${course.code}, ${oldName} -> ${course.name}, Year Levels ${oldYearLevels} -> ${course.yearLevels}, Department ${oldDepartment} -> ${course.department}, Status ${oldStatus} -> ${course.status}`,
      ip,
      status: "success",
    });

    res.json(course);
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    addLog({
      action: "Course Update Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to update course",
      ip,
      status: "error",
    });

    console.error(err);
    res.status(500).json({ message: "Failed to update course" });
  }
});

/** DELETE (Mongo delete + Blockchain soft delete) */
router.delete("/:id", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Course Delete Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Course not found. ID: ${req.params.id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Course not found" });
    }

    const courseCode = course.code;
    const courseName = course.name;
    const courseDepartment = course.department;
    const courseStatus = course.status;

    if (course.chainIndex !== null && course.chainIndex !== undefined) {
      try {
        const tx = await courseContract.setCourseStatus(
          Number(course.chainIndex),
          "Inactive"
        );
        const receipt = await tx.wait();
        course.chainTxHash = receipt.hash;
      } catch (chainErr) {
        const registrar = await getRegistrarForLog();

        addLog({
          action: "Course Delete Error",
          user: registrar.email,
          role: registrar.role,
          type: "System",
          details: `Blockchain delete failed for ${courseCode}: ${chainErr.message || "Unknown blockchain error"}`,
          ip,
          status: "error",
        });

        console.error("Blockchain setCourseStatus failed:", chainErr);
        return res.status(500).json({ message: "Blockchain delete failed." });
      }
    }

    await Course.findByIdAndDelete(course._id);

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Course Deleted",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Deleted course ${courseCode} - ${courseName}, Department ${courseDepartment}, previous status ${courseStatus}. Blockchain status set to Inactive.`,
      ip,
      status: "success",
    });

    res.json({ message: "Course deleted (blockchain set to Inactive)." });
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    addLog({
      action: "Course Delete Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to delete course",
      ip,
      status: "error",
    });

    console.error(err);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

export default router;