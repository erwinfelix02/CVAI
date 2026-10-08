import Role from "../models/Role.js";

export const getRoles = async (req, res) => {
  const roles = await Role.find().sort({ roleId: 1 });
  res.json(roles);
};

export const getRoleByRoleId = async (req, res) => {
  const role = await Role.findOne({ roleId: req.params.roleId });
  if (!role) return res.status(404).json({ message: "Role not found" });
  res.json(role);
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "permissions must be an array" });
    }

    const role = await Role.findOneAndUpdate(
      { roleId: req.params.roleId },
      { $set: { permissions } },
      { new: true }
    );

    if (!role) return res.status(404).json({ message: "Role not found" });

    res.json(role);
  } catch (err) {
    console.error("updateRolePermissions error:", err);
    res.status(500).json({ message: "Failed to update permissions" });
  }
};