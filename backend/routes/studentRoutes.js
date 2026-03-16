import express from "express";
import {
  getStudentsCount,
  getStudentRecords,
  getStudentById,
  getStudentsByEnrollmentIds,
  exportStudentRecords,
  updateStudentInfo,
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/by-enrollment", getStudentsByEnrollmentIds);
router.get("/export", exportStudentRecords);
router.get("/", getStudentRecords);
router.get("/count", getStudentsCount);
router.get("/:id", getStudentById);
router.put("/:id", updateStudentInfo);

export default router;