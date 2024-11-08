import axios from 'axios';

// Eliminar 'http://' o 'https://' si está presente en VITE_API_URL
const baseURL = import.meta.env.VITE_API_URL?.replace(/^(http|https):\/\//, '') || 'perronegro.onrender.com/api';

const api = axios.create({
  baseURL: `https://${baseURL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
