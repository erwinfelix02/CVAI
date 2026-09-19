import express from "express";
import {
  getStudentsCount,
  getStudentRecords,
  getStudentById,
  getStudentsByEnrollmentIds,
  exportStudentRecords,
  updateStudentInfo,
  createStudent,
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/by-enrollment", getStudentsByEnrollmentIds);
router.get("/export", exportStudentRecords);
router.get("/", getStudentRecords);
router.get("/count", getStudentsCount);
router.get("/:id", getStudentById);
router.put("/:id", updateStudentInfo);
router.post("/", createStudent);

export default router;