// backend/routes/kbRoutes.js (or whatever your upload route file is)
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import Document from "../models/Document.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir = "uploads/kb";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "Super Admin") {
    return res.status(403).json({ error: "Super Admin only" });
  }
  next();
}

router.post(
  "/upload-pdf",
  authMiddleware,
  requireSuperAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const doc = await Document.create({
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        category: req.body.category || null,
        role_visibility: JSON.parse(req.body.role_visibility || "[]"),
        uploadedBy: req.user._id,
      });

      // ✅ send file to FastAPI for indexing
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), {
        filename: req.file.filename,
        contentType: "application/pdf",
      });

      await axios.post("http://127.0.0.1:8000/upload-doc", form, {
        headers: form.getHeaders(),
      });

      // ✅ IMPORTANT: return doc._id so frontend can link it to FAQ
      res.json({ message: "Uploaded & indexed", document: doc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

export default router;