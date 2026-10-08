import express from "express";
import { sendStudentCredentialsBulk } from "../controllers/accountController.js";

const router = express.Router();

router.post("/send-credentials", sendStudentCredentialsBulk);

export default router;