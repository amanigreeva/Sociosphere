import axios from "axios";

// In development, the proxy will handle the base URL
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

export const makeRequest = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add interceptor to include token
makeRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});
