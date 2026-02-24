import express from "express";
import {
  getRegistrarInsights,
  getRegistrarFlagged,
} from "../controllers/aiInsightsController.js";

const router = express.Router();

router.get("/registrar-insights", getRegistrarInsights);
router.get("/registrar-flagged", getRegistrarFlagged);

export default router;