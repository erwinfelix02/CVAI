import axios from "axios";

const API = "http://localhost:5000/api/courses";

export const getCourses = async (status?: "Active" | "Inactive") => {
  const res = await axios.get(API, {
    params: status ? { status } : {},
  });
  return res.data;
};

export const createCourse = async (payload: any) => {
  const res = await axios.post(API, payload);
  return res.data;
};

export const updateCourse = async (id: string, payload: any) => {
  const res = await axios.put(`${API}/${id}`, payload);
  return res.data;
};

export const deleteCourse = async (id: string) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};