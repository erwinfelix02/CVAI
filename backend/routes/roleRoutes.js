import express from "express";
import { getRoles, getRoleByRoleId, updateRolePermissions,} from "../controllers/roleController.js";

const router = express.Router();

router.get("/", getRoles);
router.get("/:roleId", getRoleByRoleId);
router.patch("/:roleId/permissions", updateRolePermissions);


export default router;