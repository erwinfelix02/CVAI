import express from "express";
import {
  evaluateEnrollment,
  reserveStudentId,
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.get("/:id/reserve-student-id", reserveStudentId);
router.post("/:id/evaluate", evaluateEnrollment);

export default router;