import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import ImportDataPage from './pages/ImportDataPage'; // ✅ New import
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// 🔒 Protected Route
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { authenticated, hasPermission } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 🚏 Main Routes
const AppRoutes = () => {
  const { authenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={authenticated ? <Navigate to="/" replace /> : <Login />} 
      />

      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DataProvider>
              <Dashboard />
            </DataProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <DataProvider>
              <Analytics />
            </DataProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <DataProvider>
              <Reports />
            </DataProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <DataProvider>
              <Settings />
            </DataProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredPermission="MANAGE_USERS">
            <DataProvider>
              <UserManagement />
            </DataProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/import" 
        element={
          <ProtectedRoute requiredPermission="IMPORT_DATA">
            <DataProvider>
              <ImportDataPage />
            </DataProvider>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// 🎯 Root App Component
const App = () => {
  return (
    <Router>
      <NotificationProvider> {/* ✅ Wraps entire app */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;