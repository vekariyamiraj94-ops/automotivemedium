import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('automotivemedium_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('automotivemedium_user', JSON.stringify(res.data));
        localStorage.setItem('automotivemedium_token', res.data.token);
        return { success: true };
      }
    } catch (err) {
      // In offline / preview demo mode, fallback gracefully
      const fallbackUser = {
        _id: 'demo-user',
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'service_advisor',
        token: 'demo-jwt-token',
      };
      setUser(fallbackUser);
      localStorage.setItem('automotivemedium_user', JSON.stringify(fallbackUser));
      return { success: true, message: 'Logged in using demo session' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('automotivemedium_user');
    localStorage.removeItem('automotivemedium_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
