import API from "./axios";

export const updateProfile = (name) =>
  API.put("/api/driver/profile", { name });

export const changePassword = (currentPassword, newPassword) =>
  API.put("/api/driver/password", { currentPassword, newPassword });

export const joinPark = (parkId) => API.put("/api/driver/park", { park_id: parkId });

export const linkYandexId = (yandexDriverId) =>
  API.put("/api/driver/yandex-id", { yandex_driver_id: yandexDriverId });

export const addBankAccount = (bank_code, iban) =>
  API.post("/api/driver/bank-accounts", { bank_code, iban });

export const getBankAccounts = () => API.get("/api/driver/bank-accounts");

export const deleteBankAccount = (id) => API.delete(`/api/driver/bank-accounts/${id}`);

export const getDriverProfile = () => API.get("/api/auth/profile");
