// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

// Create axios instance here instead of importing from api.js
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Initialize savedAccounts from localStorage
  const [savedAccounts, setSavedAccounts] = useState(() => {
    const saved = localStorage.getItem('savedAccounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // Set auth header
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete api.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        // Ensure localStorage is in sync
        localStorage.setItem('user', JSON.stringify(res.data));

        // Update this user in savedAccounts to keep it fresh
        setSavedAccounts(prev => {
          const updated = prev.map(acc => acc._id === res.data._id
            ? { ...acc, ...res.data, token } // Update existing
            : acc
          );
          // If not in list (edge case), add it
          if (!updated.some(acc => acc._id === res.data._id)) {
            updated.push({ ...res.data, token });
          }
          localStorage.setItem('savedAccounts', JSON.stringify(updated));
          return updated;
        });

      } catch (err) {
        console.error('Failed to load user:', err);
        // Do not clear savedAccounts, only active session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Helper to save account to list
  const saveAccountSession = (userData, userToken) => {
    setSavedAccounts(prev => {
      // Remove any existing entry for this user to avoid duplicates/stale data
      const filtered = prev.filter(acc => acc._id !== userData._id);
      const updated = [...filtered, { ...userData, token: userToken }];
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return updated;
    });
  };

  // Login
  const login = useCallback(async (formData) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', formData);
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      saveAccountSession(userData, newToken);

      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return false;
    }
  }, []);

  // Register
  const register = useCallback(async (formData) => {
    try {
      setError(null);
      const res = await api.post('/auth/register', formData);
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      saveAccountSession(userData, newToken);

      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return false;
    }
  }, []);

  // Detailed Mock Google Login
  const googleLogin = useCallback(async () => {
    try {
      setError(null);
      // Simulating a redirect to Google
      console.log("Redirecting to Google Auth...");
      
      // In a real app, this would be: 
      // window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?...';
      
      // For this demo:
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      alert("Redirecting to Google Sign-In... (This is a mock)");
      return true;
    } catch (err) {
      setError("Google Login failed");
      return false;
    }
  }, []);

  // Standard Logout (Active Session Only)
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  // Switch Account
  const switchAccount = useCallback((targetUserId) => {
    const targetAccount = savedAccounts.find(acc => acc._id === targetUserId);
    if (!targetAccount) return;

    // Set new active session
    localStorage.setItem('token', targetAccount.token);
    localStorage.setItem('user', JSON.stringify(targetAccount));
    setToken(targetAccount.token);
    setUser(targetAccount); // Optimistic update
    navigate('/'); // Go to home
    window.location.reload(); // Reload to ensure clean state with new token
  }, [savedAccounts, navigate]);

  // Remove Account from List
  const removeAccount = useCallback((targetUserId) => {
    setSavedAccounts(prev => {
      const updated = prev.filter(acc => acc._id !== targetUserId);
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return updated;
    });
    // If we removed the active user, logout
    if (user?._id === targetUserId) {
      logout();
    }
  }, [user, logout]);

  // Prepare for Add Account (Logout active but keep in list)
  const prepareAddAccount = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Clear errors
  const clearErrors = useCallback(() => setError(null), []);

  // Update user manually (e.g. after profile edit)
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Update in saved list too
    setSavedAccounts(prev => {
      const updated = prev.map(acc => acc._id === userData._id ? { ...acc, ...userData } : acc);
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    savedAccounts, // Exported
    login,
    register,
    googleLogin,
    logout,
    switchAccount, // Exported
    removeAccount, // Exported
    prepareAddAccount, // Exported
    clearErrors,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;