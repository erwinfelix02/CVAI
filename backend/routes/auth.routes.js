import express from "express";
import { register, verifyEmail, resendCode, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendCode);
router.post("/login", login);

export default router;
