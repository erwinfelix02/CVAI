import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getSecuritySettings,
  updateSecuritySettings,
} from "../controllers/securitySettingsController.js";

const router = express.Router();

// ✅ Everyone logged in can read (needed for idle timeout)
router.get("/", authMiddleware, getSecuritySettings);

// ✅ Only Super Admin can update (Option B)
router.put("/", authMiddleware, (req, res, next) => {
  // authMiddleware sets req.user from JWT payload
  if (req.user?.role !== "Super Admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}, updateSecuritySettings);

export default router;