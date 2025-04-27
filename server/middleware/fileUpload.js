// server/middleware/fileUpload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configure multer for file uploads
 */

// Configure storage - memory storage for processing or disk storage for persistence
const storage = process.env.UPLOAD_STORAGE_TYPE === 'disk' 
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename - timestamp + original name
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        cb(null, uniqueName);
      }
    })
  : multer.memoryStorage(); // Default to memory storage

// File filter function for allowed types
const fileFilter = (req, file, cb) => {
  // Check file types
  const allowedTypes = {
    'csv': ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'],
    'excel': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'image': ['image/jpeg', 'image/png', 'image/gif'],
    'pdf': ['application/pdf']
  };
  
  // Get file type from request or default to CSV
  const fileType = req.query.fileType || req.body.fileType || 'csv';
  const allowed = allowedTypes[fileType] || allowedTypes.csv;
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Expected ${fileType}, got ${file.mimetype}`), false);
  }
};

// Create upload middleware instances
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Export different upload configurations
module.exports = {
  // Single file upload
  single: (fieldName = 'file') => upload.single(fieldName),
  
  // Multiple files upload
  multiple: (fieldName = 'files', maxCount = 5) => upload.array(fieldName, maxCount),
  
  // Multiple files in different fields
  fields: (fields) => upload.fields(fields),
  
  // CSV upload specifically
  csv: () => upload.single('file'),
  
  // Handle multer errors
  handleError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    // No error, continue
    next();
  }
};