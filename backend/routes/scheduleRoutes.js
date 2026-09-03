// ✅ src/routes/scheduleRoutes.js

import express from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleConflicts,
  resolveScheduleConflicts,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/", getSchedules);
router.get("/conflicts", getScheduleConflicts);
router.post("/resolve-conflicts", resolveScheduleConflicts);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;