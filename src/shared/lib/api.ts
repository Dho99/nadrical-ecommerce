import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      try {
        const rawAuth = localStorage.getItem('store-auth');
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          token = parsed?.state?.session?.token || parsed?.session?.token;
        }
      } catch {
        // ignore parse error
      }
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
