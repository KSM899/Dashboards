// src/components/common/ImportButton.jsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { hasPermission } from '../../services/authService';
import ImportDataModal from './ImportDataModal';

/**
 * Import Button Component
 * 
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback after successful import
 * @param {Function} props.onError - Callback after failed import
 * @param {string} props.buttonText - Custom button text
 * @param {string} props.className - Additional CSS classes
 */
const ImportButton = ({ 
  onSuccess, 
  onError, 
  buttonText = 'Import Data',
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  
  // Check if user has permission to import data
  const canImport = hasPermission('IMPORT_DATA');
  
  if (!canImport) {
    return null; // Don't render anything if user doesn't have permission
  }
  
  const handleSuccess = (results) => {
    setShowModal(false);
    
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(results);
    }
  };
  
  const handleError = (error) => {
    if (onError && typeof onError === 'function') {
      onError(error);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 ${className}`}
      >
        <Upload size={18} className="mr-2" />
        {buttonText}
      </button>
      
      {showModal && (
        <ImportDataModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </>
  );
};

export default ImportButton;