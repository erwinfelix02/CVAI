import express from "express";
import Department from "../models/Department.js";
import User from "../models/User.js";

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** GET ALL (supports ?status=Active|Inactive) */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      const s = String(status).trim().toLowerCase();
      if (s === "active") filter.status = "Active";
      if (s === "inactive") filter.status = "Inactive";
    }

    const departments = await Department.find(filter).sort({ createdAt: -1 });

    const result = await Promise.all(
      departments.map(async (dept) => {
        const headUser = await User.findOne({
          role: "Dept Head",
          status: "active",
          $or: [{ department: dept.name }, { department: dept.code }],
        }).select("firstName middleName lastName");

        const head = headUser
          ? [headUser.firstName, headUser.middleName, headUser.lastName]
              .filter(Boolean)
              .join(" ")
          : "Not assigned yet";

        return {
          _id: dept._id,
          code: dept.code,
          name: dept.name,
          description: dept.description,
          status: dept.status,
          head,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load departments." });
  }
});

/** CREATE */
router.post("/", async (req, res) => {
  try {
    const { code, name, description, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
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

    const existingCode = await Department.findOne({
      code: normalizedCode,
    });

    if (existingCode) {
      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const existingName = await Department.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") },
    });

    if (existingName) {
      return res.status(400).json({
        message: "Department name already exists.",
      });
    }

    const department = await Department.create({
      code: normalizedCode,
      name: normalizedName,
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
    const { code, name, description, status } = req.body;

    const normalizedCode = String(code || "").trim().toUpperCase();
    const normalizedName = String(name || "").trim();
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

    const existingCode = await Department.findOne({
      code: normalizedCode,
      _id: { $ne: id },
    });

    if (existingCode) {
      return res.status(400).json({
        message: "Department code already exists.",
      });
    }

    const existingName = await Department.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") },
    });

    if (existingName) {
      return res.status(400).json({
        message: "Department name already exists.",
      });
    }

    department.code = normalizedCode;
    department.name = normalizedName;
    department.description = normalizedDesc;
    department.status = normalizedStatus;

    await department.save();

    res.json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update department." });
  }
});

/** DELETE */
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