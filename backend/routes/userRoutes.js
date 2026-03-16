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
} from "../controllers/userController.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Student list: Registrar and Super Admin
router.get(
  "/students",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getStudentUsers
);

// Portal statuses: Super Admin only
router.get(
  "/portal-statuses",
  authMiddleware,
  authorizeRoles("Super Admin"),
  getPortalStatuses
);

// All users: Super Admin only
router.get(
  "/",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getUsers
);

// Create user: Super Admin only
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  createUser
);

// Send credentials: Super Admin only
router.post(
  "/:id/send-credentials",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  sendCredentials
);

// Get registrar account: Registrar and Super Admin
router.get(
  "/role/registrar",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getRegistrarByRole
);

// Get user by id: Registrar and Super Admin
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  getUserById
);

// Update user: Super Admin only
router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  updateUser
);

// Update contact: Registrar and Super Admin
router.patch(
  "/:id/contact",
  authMiddleware,
  authorizeRoles("Registrar", "Super Admin"),
  updateUserContactInfo
);

export default router;