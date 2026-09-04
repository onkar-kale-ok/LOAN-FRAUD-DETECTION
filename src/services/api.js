import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem('userRole');
    if (role) {
      config.headers['X-User-Role'] = role;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unexpected API error';

    const normalized = new Error(message);
    normalized.status = status;
    normalized.isNetworkError = !error.response;
    normalized.original = error;

    if (import.meta.env.DEV) {
      console.warn('[API]', status || 'NETWORK', message);
    }

    return Promise.reject(normalized);
  }
);

export default api;
