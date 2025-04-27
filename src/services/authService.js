// src/services/authService.js
import { jwtDecode } from 'jwt-decode';
import apiService from './apiService';

// User roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer'
};

// Role-based permissions
export const PERMISSIONS = {
  VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
  EDIT_TARGETS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_USERS: [ROLES.ADMIN],
  EXPORT_DATA: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_SENSITIVE_DATA: [ROLES.ADMIN, ROLES.MANAGER],
  EDIT_SETTINGS: [ROLES.ADMIN]
};

// Local storage keys
const TOKEN_KEY = 'sales_dashboard_token';
const USER_KEY = 'sales_dashboard_user';

/**
 * Login user and store JWT token
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Promise resolving to user data
 */
export const login = async (email, password) => {
  try {
    // In a real app, this would be a call to your authentication endpoint
    // For now, we'll simulate it with our mock users
    
    // Simulated API response
    const mockUsers = [
      { id: 1, email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: ROLES.ADMIN },
      { id: 2, email: 'manager@example.com', password: 'manager123', name: 'Manager User', role: ROLES.MANAGER },
      { id: 3, email: 'viewer@example.com', password: 'viewer123', name: 'Viewer User', role: ROLES.VIEWER }
    ];
    
    // Find user
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create a mock token (in production this would come from the server)
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6JHt1c2VyLmlkfSwiZW1haWwiOiIke3VzZXIuZW1haWx9Iiwicm9sZSI6IiR7dXNlci5yb2xlfSIsImlhdCI6MTYxNjE0NjgwMCwiZXhwIjoxNjE2MTUwNDAwfQ.JmxhLyiVj5-QZ8n7Zr29MuKGvn-Fa_BnUZLmiTzk4bY`;
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    
    // Update the last login time (in a real app, this would be done server-side)
    try {
      const updatedUser = { ...userWithoutPassword, lastLogin: new Date().toISOString() };
      await apiService.users.update(user.id, updatedUser);
    } catch (error) {
      console.warn('Failed to update last login time:', error);
    }
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
};

/**
 * Get current authenticated user
 * @returns {Object|null} User data or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    // In a real app, you'd verify token expiration
    // const decoded = jwtDecode(token);
    // const currentTime = Date.now() / 1000;
    // return decoded.exp > currentTime;
    
    // For demo purposes, just check if we have a user
    return getCurrentUser() !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Check if current user has permission
 * @param {string} permission 
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    const permissionsForRole = PERMISSIONS[permission] || [];
    return permissionsForRole.includes(user.role);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

/**
 * Register a new user (admin only)
 * @param {Object} userData 
 * @returns {Promise}
 */
export const registerUser = async (userData) => {
  try {
    // Check if current user has admin permissions
    if (!hasPermission('MANAGE_USERS')) {
      throw new Error('You do not have permission to register users');
    }
    
    // In a real app, this would call the user creation API
    return await apiService.users.create(userData);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Update user data
 * @param {number} userId 
 * @param {Object} userData 
 * @returns {Promise}
 */
export const updateUser = async (userId, userData) => {
  try {
    // Check if current user has admin permissions or is updating their own profile
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    if (currentUser.id !== userId && !hasPermission('MANAGE_USERS')) {
      throw new Error('You do not have permission to update this user');
    }
    
    return await apiService.users.update(userId, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {number} userId 
 * @returns {Promise}
 */
export const deleteUser = async (userId) => {
  try {
    // Check if current user has admin permissions
    if (!hasPermission('MANAGE_USERS')) {
      throw new Error('You do not have permission to delete users');
    }
    
    return await apiService.users.delete(userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Change password for current user
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise}
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // In a real app, this would verify the current password server-side
    // and update to the new password
    const mockUsers = [
      { id: 1, email: 'admin@example.com', password: 'admin123' },
      { id: 2, email: 'manager@example.com', password: 'manager123' },
      { id: 3, email: 'viewer@example.com', password: 'viewer123' }
    ];
    
    const userRecord = mockUsers.find(u => u.id === user.id);
    if (!userRecord || userRecord.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // In a real app, this would be handled by the server
    // For demo, we'll just simulate success
    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  hasPermission,
  registerUser,
  updateUser,
  deleteUser,
  changePassword,
  ROLES,
  PERMISSIONS
};