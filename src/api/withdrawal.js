import API from "./axios";

export const requestWithdrawal = (data) =>
  API.post("/api/withdrawal/request", data);

export const getWithdrawals = () => API.get("/api/withdrawal/history");
