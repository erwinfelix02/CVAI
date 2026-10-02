// src/services/faqService.ts (or similar path)
import axios from "axios";
import { API_BASE_URL } from "../config"; // Adjust the relative path to config.ts if needed

export const getFaqs = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/faqs`);
  return data;
};