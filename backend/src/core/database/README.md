# Database Module

MySQL connection pool implementation for ClubManager V3 backend using `mysql2/promise`.

## Overview

This module provides a robust MySQL connection pool with proper TypeScript types, error handling, and graceful shutdown capabilities. It uses the `mysql2` library with promise support for async/await operations.

## Configuration

The database connection is configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL server host | `localhost` |
| `DB_PORT` | MySQL server port | `3306` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `''` (empty) |
| `DB_NAME` | Database name | `clubmanager` |
| `DB_CONNECTION_LIMIT` | Maximum number of connections in pool | `10` |

### Example `.env` Configuration

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=clubmanager_user
DB_PASSWORD=your_secure_password
DB_NAME=clubmanager
DB_CONNECTION_LIMIT=20
```

## Usage

### Import the Module

```typescript
import { pool, getConnection, query, testConnection, closePool } from '@/core/database';
```

### Using the Connection Pool Directly

```typescript
// Execute a simple query
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

// Execute with typed results
interface User {
  id: number;
  email: string;
  name: string;
}

const [users] = await pool.query<User[]>('SELECT * FROM users');
```

### Using the Query Helper

```typescript
import { query } from '@/core/database';

// Execute a query with the helper function
const [results] = await query<User[]>(
  'SELECT * FROM users WHERE role = ?',
  ['admin']
);
```

### Getting a Connection from the Pool

```typescript
import { getConnection } from '@/core/database';

const connection = await getConnection();

try {
  // Use the connection for transactions
  await connection.beginTransaction();
  
  await connection.query('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
  await connection.query('INSERT INTO audit_log (action) VALUES (?)', ['user_created']);
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  // Always release the connection back to the pool
  connection.release();
}
```

### Testing the Connection

```typescript
import { testConnection } from '@/core/database';

const isConnected = await testConnection();
if (!isConnected) {
  console.error('Database connection failed!');
}
```

### Graceful Shutdown

```typescript
import { closePool } from '@/core/database';

// Close the pool when shutting down the application
await closePool();
```

## API Reference

### `pool`

The MySQL connection pool instance. Use this for direct access to the pool.

**Type:** `mysql.Pool`

### `getConnection()`

Acquires a connection from the pool.

**Returns:** `Promise<mysql.PoolConnection>`

**Throws:** Error if unable to get a connection

**Example:**
```typescript
const connection = await getConnection();
// Use connection...
connection.release(); // Always release when done
```

### `query<T>(sql: string, values?: any[])`

Executes a query using the connection pool.

**Parameters:**
- `sql` - SQL query string (use `?` for parameters)
- `values` - Optional array of parameter values

**Returns:** `Promise<[T, mysql.FieldPacket[]]>`

**Example:**
```typescript
const [rows] = await query<User[]>(
  'SELECT * FROM users WHERE status = ?',
  ['active']
);
```

### `testConnection()`

Tests the database connection by pinging the server.

**Returns:** `Promise<boolean>` - `true` if successful, `false` otherwise

### `closePool()`

Closes the connection pool gracefully.

**Returns:** `Promise<void>`

**Throws:** Error if unable to close the pool

## Best Practices

### 1. Always Release Connections

When using `getConnection()`, always release the connection back to the pool:

```typescript
const connection = await getConnection();
try {
  // Use connection
} finally {
  connection.release(); // Always in finally block
}
```

### 2. Use Parameterized Queries

Always use parameterized queries to prevent SQL injection:

```typescript
// ✅ Good - parameterized
await query('SELECT * FROM users WHERE email = ?', [email]);

// ❌ Bad - string concatenation
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

### 3. Handle Errors Appropriately

```typescript
try {
  const [results] = await query('SELECT * FROM users');
  return results;
} catch (error) {
  console.error('Database query failed:', error);
  throw new Error('Failed to fetch users');
}
```

### 4. Use Transactions for Multiple Operations

```typescript
const connection = await getConnection();
try {
  await connection.beginTransaction();
  
  await connection.query('INSERT INTO ...');
  await connection.query('UPDATE ...');
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### 5. Type Your Query Results

```typescript
interface UserRow {
  id: number;
  email: string;
  created_at: Date;
}

const [users] = await query<UserRow[]>('SELECT * FROM users');
// users is now typed as UserRow[]
```

## Error Handling

The module includes comprehensive error handling:

- Connection acquisition failures are logged and throw descriptive errors
- Query failures log the SQL and parameters for debugging
- Process termination signals (SIGINT, SIGTERM) trigger graceful pool shutdown

## Connection Pool Settings

The connection pool is configured with the following defaults:

- `waitForConnections: true` - Queue requests when all connections are in use
- `queueLimit: 0` - No limit on queued connection requests
- `enableKeepAlive: true` - Enable TCP keep-alive
- `keepAliveInitialDelay: 0` - Start keep-alive immediately

## Troubleshooting

### Connection Timeout

If you experience connection timeouts, try:
1. Increasing `DB_CONNECTION_LIMIT`
2. Checking network connectivity to the database
3. Verifying database server is running and accepting connections

### Too Many Connections

If you hit connection limits:
1. Ensure connections are properly released after use
2. Reduce `DB_CONNECTION_LIMIT` if the database has limits
3. Check for connection leaks (connections not released)

### Authentication Errors

Verify:
1. `DB_USER` and `DB_PASSWORD` are correct
2. User has proper permissions on the database
3. Database exists and is accessible

## Testing

To test the database connection:

```typescript
import { testConnection } from '@/core/database';

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    const result = await testConnection();
    expect(result).toBe(true);
  });
});
```

## License

MIT