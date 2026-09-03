import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('moneypilot_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('moneypilot_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response?.data?.user) {
          setUser(response.data.user);
        } else {
          // Token invalid or user removed
          localStorage.removeItem('moneypilot_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[AuthContext] Session verification failed:', err.message);
        localStorage.removeItem('moneypilot_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await api.auth.login(email, password);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('moneypilot_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response;
  };

  const register = async (name, email, password) => {
    const response = await api.auth.register(name, email, password);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('moneypilot_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('moneypilot_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
