import axios from "axios";

const BASE = "http://localhost:5000";

export const getFaqs = async () => {
  const { data } = await axios.get(`${BASE}/api/faqs`);
  return data;
};