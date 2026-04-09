/**
 * Password Reset Token Repository
 * @module auth/infrastructure/repositories/PasswordResetTokenRepository
 */

import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "@/core/database/connection.js";
import { PasswordResetToken } from "@clubmanager/types";

/**
 * Repository for password reset tokens
 */
export class PasswordResetTokenRepository {
  /**
   * Create a new password reset token
   */
  async create(data: {
    userId: number;
    hashedToken: string;
    email: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<number> {
    const query = `
      INSERT INTO password_reset_tokens (
        user_id,
        token,
        email,
        expires_at,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.userId,
      data.hashedToken,
      data.email,
      data.expiresAt,
      data.ipAddress || null,
      data.userAgent || null,
    ]);

    return result.insertId;
  }

  /**
   * Find a reset token by hashed token string
   */
  async findByToken(hashedToken: string): Promise<PasswordResetToken | null> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        ip_address as ipAddress,
        user_agent as userAgent,
        created_at as createdAt
      FROM password_reset_tokens
      WHERE token = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [hashedToken]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as PasswordResetToken;
  }

  /**
   * Find the latest pending reset token for a user by email
   */
  async findPendingByEmail(email: string): Promise<PasswordResetToken | null> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        ip_address as ipAddress,
        user_agent as userAgent,
        created_at as createdAt
      FROM password_reset_tokens
      WHERE email = ?
        AND used_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as PasswordResetToken;
  }

  /**
   * Find the latest pending reset token for a user by user ID
   */
  async findPendingByUserId(
    userId: number,
  ): Promise<PasswordResetToken | null> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        ip_address as ipAddress,
        user_agent as userAgent,
        created_at as createdAt
      FROM password_reset_tokens
      WHERE user_id = ?
        AND used_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as PasswordResetToken;
  }

  /**
   * Get all reset attempts for a user within a time period
   * Useful for rate limiting
   */
  async getRecentAttemptsByEmail(
    email: string,
    since: Date,
  ): Promise<PasswordResetToken[]> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        ip_address as ipAddress,
        user_agent as userAgent,
        created_at as createdAt
      FROM password_reset_tokens
      WHERE email = ?
        AND created_at >= ?
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [email, since]);
    return rows as PasswordResetToken[];
  }

  /**
   * Count reset attempts from an IP address within a time period
   * Useful for rate limiting
   */
  async countAttemptsByIpAddress(
    ipAddress: string,
    since: Date,
  ): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM password_reset_tokens
      WHERE ip_address = ?
        AND created_at >= ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [
      ipAddress,
      since,
    ]);
    return rows[0]?.count ?? 0;
  }

  /**
   * Mark a token as used
   */
  async markAsUsed(tokenId: number): Promise<void> {
    const query = `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [tokenId]);
  }

  /**
   * Delete all expired tokens older than the specified date
   */
  async deleteExpiredTokens(olderThan: Date): Promise<number> {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE expires_at < ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [olderThan]);
    return result.affectedRows;
  }

  /**
   * Delete all tokens for a specific user
   */
  async deleteByUserId(userId: number): Promise<number> {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE user_id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [userId]);
    return result.affectedRows;
  }

  /**
   * Delete all tokens for a specific email
   */
  async deleteByEmail(email: string): Promise<number> {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE email = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [email]);
    return result.affectedRows;
  }

  /**
   * Invalidate all unused tokens for a user (soft delete by marking as used)
   */
  async invalidateUserTokens(userId: number): Promise<number> {
    const query = `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ?
        AND used_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [userId]);
    return result.affectedRows;
  }

  /**
   * Invalidate all unused tokens for an email
   */
  async invalidateEmailTokens(email: string): Promise<number> {
    const query = `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE email = ?
        AND used_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [email]);
    return result.affectedRows;
  }

  /**
   * Check if a user has any pending reset tokens
   */
  async hasPendingToken(userId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM password_reset_tokens
      WHERE user_id = ?
        AND used_at IS NULL
        AND expires_at > NOW()
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);
    return (rows[0]?.count ?? 0) > 0;
  }
}
