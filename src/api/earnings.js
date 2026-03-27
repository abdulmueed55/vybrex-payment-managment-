import API from "./axios";

export const getEarnings = () => API.get("/api/earnings");

export const syncEarnings = () => API.post("/api/earnings/sync");

export const getBalance = () => API.get("/api/earnings/balance");
