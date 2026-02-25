import express from "express";
import {
  getRegistrarSettings,
  updateRegistrarSettings,
} from "../controllers/registrarSettingsController.js";

const router = express.Router();

router.get("/", getRegistrarSettings);
router.put("/", updateRegistrarSettings);

export default router;