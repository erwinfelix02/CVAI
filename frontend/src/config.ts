const localIP = "192.168.100.230"; // your PC IP
const localPort = "5000";

export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? `http://localhost:${localPort}/api`
    : `http://${localIP}:${localPort}/api`;
