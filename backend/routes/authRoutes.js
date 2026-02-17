import express from "express";
import {
  login,
  updatePassword,
  requestPasswordReset,
  verifyResetCode,
} from "../controllers/authController.js";


const router = express.Router();

router.post("/login", login);
router.post("/update-password", updatePassword);
router.post("/request-reset", requestPasswordReset);
router.post("/verify-reset", verifyResetCode);
export default router;
