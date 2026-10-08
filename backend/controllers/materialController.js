import path from "path";
import fs from "fs";
import multer from "multer";
import Material from "../models/Material.js";
import Schedule from "../models/Schedule.js";

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads", "materials");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// GET /api/materials?facultyId=...&department=...&course=...
export const getMaterials = async (req, res) => {
  try {
    const { course, department, facultyId } = req.query;
    const filter = {};

    if (facultyId) filter.facultyId = facultyId;
    if (department) filter.department = { $regex: new RegExp(`^${department}$`, "i") };

    if (course && course !== "All Courses") {
      filter.$or = [
        { course: course.trim() },
        { course: { $regex: new RegExp(`^${course.trim()}$`, "i") } },
      ];
    }

    const materials = await Material.find(filter).sort({ createdAt: -1 });

    const formatted = materials.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      sizeLabel: m.sizeLabel,
      date: new Date(m.createdAt).toLocaleDateString("en-US"),
      course: m.course,
      downloads: m.downloads,
      type: m.type,
      filePath: m.filePath,
      description: m.description,
      facultyId: m.facultyId,
      uploadedBy: m.uploadedBy,
      department: m.department,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("getMaterials error:", err);
    return res.status(500).json({ message: "Failed to fetch materials." });
  }
};

// POST /api/materials
export const createMaterial = async (req, res) => {
  try {
    const { title, course, type, description, facultyId, uploadedBy, department } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required for upload." });
    }
    if (!title || !course) {
      return res.status(400).json({ message: "Title and course are required." });
    }
    if (!department || !facultyId) {
      return res.status(400).json({ message: "Faculty ID and Department details are required." });
    }

    const bytes = req.file.size;
    let sizeLabel = `${bytes} B`;
    if (bytes >= 1024 * 1024) {
      sizeLabel = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      sizeLabel = `${(bytes / 1024).toFixed(1)} KB`;
    }

    const newMaterial = new Material({
      title: title.trim(),
      course: course.trim(),
      type: type || "pdf",
      description: (description || "").trim(),
      filePath: `/uploads/materials/${req.file.filename}`,
      sizeLabel,
      downloads: 0,
      facultyId: facultyId.trim(),
      uploadedBy: (uploadedBy || "Faculty Member").trim(),
      department: department.trim(),
    });

    await newMaterial.save();

    return res.status(201).json({
      message: "Material uploaded successfully.",
      material: {
        id: newMaterial._id.toString(),
        title: newMaterial.title,
        sizeLabel: newMaterial.sizeLabel,
        date: new Date(newMaterial.createdAt).toLocaleDateString("en-US"),
        course: newMaterial.course,
        downloads: newMaterial.downloads,
        type: newMaterial.type,
        filePath: newMaterial.filePath,
        description: newMaterial.description,
        facultyId: newMaterial.facultyId,
        uploadedBy: newMaterial.uploadedBy,
        department: newMaterial.department,
      },
    });
  } catch (err) {
    console.error("createMaterial error:", err);
    return res.status(500).json({ message: "Failed to upload material." });
  }
};

// GET or GET /api/materials/:id/download — Direct file download and increment count
export const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ message: "Material not found." });
    }

    // Resolve absolute path to file on disk
    const absolutePath = path.join(process.cwd(), material.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "Physical file not found on server." });
    }

    // Set correct MIME type / disposition or send file directly
    return res.download(absolutePath, `${material.title}${path.extname(material.filePath)}`);
  } catch (err) {
    console.error("downloadMaterial error:", err);
    return res.status(500).json({ message: "Failed to process download." });
  }
};

// PATCH /api/materials/:id/download — Increment count only (if client handles direct URL opening)
export const incrementDownloadCount = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Material.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Material not found." });
    }

    return res.status(200).json({ downloads: updated.downloads });
  } catch (err) {
    console.error("incrementDownloadCount error:", err);
    return res.status(500).json({ message: "Failed to update download count." });
  }
};

// PUT /api/materials/:id
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, course, type, description } = req.body;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found." });
    }

    if (title) material.title = title.trim();
    if (course) material.course = course.trim();
    if (type) material.type = type;
    if (description !== undefined) material.description = description.trim();

    if (req.file) {
      if (material.filePath) {
        const oldPath = path.join(process.cwd(), material.filePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      material.filePath = `/uploads/materials/${req.file.filename}`;

      const bytes = req.file.size;
      let sizeLabel = `${bytes} B`;
      if (bytes >= 1024 * 1024) {
        sizeLabel = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      } else if (bytes >= 1024) {
        sizeLabel = `${(bytes / 1024).toFixed(1)} KB`;
      }
      material.sizeLabel = sizeLabel;
    }

    await material.save();

    return res.status(200).json({
      message: "Material updated successfully.",
      material: {
        id: material._id.toString(),
        title: material.title,
        sizeLabel: material.sizeLabel,
        date: new Date(material.createdAt).toLocaleDateString("en-US"),
        course: material.course,
        downloads: material.downloads,
        type: material.type,
        filePath: material.filePath,
        description: material.description,
        facultyId: material.facultyId,
        uploadedBy: material.uploadedBy,
        department: material.department,
      },
    });
  } catch (err) {
    console.error("updateMaterial error:", err);
    return res.status(500).json({ message: "Failed to update material." });
  }
};

// DELETE /api/materials/:id
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: "Material not found." });
    }

    if (material.filePath) {
      const fullPath = path.join(process.cwd(), material.filePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (fsErr) {
          console.error("Error removing material file from disk:", fsErr);
        }
      }
    }

    await Material.findByIdAndDelete(id);

    return res.status(200).json({ message: "Material deleted successfully.", id });
  } catch (err) {
    console.error("deleteMaterial error:", err);
    return res.status(500).json({ message: "Failed to delete material." });
  }
};