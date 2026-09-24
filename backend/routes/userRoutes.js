import express from "express";
import {
  getUsers,
  createUser,
  sendCredentials,
  getStudentUsers,
  getUserById,
  updateUser,
  updateUserContactInfo,
  getRegistrarByRole,
  getPortalStatuses,
  reserveFacultyId,
  reserveUserId,
  getMyProfile,
  updateMyProfile,
  updateMyPhone,
  updateMyDepartmentPreferences,
  getFacultyByDepartment,
  searchStudentsByName,
  sendStudentEmail,
  changeMyPassword,
} from "../controllers/userController.js";

const router = express.Router();

/* =========================================================
   CURRENT SIGNED-IN USER
   ========================================================= */

router.get("/me", getMyProfile);
router.patch("/me/profile", updateMyProfile);
router.patch("/me/phone", updateMyPhone);
router.get("/faculty", getFacultyByDepartment);
router.patch("/me/preferences", updateMyDepartmentPreferences);
router.get("/search-students", searchStudentsByName);
router.post("/send-email", sendStudentEmail);

/* =========================================================
   RESERVATIONS & UTILITIES
   ========================================================= */

router.get("/reserve-faculty-id", reserveFacultyId);
router.get("/reserve-user-id", reserveUserId);
router.get("/portal-statuses", getPortalStatuses);

/* =========================================================
   SPECIFIC USER LISTS & ROLES
   ========================================================= */

router.get("/students", getStudentUsers);
router.get("/role/registrar", getRegistrarByRole);

/* =========================================================
   GENERAL USER MANAGEMENT (CRUD)
   ========================================================= */

router.get("/", getUsers);
router.post("/", createUser);
router.post("/:id/send-credentials", sendCredentials);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.patch("/:id/contact", updateUserContactInfo);
router.patch("/me/password", changeMyPassword);

export default router;