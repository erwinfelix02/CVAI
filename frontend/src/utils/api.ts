import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("lastActivity");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);



export default api;
