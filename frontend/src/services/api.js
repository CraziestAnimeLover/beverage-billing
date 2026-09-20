import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth status on initial load
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  otpLogin: (data) => api.post('/auth/otp-login', data),
  getMe: () => api.get('/auth/me'),
};

// Users / Customers
export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  updateProfile: (data) => api.put('/users/profile/me', data),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
};

// Products & Custom Pricing
export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  setCustomPrice: (data) => api.post('/products/custom-price', data),
  deleteCustomPrice: (id) => api.delete(`/products/custom-price/${id}`),
  getMeta: () => api.get('/products/meta/categories'),
};

// Inventory & Procurement
export const inventoryApi = {
  getInventory: (params) => api.get('/inventory', { params }),
  adjustStock: (data) => api.post('/inventory/adjust', data),
  getTransactions: (params) => api.get('/inventory/transactions', { params }),
};

export const purchaseApi = {
  getPurchases: () => api.get('/purchases'),
  createPurchase: (data) => api.post('/purchases', data),
};

// Orders
export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Invoices & E-Way Bills
export const invoiceApi = {
  generateInvoice: (data) => api.post('/invoices/generate', data),
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  getPdfUrl: (id) => {
    const token = localStorage.getItem('token');
    return `/api/invoices/${id}/pdf${token ? `?token=${token}` : ''}`;
  },
  downloadPdf: async (id, invoiceNumber) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/api/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${invoiceNumber || id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return url;
  },
};

export const ewayBillApi = {
  createEwayBill: (data) => api.post('/eway-bills', data),
  getEwayBills: () => api.get('/eway-bills'),
  getEwayBillById: (id) => api.get(`/eway-bills/${id}`),
  getPdfUrl: (id) => {
    const token = localStorage.getItem('token');
    return `/api/eway-bills/${id}/pdf${token ? `?token=${token}` : ''}`;
  },
  downloadPdf: async (id, ewayBillNumber) => {
    const response = await api.get(`/eway-bills/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EwayBill-${ewayBillNumber || id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return url;
  },
};

// Payments & Ledger
export const paymentApi = {
  recordPayment: (data) => api.post('/payments', data),
  getPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};

export const ledgerApi = {
  getLedger: (params) => api.get('/ledger', { params }),
};

// Reports & Analytics
export const reportApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSales: (params) => api.get('/reports/sales', { params }),
  getOutstanding: () => api.get('/reports/outstanding'),
  getProfit: () => api.get('/reports/profit'),
};

// Operating Expenses
export const expenseApi = {
  getExpenses: (params) => api.get('/expenses', { params }),
  createExpense: (data) => api.post('/expenses', data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

// Settings
export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

// WhatsApp triggers
export const whatsappApi = {
  sendInvoice: (id) => api.post(`/whatsapp/invoice/${id}`),
  sendPayment: (id) => api.post(`/whatsapp/payment/${id}`),
  sendReminder: (userId) => api.post(`/whatsapp/reminder/${userId}`),
};

export default api;
