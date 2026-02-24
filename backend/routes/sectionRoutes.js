import express from "express";
import Section from "../models/Section.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const created = await Section.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Section code already exists." });
    }
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
  try {
    const updated = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Section not found." });
    }

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Section code already exists." });
    }
    res.status(500).json({ message: err.message || "Failed to update section." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Section.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Section not found." });
    }

    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete section." });
  }
});

export default router;