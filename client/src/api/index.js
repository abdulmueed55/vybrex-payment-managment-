import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vybrex_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vybrex_token');
      localStorage.removeItem('vybrex_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getRevenueChart: () => api.get('/dashboard/revenue-chart'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getActivity: () => api.get('/dashboard/activity'),
};

// Clients
export const clientsApi = {
  getAll: (params) => api.get('/clients', { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  addPayment: (id, data) => api.post(`/clients/${id}/payments`, data),
  deletePayment: (id, paymentId) => api.delete(`/clients/${id}/payments/${paymentId}`),
};

// Employees
export const employeesApi = {
  getAll: (params) => api.get('/employees', { params }),
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  addSalaryPayment: (id, data) => api.post(`/employees/${id}/salary-payments`, data),
  deleteSalaryPayment: (id, paymentId) => api.delete(`/employees/${id}/salary-payments/${paymentId}`),
};

// Payments / Expenses
export const paymentsApi = {
  getLedger: (params) => api.get('/payments/ledger', { params }),
  getSummary: () => api.get('/payments/summary'),
  getExpenses: () => api.get('/payments/expenses'),
  createExpense: (data) => api.post('/payments/expenses', data),
  updateExpense: (id, data) => api.put(`/payments/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/payments/expenses/${id}`),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  export: () => api.get('/settings/export'),
};
