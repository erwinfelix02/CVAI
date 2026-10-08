import express from "express";
import {
  getMaterials,
  createMaterial,
  downloadMaterial,
  incrementDownloadCount,
  upload,
  updateMaterial,
  deleteMaterial,
} from "../controllers/materialController.js";

const router = express.Router();

router.get("/", getMaterials);
router.post("/", upload.single("file"), createMaterial);
router.get("/:id/file", downloadMaterial);
router.patch("/:id/download", incrementDownloadCount);
router.put("/:id", upload.single("file"), updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;