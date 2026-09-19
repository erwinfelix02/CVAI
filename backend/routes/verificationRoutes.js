import express from "express";
import { sendVerificationCode, verifyCode } from "../controllers/verificationController.js";

const router = express.Router();

router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);

export default router;