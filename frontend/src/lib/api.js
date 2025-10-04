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

// Family Members API
export const familyMembersAPI = {
  getAll: async () => {
    const response = await api.get('/family-members');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/family-members/${id}`);
    return response.data;
  },

  create: async (memberData) => {
    const response = await api.post('/family-members', memberData);
    return response.data;
  },

  update: async (id, memberData) => {
    const response = await api.put(`/family-members/${id}`, memberData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/family-members/${id}`);
    return response.data;
  },
};

// Investments API
export const investmentsAPI = {
  getAll: async (familyMemberId = null) => {
    const params = familyMemberId ? { family_member_id: familyMemberId } : {};
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
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default api;