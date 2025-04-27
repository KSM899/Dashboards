// src/components/common/TargetEditor.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/dataProcessing';
import { hasPermission } from '../../services/authService';

const TargetEditor = ({ 
  targets = {}, 
  onSaveTargets, 
  categories = [], 
  salesUnits = [],
  salesReps = [],
  className = "" 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({ ...targets });
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'category', 'region', 'rep'
  const [newTargetKey, setNewTargetKey] = useState('');
  const [newTargetValue, setNewTargetValue] = useState('');
  
  // Check if user has permission to edit targets
  const canEditTargets = hasPermission('EDIT_TARGETS');
  
  // Reset edited targets when prop changes
  useEffect(() => {
    setEditedTargets({ ...targets });
  }, [targets]);
  
  // Get targets for current tab
  const getTargetsForTab = () => {
    switch (activeTab) {
      case 'category':
        return Object.entries(editedTargets)
          .filter(([key]) => key.startsWith('category_'))
          .map(([key, value]) => ({
            key,
            name: key.replace('category_', ''),
            value
          }));
      case 'region':
        return Object.entries(editedTargets)
          .filter(([key]) => key.startsWith('region_'))
          .map(([key, value]) => ({
            key,
            name: key.replace('region_', ''),
            value
          }));
      case 'rep':
        return Object.entries(editedTargets)
          .filter(([key]) => key.startsWith('rep_'))
          .map(([key, value]) => ({
            key,
            name: key.replace('rep_', ''),
            value
          }));
      case 'company':
      default:
        return Object.entries(editedTargets)
          .filter(([key]) => ['monthly', 'quarterly', 'yearly'].includes(key))
          .map(([key, value]) => ({
            key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value
          }));
    }
  };
  
  // Handler functions
  const handleTargetChange = (key, value) => {
    setEditedTargets(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };
  
  const handleSave = () => {
    onSaveTargets(editedTargets);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedTargets({ ...targets });
    setIsEditing(false);
  };
  
  const handleAddTarget = () => {
    if (!newTargetKey || newTargetKey === 'select') return;
    
    setEditedTargets(prev => ({
      ...prev,
      [newTargetKey]: parseFloat(newTargetValue) || 0
    }));
    
    setNewTargetKey('');
    setNewTargetValue('');
  };
  
  const handleRemoveTarget = (key) => {
    setEditedTargets(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };
  
  // Available options for new targets
  const getNewTargetOptions = () => {
    switch (activeTab) {
      case 'category':
        return categories.filter(category => 
          !Object.keys(editedTargets).includes(`category_${category}`)
        );
      case 'region':
        return salesUnits.filter(unit => 
          !Object.keys(editedTargets).includes(`region_${unit}`)
        );
      case 'rep':
        return salesReps.filter(rep => 
          !Object.keys(editedTargets).includes(`rep_${rep.id}`)
        );
      case 'company':
      default:
        const companyOptions = [
          { id: 'monthly', name: 'Monthly Target' },
          { id: 'quarterly', name: 'Quarterly Target' },
          { id: 'yearly', name: 'Yearly Target' }
        ];
        return companyOptions.filter(option => 
          !Object.keys(editedTargets).includes(option.id)
        );
    }
  };
  
  // Format display values
  const formatKeyForDisplay = (key) => {
    if (key === 'monthly') return 'Monthly Target';
    if (key === 'quarterly') return 'Quarterly Target';
    if (key === 'yearly') return 'Yearly Target';
    
    if (key.startsWith('category_')) {
      return `${key.replace('category_', '')} Category`;
    }
    
    if (key.startsWith('region_')) {
      return `${key.replace('region_', '')} Region`;
    }
    
    if (key.startsWith('rep_')) {
      const repId = key.replace('rep_', '');
      const rep = salesReps.find(r => r.id.toString() === repId);
      return rep ? rep.name : `Rep #${repId}`;
    }
    
    return key;
  };
  
  const currentTabTargets = getTargetsForTab();
  const newTargetOptions = getNewTargetOptions();
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Sales Targets</h2>
        
        {canEditTargets && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <Edit size={16} className="mr-1" />
                Edit Targets
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {['company', 'category', 'region', 'rep'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'rep' ? 's' : tab === 'company' ? '' : 'ies'}
          </button>
        ))}
      </div>
      
      {/* Target Editor Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {activeTab === 'company' ? 'Time Period' : 
                 activeTab === 'category' ? 'Category' : 
                 activeTab === 'region' ? 'Region' : 'Sales Rep'}
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Value
              </th>
              {isEditing && (
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentTabTargets.map((target, index) => (
              <tr key={target.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {formatKeyForDisplay(target.key)}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      value={target.value}
                      onChange={(e) => handleTargetChange(target.key, e.target.value)}
                      className="w-32 px-2 py-1 text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    formatCurrency(target.value)
                  )}
                </td>
                {isEditing && (
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleRemoveTarget(target.key)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove target"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            
            {/* Add new target row */}
            {isEditing && (
              <tr className="bg-gray-50">
                <td className="px-3 py-2 text-sm">
                  <select
                    value={newTargetKey}
                    onChange={(e) => setNewTargetKey(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="select">Select...</option>
                    {newTargetOptions.map(option => (
                      <option 
                        key={option.id || option}
                        value={
                          activeTab === 'company' ? option.id :
                          activeTab === 'category' ? `category_${option}` :
                          activeTab === 'region' ? `region_${option}` :
                          `rep_${option.id}`
                        }
                      >
                        {option.name || option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-sm text-right">
                  <input
                    type="number"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-32 px-2 py-1 text-right border rounded"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={handleAddTarget}
                    className="text-green-500 hover:text-green-700"
                    title="Add target"
                    disabled={!newTargetKey || newTargetKey === 'select'}
                  >
                    <PlusCircle size={16} />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TargetEditor;