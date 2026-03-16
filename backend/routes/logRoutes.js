import express from "express";
import {
  createLog,
  getLogs,
  getLogStats,
  exportLogs,
} from "../controllers/logController.js";

const router = express.Router();

router.post("/", createLog);
router.get("/", getLogs);
router.get("/stats", getLogStats);
router.get("/export", exportLogs);

export default router;