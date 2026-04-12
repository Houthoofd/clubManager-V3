/**
 * Database module
 *
 * Provides MySQL connection pool and database utilities
 */

export {
  pool,
  getConnection,
  testConnection,
  closePool,
  query,
} from './connection.js';

export default pool;
