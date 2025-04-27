require('dotenv').config();

const { Pool } = require('pg');
const config = require('./config');

// Create connection pool with proper error handling
const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  // Add connection timeout and idle timeout settings
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

// Add event listeners for pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully, time:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Override client.query to add logging
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    // Override client.release to add monitoring
    client.release = () => {
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};