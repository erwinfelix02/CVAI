import express from "express";
import { getGeneralSettings, updateGeneralSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/general", getGeneralSettings);
router.put("/general", updateGeneralSettings);

export default router;