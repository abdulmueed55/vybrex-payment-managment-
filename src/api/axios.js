import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

API.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }

  if (config.headers?.Authorization) {
    return config;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data);
    }

    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.includes("/admin");
      if (!isAdminRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("driver");
      }
    }

    return Promise.reject(error);
  }
);

export default API;
