import Role from "../models/Role.js";

/**
 * Assumes req.user exists (set by your auth middleware after verifying JWT)
 * and that req.user.role is like: "Super Admin", "Registrar", etc.
 */

function roleToRoleId(role) {
  switch (role) {
    case "Super Admin":
      return "superadmin";
    case "Registrar":
      return "registrar";
    case "Dept Head":
      return "depthead";
    case "Finance":
      return "finance";
    case "Faculty":
      return "faculty";
    case "Student":
      return "student";
    default:
      return "";
  }
}

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const roleName = req.user?.role;
      const roleId = roleToRoleId(roleName);

      if (!roleId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const roleDoc = await Role.findOne({ roleId }).lean();
      const perms = roleDoc?.permissions || [];

      if (!perms.includes(permissionKey)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error("requirePermission error:", err);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};