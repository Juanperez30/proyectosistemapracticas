import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // ajusta si cambias backend

const api = axios.create({
  baseURL: API_URL,
});

// Agrega token automáticamente a cada request si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
