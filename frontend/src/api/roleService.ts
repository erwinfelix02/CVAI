// src/services/roleService.ts (or similar path)
import axios from "axios";
import { API_BASE_URL } from "../config"; // Adjust the relative path to config.ts if needed

export const getRoles = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/roles`);
  return data;
};

export const updateRolePermissions = async (roleId: string, permissions: string[]) => {
  const { data } = await axios.patch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
    permissions,
  });
  return data;
};