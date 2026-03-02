import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export const getDepartments = async () => {
  const res = await api.get("/departments");
  return res.data;
};

export const createDepartment = async (payload: {
  code: string;
  name: string;
  description: string;
  head: string;
  status: "Active" | "Inactive";
}) => {
  const res = await api.post("/departments", payload);
  return res.data;
};

export const updateDepartment = async (
  id: string,
  payload: {
    code: string;
    name: string;
    description: string;
    head: string;
    status: "Active" | "Inactive";
  }
) => {
  const res = await api.put(`/departments/${id}`, payload);
  return res.data;
};

export const deleteDepartment = async (id: string) => {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
};