import axios from "axios";

const BASE = "http://localhost:5000";

export const getRoles = async () => {
  const { data } = await axios.get(`${BASE}/api/roles`);
  return data;
};

export const updateRolePermissions = async (roleId: string, permissions: string[]) => {
  const { data } = await axios.patch(`${BASE}/api/roles/${roleId}/permissions`, {
    permissions,
  });
  return data;
};