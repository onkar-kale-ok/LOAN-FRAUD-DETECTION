import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem('userRole') || 'ANALYST';
    config.headers['X-User-Role'] = role;
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
      }
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

    const timedOut =
      error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '');
    const normalized = new Error(
      timedOut ? 'Connection timed out. Please try again.' : message
    );
    normalized.status = status;
    normalized.isNetworkError = !error.response;
    normalized.isTimeout = timedOut;
    normalized.original = error;

    if (import.meta.env.DEV) {
      console.warn('[API]', status || 'NETWORK', message);
    }

    return Promise.reject(normalized);
  }
);

export default api;
