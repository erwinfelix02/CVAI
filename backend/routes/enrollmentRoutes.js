import express from "express";
import { evaluateEnrollment } from "../controllers/enrollmentController.js";

const router = express.Router();

// POST /api/enrollment/:id/evaluate  (because you mount it to /api/enrollment)
router.post("/:id/evaluate", evaluateEnrollment);

export default router;