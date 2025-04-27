// server/middleware/rbac.js

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts access to routes based on user roles
 * 
 * @param {...string} roles - Allowed user roles for the route
 * @returns {function} Express middleware function
 */
const rbac = (...allowedRoles) => {
    return (req, res, next) => {
      // Check if auth middleware has attached the user object
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          error: { 
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }
        });
      }
      
      // Check if user role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          error: { 
            message: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS'
          }
        });
      }
      
      // User has permission, proceed to the next middleware/controller
      next();
    };
  };
  
  module.exports = rbac;