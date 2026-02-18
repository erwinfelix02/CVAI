import express from "express";
import { getSecuritySettings, updateSecuritySettings } from "../controllers/securitySettingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

router.get("/security-settings", authMiddleware, requireRole("Super Admin"), getSecuritySettings);
router.put("/security-settings", authMiddleware, requireRole("Super Admin"), updateSecuritySettings);


export default router;
