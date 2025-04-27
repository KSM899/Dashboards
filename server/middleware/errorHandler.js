// server/middleware/errorHandler.js

/**
 * Global error handling middleware
 * Provides consistent error responses across the API
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for server-side debugging
    console.error('Error:', err.message, err.stack);
    
    // Get status code from error if it exists, default to 500
    const statusCode = err.statusCode || 500;
    
    // Prepare error response
    const errorResponse = {
      success: false,
      error: {
        message: err.message || 'An unexpected error occurred',
        code: err.code || 'INTERNAL_ERROR'
      }
    };
    
    // Add validation errors if they exist
    if (err.validationErrors) {
      errorResponse.error.validationErrors = err.validationErrors;
    }
    
    // In development, include the stack trace
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = err.stack;
    }
    
    // Only log 500 errors in production as they're unexpected
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
      // In production, you might want to log to a monitoring service
      // like Sentry, New Relic, etc.
    }
    
    // Send error response
    res.status(statusCode).json(errorResponse);
  };
  
  // Custom error class with status code
  class ApiError extends Error {
    constructor(message, statusCode = 500, code = null, validationErrors = null) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.validationErrors = validationErrors;
    }
    
    static badRequest(message, code = 'BAD_REQUEST', validationErrors = null) {
      return new ApiError(message, 400, code, validationErrors);
    }
    
    static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
      return new ApiError(message, 401, code);
    }
    
    static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
      return new ApiError(message, 403, code);
    }
    
    static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
      return new ApiError(message, 404, code);
    }
    
    static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
      return new ApiError(message, 500, code);
    }
  }
  
  module.exports = errorHandler;
  module.exports.ApiError = ApiError;