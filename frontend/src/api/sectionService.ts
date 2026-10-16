import axios from "axios";
import { API_BASE_URL } from "../config";

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

// --- Section Requests API Endpoints ---

export const getSectionRequests = async () => {
  const res = await axios.get(`${API_BASE_URL}/section-requests`);
  return res.data;
};

export const approveSectionRequest = async (id: string, room: string) => {
  const res = await axios.patch(`${API_BASE_URL}/section-requests/${id}/approve`, { room });
  return res.data;
};

export const rejectSectionRequest = async (id: string, feedback: string) => {
  const res = await axios.patch(`${API_BASE_URL}/section-requests/${id}/reject`, { feedback });
  return res.data;
};