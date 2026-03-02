import express from "express";
import {
  getUsers,
  createUser,
  sendCredentials,
   getStudentUsers,
   getUserById,
    updateUser, 
} from "../controllers/userController.js";

const router = express.Router();
router.get("/students", getStudentUsers);
router.get("/", getUsers);
router.post("/", createUser);
router.post("/:id/send-credentials", sendCredentials);
router.get("/:id", getUserById);
router.patch("/:id", updateUser); 

export default router;
