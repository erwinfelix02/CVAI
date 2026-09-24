import express from "express";
import {
  getStudentsCount,
  getStudentRecords,
  getStudentById,
  getStudentsByEnrollmentIds,
  exportStudentRecords,
  updateStudentInfo,
  createStudent,
  uploadProfileAvatar,
} from "../controllers/studentController.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/by-enrollment", getStudentsByEnrollmentIds);
router.get("/export", exportStudentRecords);
router.get("/", getStudentRecords);
router.get("/count", getStudentsCount);
router.get("/:id", getStudentById);
router.put("/:id", updateStudentInfo);
router.post("/", createStudent);
router.post("/:id/avatar", uploadAvatar.single("avatar"), uploadProfileAvatar); // 👈 Avatar Upload Route

export default router;