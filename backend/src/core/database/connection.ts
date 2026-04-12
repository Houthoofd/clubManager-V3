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
}

/**
 * Get database configuration from environment variables
 */
const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clubmanager',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
};

/**
 * Create and configure MySQL connection pool
 */
const createPool = (): mysql.Pool => {
  try {
    const config = getDatabaseConfig();

    const pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: config.connectionLimit,
      waitForConnections: config.waitForConnections,
      queueLimit: config.queueLimit,
      enableKeepAlive: config.enableKeepAlive,
      keepAliveInitialDelay: config.keepAliveInitialDelay,
    });

    console.log(`[Database] Connection pool created successfully`);
    console.log(`[Database] Host: ${config.host}:${config.port}`);
    console.log(`[Database] Database: ${config.database}`);
    console.log(`[Database] Connection limit: ${config.connectionLimit}`);

    return pool;
  } catch (error) {
    console.error('[Database] Failed to create connection pool:', error);
    throw new Error('Failed to initialize database connection pool');
  }
};

/**
 * MySQL connection pool instance
 */
export const pool = createPool();

/**
 * Get a connection from the pool
 * @returns Promise with a PoolConnection
 * @throws Error if unable to get connection
 */
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  try {
    const connection = await pool.getConnection();
    console.log('[Database] Connection acquired from pool');
    return connection;
  } catch (error) {
    console.error('[Database] Failed to get connection from pool:', error);
    throw new Error('Unable to get database connection');
  }
};

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection is successful
 */
export const testConnection = async (): Promise<boolean> => {
  let connection: mysql.PoolConnection | null = null;

  try {
    connection = await getConnection();
    await connection.ping();
    console.log('[Database] Connection test successful');
    return true;
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
      console.log('[Database] Connection released back to pool');
    }
  }
};

/**
 * Close the connection pool gracefully
 * @returns Promise<void>
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('[Database] Connection pool closed successfully');
  } catch (error) {
    console.error('[Database] Error closing connection pool:', error);
    throw new Error('Failed to close database connection pool');
  }
};

/**
 * Execute a query using the pool
 * @param sql - SQL query string
 * @param values - Query parameters
 * @returns Promise with query results
 */
export const query = async <T = any>(
  sql: string,
  values?: any[]
): Promise<[T, mysql.FieldPacket[]]> => {
  try {
    const result = await pool.query<T>(sql, values);
    return result as [T, mysql.FieldPacket[]];
  } catch (error) {
    console.error('[Database] Query execution failed:', error);
    console.error('[Database] SQL:', sql);
    console.error('[Database] Values:', values);
    throw error;
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('[Database] SIGINT received, closing connection pool...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[Database] SIGTERM received, closing connection pool...');
  await closePool();
  process.exit(0);
});

export default pool;
