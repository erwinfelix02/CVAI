import express from "express";
import { getLogs, getLogStats, exportLogs } from "../controllers/logController.js";

const router = express.Router();

router.get("/", getLogs);
router.get("/stats", getLogStats);
router.get("/export", exportLogs);

export default router;