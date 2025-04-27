// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { UserPlus, User, Shield, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { hasPermission, ROLES } from '../services/authService';
import UserFormModal from '../components/users/UserFormModal';
import DeleteConfirmationModal from '../components/users/DeleteConfirmationModal';

// In a real application, these would be API calls
const fetchUsers = () => {
  // This simulates the API call
  return Promise.resolve([
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: ROLES.ADMIN, lastLogin: '2025-04-10T15:30:00Z', status: 'active' },
    { id: 2, name: 'Manager User', email: 'manager@example.com', role: ROLES.MANAGER, lastLogin: '2025-04-09T12:45:00Z', status: 'active' },
    { id: 3, name: 'Viewer User', email: 'viewer@example.com', role: ROLES.VIEWER, lastLogin: '2025-04-05T09:15:00Z', status: 'active' },
    { id: 4, name: 'Sales Rep 1', email: 'salesrep1@example.com', role: ROLES.VIEWER, lastLogin: '2025-04-08T14:20:00Z', status: 'active' },
    { id: 5, name: 'Sales Rep 2', email: 'salesrep2@example.com', role: ROLES.VIEWER, lastLogin: '2025-04-07T10:10:00Z', status: 'inactive' }
  ]);
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Check if user has admin permissions
  const canManageUsers = hasPermission('MANAGE_USERS');

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userData = await fetchUsers();
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (error) {
        console.error('Error loading users:', error);
        // In a real app, show error notification
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleAddUser = (userData) => {
    // In a real app, this would make an API call
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userData,
      lastLogin: null,
      status: 'active'
    };
    
    setUsers([...users, newUser]);
    setShowAddUserModal(false);
  };

  const handleEditUser = (userData) => {
    // In a real app, this would make an API call
    const updatedUsers = users.map(user => 
      user.id === userData.id ? { ...user, ...userData } : user
    );
    
    setUsers(updatedUsers);
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    // In a real app, this would make an API call
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    setDeleteConfirmation(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const confirmDelete = (user) => {
    setDeleteConfirmation(user);
  };

  if (!canManageUsers) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Shield size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 max-w-md">
            You don't have permission to manage users. Please contact your administrator for access.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" />
            Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === ROLES.ADMIN ? 'bg-purple-100 text-purple-800' : 
                          user.role === ROLES.MANAGER ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.role === ROLES.ADMIN && users.filter(u => u.role === ROLES.ADMIN).length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <UserFormModal
          title="Add New User"
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <UserFormModal
          title="Edit User"
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <DeleteConfirmationModal
          user={deleteConfirmation}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={() => handleDeleteUser(deleteConfirmation.id)}
        />
      )}
    </DashboardLayout>
  );
};

export default UserManagement;