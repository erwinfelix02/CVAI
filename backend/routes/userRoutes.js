import express from "express";
import {
  getUsers,
  createUser,
  sendCredentials,
   getStudentUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/:id/send-credentials", sendCredentials);

// fetch student users for records page
router.get("/students", getStudentUsers);

export default router;
