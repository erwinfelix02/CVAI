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
  updateMyPhone,
  updateMyDepartmentPreferences,
  getFacultyByDepartment,
} from "../controllers/userController.js";

import {
  authMiddleware,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   CURRENT SIGNED-IN USER
   IMPORTANT: /me routes MUST be placed BEFORE /:id routes
   ========================================================= */

router.get("/me", getMyProfile);
router.patch("/me/phone", updateMyPhone);
router.get("/faculty", getFacultyByDepartment);
router.patch("/me/preferences", updateMyDepartmentPreferences);
/* =========================================================
   RESERVATIONS & UTILITIES
   ========================================================= */

router.get("/reserve-faculty-id", reserveFacultyId);
router.get("/reserve-user-id", reserveUserId);

router.get(
  "/portal-statuses",
  authMiddleware,
  authorizeRoles("Super Admin"),
  getPortalStatuses
);

/* =========================================================
   SPECIFIC USER LISTS & ROLES
   ========================================================= */

router.get(
  "/students",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getStudentUsers
);

router.get(
  "/role/registrar",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getRegistrarByRole
);

/* =========================================================
   GENERAL USER MANAGEMENT (CRUD)
   ========================================================= */

router.get(
  "/",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getUsers
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  createUser
);

router.post(
  "/:id/send-credentials",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  sendCredentials
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getUserById
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  updateUser
);

router.patch(
  "/:id/contact",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  updateUserContactInfo
);

export default router;