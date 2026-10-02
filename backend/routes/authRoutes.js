import express from "express";
import {
  login,
  logout,
  heartbeat,
  updatePassword,
  requestPasswordReset,
  verifyResetCode,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/heartbeat", authMiddleware, heartbeat);
router.post("/update-password", updatePassword);
router.post("/request-reset", requestPasswordReset);
router.post("/verify-reset", verifyResetCode);

export default router;