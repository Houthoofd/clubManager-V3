/**
 * @fileoverview Database Configuration
 * @module core/config/database
 *
 * MySQL database connection pool configuration using mysql2.
 * Provides a singleton pool instance for database operations.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration interface
 */
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  waitForConnections: boolean;
  queueLimit: number;
  enableKeepAlive: boolean;
  keepAliveInitialDelay: number;
  timezone: string;
  dateStrings: boolean;
}

/**
 * Get database configuration from environment variables
 *
 * @returns Database configuration object
 */
const getDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clubmanager',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  waitForConnections: true,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  timezone: 'Z', // Use UTC
  dateStrings: false, // Return Date objects instead of strings
});

/**
 * MySQL connection pool instance
 */
export const pool = mysql.createPool(getDatabaseConfig());

/**
 * Test database connection
 *
 * @returns Promise that resolves to true if connection successful
 * @throws Error if connection fails
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw new Error(
      `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Close all database connections
 *
 * @returns Promise that resolves when all connections are closed
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✓ Database connection pool closed');
  } catch (error) {
    console.error('✗ Error closing database pool:', error);
    throw error;
  }
};

/**
 * Execute a query with automatic connection handling
 *
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Query results
 */
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T> => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Begin a transaction
 *
 * @returns Connection object for transaction
 */
export const beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

// Export pool as default
export default pool;
