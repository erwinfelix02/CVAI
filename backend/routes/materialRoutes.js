import express from "express";
import {
  getMaterials,
  createMaterial,
  incrementDownloadCount,
  upload,
updateMaterial,
} from "../controllers/materialController.js";

const router = express.Router();

router.get("/", getMaterials);
router.post("/", upload.single("file"), createMaterial);
router.patch("/:id/download", incrementDownloadCount);
router.put("/:id", upload.single("file"), updateMaterial);

export default router;