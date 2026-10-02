// src/services/sectionService.ts (or similar path)
import axios from "axios";
import { API_BASE_URL } from "../config"; // Adjust the relative path to config.ts if needed

// Combine shared API_BASE_URL with the /sections endpoint
const API = `${API_BASE_URL}/sections`;

export const getSections = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const createSection = async (payload: any) => {
  const res = await axios.post(API, payload);
  return res.data;
};

export const updateSection = async (id: string, payload: any) => {
  const res = await axios.put(`${API}/${id}`, payload);
  return res.data;
};

export const deleteSection = async (id: string) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};