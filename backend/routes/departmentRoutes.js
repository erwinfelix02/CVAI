import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

/** GET ALL */
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load departments." });
  }
});

/** CREATE */
router.post("/", async (req, res) => {
  try {
    const { code, name, head, description, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedHead = String(head || "").trim();
    const normalizedDesc = String(description || "").trim();
    const normalizedStatus = String(status || "Active").trim();

    if (!normalizedCode || !normalizedName) {
      return res.status(400).json({
        message: "Department code and name are required.",
      });
    }

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const exists = await Department.findOne({ code: normalizedCode });
    if (exists) {
      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const department = await Department.create({
      code: normalizedCode,
      name: normalizedName,
      head: normalizedHead,
      description: normalizedDesc,
      status: normalizedStatus,
    });

    res.status(201).json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create department." });
  }
});

/** UPDATE */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, head, description, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
    const normalizedHead = String(head || "").trim();
    const normalizedDesc = String(description || "").trim();
    const normalizedStatus = String(status || "Active").trim();

    if (!normalizedCode || !normalizedName) {
      return res.status(400).json({
        message: "Department code and name are required.",
      });
    }

    if (!["Active", "Inactive"].includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    // prevent duplicate codes
    const exists = await Department.findOne({
      code: normalizedCode,
      _id: { $ne: id },
    });

    if (exists) {
      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    department.code = normalizedCode;
    department.name = normalizedName;
    department.head = normalizedHead;
    department.description = normalizedDesc;
    department.status = normalizedStatus;

    await department.save();

    res.json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update department." });
  }
});

/** DELETE (Hard Delete) */
router.delete("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    await Department.findByIdAndDelete(department._id);

    res.json({ message: "Department deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete department." });
  }
});

export default router;