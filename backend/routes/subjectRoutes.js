import express from "express";
import Subject from "../models/Subject.js";

const router = express.Router();

/** GET all subjects (optional department/program query filtering) */
router.get("/", async (req, res) => {
  try {
    const { department, program } = req.query;
    const filter = {};

    if (department) {
      filter.department = { $regex: new RegExp(`^${department}$`, "i") };
    }
    if (program && program !== "All Programs") {
      filter.program = program;
    }

    const subjects = await Subject.find(filter).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    console.error("Fetch subjects error:", err);
    res.status(500).json({ message: "Failed to load subjects." });
  }
});

/** CREATE new subject */
router.post("/", async (req, res) => {
  try {
    const { code, name, units, year, semester, program, faculty, department } = req.body;

    if (!code || !name || !units || !year || !semester || !program || !department) {
      return res.status(400).json({ message: "Missing required subject fields." });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    // Check for duplicate subject code in the same program
    const exists = await Subject.findOne({ code: normalizedCode, program });
    if (exists) {
      return res.status(400).json({ message: `Subject code ${normalizedCode} already exists for ${program}.` });
    }

    const newSubject = await Subject.create({
      code: normalizedCode,
      name: String(name).trim(),
      units: Number(units),
      year,
      semester,
      program,
      faculty: faculty ? String(faculty).trim() : "",
      department: String(department).trim(),
    });

    res.status(201).json(newSubject);
  } catch (err) {
    console.error("Create subject error:", err);
    res.status(500).json({ message: "Failed to create subject." });
  }
});

/** UPDATE existing subject */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, units, year, semester, program, faculty } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    // Check duplicate code if code or program changed
    const duplicate = await Subject.findOne({
      code: normalizedCode,
      program,
      _id: { $ne: id },
    });
    if (duplicate) {
      return res.status(400).json({ message: `Subject code ${normalizedCode} already exists for ${program}.` });
    }

    subject.code = normalizedCode;
    subject.name = String(name).trim();
    subject.units = Number(units);
    subject.year = year;
    subject.semester = semester;
    subject.program = program;
    if (faculty !== undefined) subject.faculty = String(faculty).trim();

    await subject.save();
    res.json(subject);
  } catch (err) {
    console.error("Update subject error:", err);
    res.status(500).json({ message: "Failed to update subject." });
  }
});

/** DELETE subject */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    res.json({ message: "Subject deleted successfully." });
  } catch (err) {
    console.error("Delete subject error:", err);
    res.status(500).json({ message: "Failed to delete subject." });
  }
});

export default router;