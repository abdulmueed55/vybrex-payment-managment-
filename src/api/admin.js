import API from "./axios";

const adminAPI = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const adminLogin = (username, password) =>
  API.post("/api/admin/login", { username, password });

export const getAdminDrivers = () => {
  const token = localStorage.getItem("adminToken");
  return API.get("/api/admin/drivers", adminAPI(token));
};

export const getAdminWithdrawals = () => {
  const token = localStorage.getItem("adminToken");
  return API.get("/api/admin/withdrawals", adminAPI(token));
};

export const approveWithdrawal = (id) => {
  const token = localStorage.getItem("adminToken");
  return API.put(`/api/admin/withdrawal/${id}/approve`, {}, adminAPI(token));
};

export const rejectWithdrawal = (id) => {
  const token = localStorage.getItem("adminToken");
  return API.put(`/api/admin/withdrawal/${id}/reject`, {}, adminAPI(token));
};

export const adjustDriverBalance = (id, amount, description) => {
  const token = localStorage.getItem("adminToken");
  return API.put(`/api/admin/driver/${id}/balance`, { amount, description }, adminAPI(token));
};

export const getAdminParks = () => {
  const token = localStorage.getItem("adminToken");
  return API.get("/api/admin/parks", adminAPI(token));
};

export const createPark = (data) => {
  const token = localStorage.getItem("adminToken");
  return API.post("/api/admin/parks", data, adminAPI(token));
};

export const updatePark = (id, data) => {
  const token = localStorage.getItem("adminToken");
  return API.put(`/api/admin/parks/${id}`, data, adminAPI(token));
};

export const deletePark = (id) => {
  const token = localStorage.getItem("adminToken");
  return API.delete(`/api/admin/parks/${id}`, adminAPI(token));
};

export const getCommissionRate = () => {
  const token = localStorage.getItem("adminToken");
  return API.get("/api/admin/commission", adminAPI(token));
};

export const updateCommissionRate = (commission_rate) => {
  const token = localStorage.getItem("adminToken");
  return API.put("/api/admin/commission", { commission_rate }, adminAPI(token));
};

export const getAdminBankAccounts = () => {
  const token = localStorage.getItem("adminToken");
  return API.get("/api/admin/bank-accounts", adminAPI(token));
};

export const verifyBankAccount = (id) => {
  const token = localStorage.getItem("adminToken");
  return API.put(`/api/admin/bank-accounts/${id}/verify`, {}, adminAPI(token));
};

export const rejectBankAccount = (id) => {
  const token = localStorage.getItem("adminToken");
  return API.delete(`/api/admin/bank-accounts/${id}`, adminAPI(token));
};
