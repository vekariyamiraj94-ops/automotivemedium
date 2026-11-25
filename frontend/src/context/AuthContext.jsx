import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('automotivemedium_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        username: identifier,
        email: identifier,
        password,
      });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('automotivemedium_user', JSON.stringify(res.data));
        localStorage.setItem('automotivemedium_token', res.data.token);
        return { success: true };
      }
    } catch (err) {
      // Offline fallback: supports requested 'admin' and 'admin@123'
      if (
        (identifier.toLowerCase() === 'admin' || identifier.includes('admin')) &&
        (password === 'admin@123' || password === 'Admin@123')
      ) {
        const adminUser = {
          _id: 'admin-session-id',
          name: 'DevOps & System Admin',
          username: 'admin',
          email: 'admin@automotivemedium.com',
          role: 'admin',
          token: 'demo-admin-jwt-token',
        };
        setUser(adminUser);
        localStorage.setItem('automotivemedium_user', JSON.stringify(adminUser));
        return { success: true };
      }
      return { success: false, message: err.message || 'Invalid username or password' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (e) {
      try {
        await api.post('/auth/logout');
      } catch (err) {}
    }
    setUser(null);
    localStorage.removeItem('automotivemedium_user');
    localStorage.removeItem('automotivemedium_token');
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('automotivemedium_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
