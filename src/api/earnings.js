import API from "./axios";

export const getEarnings = () => API.get("/api/earnings");

export const syncEarnings = () => API.post("/api/earnings/sync");

export const getBalance = () => API.get("/api/earnings/balance");

export const getYandexBalance = () => API.get("/api/earnings/yandex-balance");

export const getYandexTransactions = (days = 30) =>
  API.get(`/api/earnings/yandex-transactions?days=${days}`);
