import axios from "axios";

const API = "http://localhost:5000/api/sections"; // change if deployed

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