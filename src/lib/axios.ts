import axios from "axios";

// En desarrollo apunta al proxy de Next.js
// En producción también — el proxy vive en el mismo servidor
const apiClient = axios.create({
  baseURL: "/api/gtr",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;