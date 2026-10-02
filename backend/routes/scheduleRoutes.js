// ✅ src/routes/scheduleRoutes.js
import express from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleConflicts,
  getTodaySchedules,
  getFacultyDashboardStats,
  resolveScheduleConflicts,
  updateSchedule,
  deleteSchedule,
  getStudentSchedules,
} from "../controllers/scheduleController.js";

const router = express.Router();

// Static routes MUST be evaluated first
router.get("/student", getStudentSchedules);
router.get("/today", getTodaySchedules);
router.get("/stats", getFacultyDashboardStats);
router.get("/conflicts", getScheduleConflicts);

router.get("/", getSchedules);
router.post("/resolve-conflicts", resolveScheduleConflicts);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;