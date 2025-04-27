// src/services/apiService.js

import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for JWT auth
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response.data;
  },
  (error) => {
    // Handle auth errors (redirect to login)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Check if we're not already on login page to avoid redirect loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Format error message for consistent handling
    const errorMessage = 
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message || 'An unexpected error occurred';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response ? error.response.status : null,
      data: error.response ? error.response.data : null
    });
  }
);

// Auth service
const auth = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  verifyToken: () => apiClient.get('/auth/verify'),
  requestPasswordReset: (email) => apiClient.post('/auth/password/request-reset', { email }),
  resetPassword: (data) => apiClient.post('/auth/password/reset', data),
  changePassword: (data) => apiClient.post('/users/change-password', data)
};

// Sales service
const sales = {
  getAll: (filters = {}) => apiClient.get('/sales', { params: filters }),
  getById: (id) => apiClient.get(`/sales/${id}`),
  getSummary: (filters = {}) => apiClient.get('/sales/summary', { params: filters }),
  getAnalytics: (options) => apiClient.post('/sales/analytics', options),
  create: (saleData) => apiClient.post('/sales', saleData),
  update: (id, updates) => apiClient.put(`/sales/${id}`, updates),
  delete: (id) => apiClient.delete(`/sales/${id}`),
  export: (format, filters) => apiClient.post('/sales/export', { format, filters }, {
    responseType: 'blob' // For file downloads
  }),
  import: (formData) => {
    // Use multipart/form-data for file uploads
    return apiClient.post('/sales/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Targets service
const targets = {
  getAll: (filters = {}) => apiClient.get('/targets', { params: filters }),
  getById: (id) => apiClient.get(`/targets/${id}`),
  getActive: (date) => apiClient.get('/targets/active', { params: { date } }),
  getAchievement: (filters = {}) => apiClient.get('/targets/achievement', { params: filters }),
  create: (targetData) => apiClient.post('/targets', targetData),
  update: (id, updates) => apiClient.put(`/targets/${id}`, updates),
  delete: (id) => apiClient.delete(`/targets/${id}`),
  bulkUpdate: (targetsData, options = {}) => apiClient.post('/targets/bulk', { targets: targetsData, options })
};

// Users service
const users = {
  getAll: (filters = {}) => apiClient.get('/users', { params: filters }),
  getById: (id) => apiClient.get(`/users/${id}`),
  getCurrent: () => apiClient.get('/users/me'),
  getSalesRepData: (filters = {}) => apiClient.get('/users/sales-rep-data', { params: filters }),
  create: (userData) => apiClient.post('/users', userData),
  update: (id, updates) => apiClient.put(`/users/${id}`, updates),
  delete: (id) => apiClient.delete(`/users/${id}`),
  toggleStatus: (id) => apiClient.put(`/users/${id}/status`),
  getActivityLogs: (id, params = {}) => apiClient.get(`/users/${id}/activity`, { params })
};

// Settings service
const settings = {
  getUserSettings: () => apiClient.get('/settings/user'),
  getUserSetting: (key) => apiClient.get(`/settings/user/${key}`),
  updateUserSetting: (key, value) => apiClient.put(`/settings/user/${key}`, { value }),
  updateUserSettings: (settings) => apiClient.put('/settings/user', settings),
  deleteUserSetting: (key) => apiClient.delete(`/settings/user/${key}`),
  getDashboardSettings: () => apiClient.get('/settings/dashboard'),
  updateDashboardSettings: (settings) => apiClient.put('/settings/dashboard', settings),
  resetDashboardSettings: () => apiClient.post('/settings/dashboard/reset'),
  getSystemSettings: () => apiClient.get('/settings/system'),
  getSystemSetting: (key) => apiClient.get(`/settings/system/${key}`),
  updateSystemSetting: (key, value, description) => 
    apiClient.put(`/settings/system/${key}`, { value, description }),
  updateSystemSettings: (settings) => apiClient.put('/settings/system', settings),
  deleteSystemSetting: (key) => apiClient.delete(`/settings/system/${key}`)
};

// Export all services
const apiService = {
  auth,
  sales,
  targets,
  users,
  settings
};

export default apiService;