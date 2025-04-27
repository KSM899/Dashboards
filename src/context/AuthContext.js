// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

// Create context with a default value
const AuthContext = createContext({
  authenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  hasPermission: () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Simple login/logout functions
  const login = async (email, password) => {
    // Simplified mock login
    if (email === 'admin@example.com' && password === 'admin123') {
      const userData = { id: 1, name: 'Admin User', email, role: 'admin' };
      setUser(userData);
      setAuthenticated(true);
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    setAuthenticated(false);
  };

  const hasPermission = (permission) => {
    // Simple permission check
    if (!user) return false;
    if (user.role === 'admin') return true;
    return false;
  };

  const value = {
    authenticated,
    user,
    login,
    logout,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;