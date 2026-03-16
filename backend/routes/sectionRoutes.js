import express from "express";
import Section from "../models/Section.js";
import User from "../models/User.js";
import { addLog, getClientIp } from "../utils/logActivity.js";

const router = express.Router();

const getRegistrarForLog = async () => {
  const registrar = await User.findOne({ role: "Registrar" }).select("email role");
  return {
    email: registrar?.email || "unknown",
    role: registrar?.role || "Registrar",
  };
};

// CREATE
router.post("/", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const created = await Section.create(req.body);
    const registrar = await getRegistrarForLog();

    addLog({
      action: "Section Created",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Created section ${created.code} for ${created.program}, Year ${created.yearLevel}`,
      ip,
      status: "success",
    });

    res.status(201).json(created);
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    if (err.code === 11000) {
      addLog({
        action: "Section Creation Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Duplicate section code: ${req.body?.code}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Section code already exists." });
    }

    addLog({
      action: "Section Creation Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to create section.",
      ip,
      status: "error",
    });

    res.status(500).json({ message: err.message || "Failed to create section." });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const sections = await Section.find().sort({ createdAt: -1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: "Failed to load sections." });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const oldSection = await Section.findById(req.params.id);

    if (!oldSection) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Section Update Failed",
        user: registrar.email,
        role: registrar.role,
       type: "Data",
        details: `Section not found. ID: ${req.params.id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Section not found." });
    }

    const updated = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Section Updated",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Updated section ${oldSection.code} -> ${updated.code}`,
      ip,
      status: "success",
    });

    res.json(updated);
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    if (err.code === 11000) {
      addLog({
        action: "Section Update Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Duplicate section code: ${req.body?.code}`,
        ip,
        status: "warning",
      });

      return res.status(400).json({ message: "Section code already exists." });
    }

    addLog({
      action: "Section Update Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to update section.",
      ip,
      status: "error",
    });

    res.status(500).json({ message: err.message || "Failed to update section." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const ip = getClientIp(req);

  try {
    const deleted = await Section.findByIdAndDelete(req.params.id);

    if (!deleted) {
      const registrar = await getRegistrarForLog();

      addLog({
        action: "Section Delete Failed",
        user: registrar.email,
        role: registrar.role,
        type: "Data",
        details: `Section not found. ID: ${req.params.id}`,
        ip,
        status: "warning",
      });

      return res.status(404).json({ message: "Section not found." });
    }

    const registrar = await getRegistrarForLog();

    addLog({
      action: "Section Deleted",
      user: registrar.email,
      role: registrar.role,
      type: "Data",
      details: `Deleted section ${deleted.code} (${deleted.program}, Year ${deleted.yearLevel})`,
      ip,
      status: "success",
    });

    res.json({ message: "Deleted successfully." });
  } catch (err) {
    const registrar = await getRegistrarForLog().catch(() => ({
      email: "unknown",
      role: "Registrar",
    }));

    addLog({
      action: "Section Delete Error",
      user: registrar.email,
      role: registrar.role,
      type: "System",
      details: err.message || "Failed to delete section.",
      ip,
      status: "error",
    });

    res.status(500).json({ message: "Failed to delete section." });
  }
});

export default router;