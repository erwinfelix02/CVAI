import express from "express";
import {
  getUsers,
  createUser,
  sendCredentials,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/:id/send-credentials", sendCredentials);

export default router;
