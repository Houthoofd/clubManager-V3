/**
 * dbHelpers.ts
 * Test utilities for integration tests — direct DB access, bypasses application layers.
 */

import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { JwtService } from '../../../src/shared/services/JwtService.js';
import { UserRole } from '@clubmanager/types';

const TEST_DB = 'clubmanager_test';

// ─── Connection pool (test-only, never used by the app) ──────────────────────

let _pool: Pool | null = null;

export function getTestPool(): Pool {
  if (!_pool) {
    _pool = mysql.createPool({
      host:               process.env.DB_HOST     || 'localhost',
      port:               parseInt(process.env.DB_PORT || '3306', 10),
      user:               process.env.DB_USER     || 'root',
      password:           process.env.DB_PASSWORD || '',
      database:           TEST_DB,
      connectionLimit:    5,
      waitForConnections: true,
    });
  }
  return _pool;
}

export async function closeTestPool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

// ─── Counter for unique test user generation ─────────────────────────────────

let _counter = 0;

function nextCounter(): number {
  return ++_counter;
}

export function resetUserCounter(): void {
  _counter = 0;
}

// ─── Table cleanup ────────────────────────────────────────────────────────────

/**
 * Truncates all auth-related tables in the correct order.
 * Safe to call in beforeEach.
 */
export async function truncateAuthTables(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE refresh_tokens');
    await conn.query('TRUNCATE TABLE email_validation_tokens');
    await conn.query('TRUNCATE TABLE password_reset_tokens');
    await conn.query('TRUNCATE TABLE password_reset_attempts');
    await conn.query('TRUNCATE TABLE login_attempts');
    await conn.query('TRUNCATE TABLE auth_attempts');
    await conn.query('TRUNCATE TABLE utilisateurs');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    resetUserCounter();
  } finally {
    conn.release();
  }
}

// ─── Test user factory ───────────────────────────────────────────────────────

export interface TestUser {
  id:       number;
  userId:   string;
  email:    string;
  /** Cleartext password — use this in HTTP request bodies */
  password: string;
}

export interface CreateTestUserOptions {
  email_verified?:    boolean;
  active?:            boolean;
  peut_se_connecter?: boolean;
  deleted_at?:        Date | null;
  anonymized?:        boolean;
  role_app?:          'admin' | 'member' | 'professor';
}

/**
 * Inserts a user directly into the test DB — bypasses use-cases and email sending.
 * Returns the cleartext password so tests can use it in HTTP login requests.
 */
export async function createTestUser(
  options: CreateTestUserOptions = {},
): Promise<TestUser> {
  const pool = getTestPool();
  const n         = nextCounter();
  const year      = new Date().getFullYear();
  const userId    = `U-${year}-${n.toString().padStart(4, '0')}`;
  const email     = `test${n}_${Date.now()}@integration.test`;
  const password  = `Test@${n}1234!Secure`;
  const hashed    = await bcrypt.hash(password, 10);

  const {
    email_verified    = true,
    active            = true,
    peut_se_connecter = true,
    deleted_at        = null,
    anonymized        = false,
    role_app          = 'member',
  } = options;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO utilisateurs
       (userId, first_name, last_name, nom_utilisateur, email, password,
        date_of_birth, genre_id, status_id, active, email_verified,
        peut_se_connecter, deleted_at, anonymized, role_app)
     VALUES (?, 'Test', 'User', ?, ?, ?, '1990-01-01', 1, 1, ?, ?, ?, ?, ?, ?)`,
    [
      userId, `testuser${n}`, email, hashed,
      active ? 1 : 0,
      email_verified ? 1 : 0,
      peut_se_connecter ? 1 : 0,
      deleted_at ?? null,
      anonymized ? 1 : 0,
      role_app,
    ],
  );

  return { id: result.insertId, userId, email, password };
}

// ─── Direct DB queries ───────────────────────────────────────────────────────

/**
 * Fetches a row from the utilisateurs table by email.
 * Useful to assert DB state after an HTTP call.
 */
export async function getUserByEmail(email: string): Promise<RowDataPacket | null> {
  const pool = getTestPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM utilisateurs WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0] ?? null;
}

/**
 * Counts the rows in refresh_tokens for a given user.
 */
export async function countRefreshTokens(userId: number): Promise<number> {
  const pool = getTestPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS cnt FROM refresh_tokens WHERE user_id = ? AND revoked = FALSE',
    [userId],
  );
  return (rows[0] as any).cnt as number;
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a valid access token for a test user (shorthand for tests).
 */
export function generateAccessToken(user: TestUser): string {
  return JwtService.generateAccessToken({
    userId:       user.id,
    email:        user.email,
    userIdString: user.userId,
    role_app:     UserRole.MEMBER,
  });
}
