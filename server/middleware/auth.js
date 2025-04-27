const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.app.jwtSecret);
    
    // Check if user still exists and is active
    const userResult = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1 AND status = $2',
      [decoded.id, 'active']
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    // Add user data to request
    req.user = userResult.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
    next(err);
  }
};