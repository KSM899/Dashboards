
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sales Dashboard. All rights reserved.
        </div>
        <div className="text-sm text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;