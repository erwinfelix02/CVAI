import express from "express";
import { register, verifyEmail, resendCode } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendCode);

export default router;
