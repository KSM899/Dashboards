const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const targetsRoutes = require('./routes/targets');
const usersRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // CORS configuration
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/targets', targetsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.app.nodeEnv} mode`);
});

module.exports = app; // For testing