import API from "./axios";

export const sendOtp = (phone) => API.post("/api/auth/send-otp", { phone });

export const verifyOtp = (phone, otp) =>
  API.post("/api/auth/verify-otp", { phone, otp });

export const getProfile = () => API.get("/api/auth/profile");
