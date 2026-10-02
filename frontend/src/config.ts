// src/config.ts
const localIP = "192.168.100.230"; // local PC IP for testing
const localPort = "5000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? `http://localhost:${localPort}/api`
    : window.location.hostname === localIP
      ? `http://${localIP}:${localPort}/api`
      : `http://32.237.52.114:${localPort}/api`);

export const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === localIP
    ? `http://localhost:8000`
    : "/ai-api");