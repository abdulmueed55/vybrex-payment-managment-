import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  // Respect explicitly provided Authorization headers (e.g., adminToken in admin API calls).
  if (config.headers?.Authorization) {
    return config;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
