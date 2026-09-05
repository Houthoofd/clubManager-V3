import mysql from 'mysql2/promise';
import { tenantManager } from './TenantManager';
import { tenantContext } from '../context/tenantContext';

/**
 * Determine which pool to use based on AsyncLocalStorage context
 */
const getActivePool = (): mysql.Pool => {
  const context = tenantContext.getTenant();

  // Si on force explicitement la base master, ou si on n'a pas de dbName
  if (context?.isMaster) {
    return tenantManager.getMasterPool();
  }

  // Si le contexte spécifie une base de données tenant
  if (context?.dbName) {
    return tenantManager.getTenantPool(context.dbName);
  }

  // Comportement par défaut (Legacy fallback pour les tests ou requêtes système)
  // Attention : En production Multi-tenant, cela devrait idéalement taper sur Master
  // ou lever une erreur si on accède à des données tenant sans contexte.
  console.warn('[Database] Warning: Query executed without Tenant Context. Falling back to Master Database.');
  return tenantManager.getMasterPool();
};

/**
 * Get a connection from the active pool
 * @returns Promise with a PoolConnection
 * @throws Error if unable to get connection
 */
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  try {
    const pool = getActivePool();
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('[Database] Failed to get connection from active pool:', error);
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
    console.log('[Database] Active Connection test successful');
    return true;
  } catch (error) {
    console.error('[Database] Active Connection test failed:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Close the connection pool gracefully
 * @returns Promise<void>
 */
export const closePool = async (): Promise<void> => {
  await tenantManager.closeAllPools();
};

/**
 * Execute a query using the active pool
 * @param sql - SQL query string
 * @param values - Query parameters
 * @returns Promise with query results
 */
export const query = async <T = any>(
  sql: string,
  values?: any[]
): Promise<[T, mysql.FieldPacket[]]> => {
  const pool = getActivePool();
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
  console.log('[Database] SIGINT received, closing connection pools...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[Database] SIGTERM received, closing connection pools...');
  await closePool();
  process.exit(0);
});

// Expose a legacy "pool" object for compatibility with existing codebase
// The existing repositories use pool.query() instead of the standalone query()
export const pool = {
  query,
  getConnection
};

export default pool;
