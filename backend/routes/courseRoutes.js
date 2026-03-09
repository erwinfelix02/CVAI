import express from "express";
import Course from "../models/Course.js";
import courseContract from "../utils/courseBlockchain.js";

const router = express.Router();

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
  try {
    const { code, name, yearLevels, department, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedDept = String(department || "").trim();
    const normalizedStatus = String(status || "Active").trim();
    const y = Number(yearLevels);

    if (!normalizedCode || !normalizedName || !normalizedDept || !y) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const exists = await Course.findOne({ code: normalizedCode });
    if (exists) {
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
      console.error("Blockchain addCourse failed:", chainErr);
      return res.status(500).json({ message: "Blockchain save failed." });
    }

    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create course" });
  }
});

/** UPDATE (Mongo + Blockchain) */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, yearLevels, department, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedDept = String(department || "").trim();
    const normalizedStatus = String(status || "Active").trim();
    const y = Number(yearLevels);

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!normalizedCode || !normalizedName || !normalizedDept || !y) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const exists = await Course.findOne({ code: normalizedCode, _id: { $ne: id } });
    if (exists) {
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
        console.error("Blockchain updateCourse failed:", chainErr);
        return res.status(500).json({ message: "Blockchain update failed." });
      }
    } else {
      return res.status(400).json({
        message: "This course has no chainIndex. Recreate it to sync blockchain.",
      });
    }

    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update course" });
  }
});

/** DELETE (Mongo delete + Blockchain soft delete) */
router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.chainIndex !== null && course.chainIndex !== undefined) {
      try {
        const tx = await courseContract.setCourseStatus(
          Number(course.chainIndex),
          "Inactive"
        );
        const receipt = await tx.wait();
        course.chainTxHash = receipt.hash;
      } catch (chainErr) {
        console.error("Blockchain setCourseStatus failed:", chainErr);
        return res.status(500).json({ message: "Blockchain delete failed." });
      }
    }

    await Course.findByIdAndDelete(course._id);

    res.json({ message: "Course deleted (blockchain set to Inactive)." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

export default router;