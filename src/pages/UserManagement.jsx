// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as authLogin, 
  logout as authLogout, 
  isAuthenticated, 
  getCurrentUser,
  hasPermission as checkPermission
} from '../services/authService';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = isAuthenticated();
        setAuthenticated(isAuth);
        
        if (isAuth) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authLogin(email, password);
      setUser(userData);
      setAuthenticated(true);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      authLogout();
      setUser(null);
      setAuthenticated(false);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    return checkPermission(permission);
  };

  // Context value to be provided
  const contextValue = {
    user,
    loading,
    error,
    authenticated,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;