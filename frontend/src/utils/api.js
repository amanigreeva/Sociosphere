// frontend/src/utils/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response?.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle error responses
    const errorMessage = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else if (error.response?.status >= 500) {
      // Handle server errors
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      // Handle not found
      toast.error('The requested resource was not found.');
    } else if (error.message === 'Network Error') {
      // Handle network errors
      toast.error('Network error. Please check your connection.');
    } else {
      // Show other errors to the user
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default api;