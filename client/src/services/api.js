/**
 * MoneyPilot Central API Client Service
 * Configured with environment variables, localStorage token persistence, and full REST endpoint catalog
 */

const getApiBaseUrl = () => {
  // 1. Explicit environment variable takes precedence
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Production build mode or non-localhost domain (e.g. Render, Vercel)
  if (
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  ) {
    return 'https://moneypilot-api.onrender.com/api';
  }

  // 3. Local development default
  return 'http://localhost:5000/api';
};

const rawBaseUrl = getApiBaseUrl();
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = localStorage.getItem('moneypilot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `HTTP Error ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Base HTTP Methods
  async get(endpoint, customHeaders = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...customHeaders
      }
    });
    return handleResponse(response);
  },

  async post(endpoint, body = {}, customHeaders = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...customHeaders
      },
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async put(endpoint, body = {}, customHeaders = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...customHeaders
      },
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async delete(endpoint, customHeaders = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...customHeaders
      }
    });
    return handleResponse(response);
  },

  // Public Health Endpoint
  checkHealth() {
    return this.get('/health');
  },

  // Authentication APIs
  auth: {
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    login: (email, password, turnstileToken) => api.post('/auth/login', { email, password, turnstileToken }),
    getMe: () => api.get('/auth/me')
  },

  // Financial Profile APIs
  profile: {
    get: () => api.get('/profile'),
    update: (profileData) => api.put('/profile', profileData)
  },

  // Transactions APIs
  transactions: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.category) searchParams.append('category', params.category);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return api.get(`/transactions${queryString}`);
    },
    create: (transactionData) => api.post('/transactions', transactionData),
    update: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
    delete: (id) => api.delete(`/transactions/${id}`)
  },

  // Financial Goals APIs
  goals: {
    getAll: () => api.get('/goals'),
    create: (goalData) => api.post('/goals', goalData),
    update: (id, goalData) => api.put(`/goals/${id}`, goalData),
    delete: (id) => api.delete(`/goals/${id}`)
  },

  // Investments APIs
  investments: {
    getAll: () => api.get('/investments'),
    create: (investmentData) => api.post('/investments', investmentData),
    update: (id, investmentData) => api.put(`/investments/${id}`, investmentData),
    delete: (id) => api.delete(`/investments/${id}`)
  },

  // Financial Intelligence & Overview APIs
  financial: {
    getOverview: () => api.get('/financial/overview')
  },

  // Decision Simulator APIs
  simulations: {
    run: (decision) => api.post('/simulations/run', decision)
  },

  // AI Explanation & Assistant APIs
  ai: {
    explainOverview: () => api.post('/ai/explain-overview'),
    explainSimulation: (decision) => api.post('/ai/explain-simulation', decision),
    askAssistant: (question, conversationHistory = []) =>
      api.post('/ai/assistant', { question, conversationHistory })
  },

  // Real Financial News APIs
  news: {
    get: (category = 'All') => api.get(`/news?category=${encodeURIComponent(category)}`),
    personalize: (article) => api.post('/news/personalize', { article })
  }
};

export default api;
