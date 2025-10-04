import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Investors API (Enhanced)
export const investorsAPI = {
  getAll: async () => {
    const response = await api.get('/investors');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/investors/${id}`);
    return response.data;
  },

  create: async (investorData) => {
    const response = await api.post('/investors', investorData);
    return response.data;
  },

  update: async (id, investorData) => {
    const response = await api.put(`/investors/${id}`, investorData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/investors/${id}`);
    return response.data;
  },
};

// Investments API (Enhanced)
export const investmentsAPI = {
  getAll: async (investorId = null, investmentType = null, viewType = 'list') => {
    const params = {};
    if (investorId) params.investor_id = investorId;
    if (investmentType) params.investment_type = investmentType;
    if (viewType) params.view_type = viewType;
    
    const response = await api.get('/investments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  create: async (investmentData) => {
    const response = await api.post('/investments', investmentData);
    return response.data;
  },

  update: async (id, investmentData) => {
    const response = await api.put(`/investments/${id}`, investmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  },

  importFromExcel: async (fileData) => {
    const response = await api.post('/investments/import-excel', fileData);
    return response.data;
  },
};

// Custom Fields API
export const customFieldsAPI = {
  getByEntityType: async (entityType) => {
    const response = await api.get(`/custom-fields/${entityType}`);
    return response.data;
  },

  create: async (fieldData) => {
    const response = await api.post('/custom-fields', fieldData);
    return response.data;
  },

  delete: async (fieldId) => {
    const response = await api.delete(`/custom-fields/${fieldId}`);
    return response.data;
  },
};

// Dashboard API (Enhanced)
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getSummary: async () => {
    const response = await api.get('/reports/summary');
    return response.data;
  },
};

export default api;