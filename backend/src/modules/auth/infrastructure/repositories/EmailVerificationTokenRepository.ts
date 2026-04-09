/**
 * Email Verification Token Repository
 * @module auth/infrastructure/repositories/EmailVerificationTokenRepository
 */

import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "@/core/database/connection.js";
import { EmailVerificationToken } from "@clubmanager/types";

/**
 * Repository for email verification tokens
 */
export class EmailVerificationTokenRepository {
  /**
   * Create a new email verification token
   */
  async create(data: {
    userId: number;
    hashedToken: string;
    email: string;
    expiresAt: Date;
  }): Promise<number> {
    const query = `
      INSERT INTO email_verification_tokens (
        user_id,
        token,
        email,
        expires_at
      ) VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.userId,
      data.hashedToken,
      data.email,
      data.expiresAt,
    ]);

    return result.insertId;
  }

  /**
   * Find a verification token by hashed token string
   */
  async findByToken(
    hashedToken: string,
  ): Promise<EmailVerificationToken | null> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        created_at as createdAt
      FROM email_verification_tokens
      WHERE token = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [hashedToken]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as EmailVerificationToken;
  }

  /**
   * Find the latest pending verification token for a user by email
   */
  async findPendingByEmail(
    email: string,
  ): Promise<EmailVerificationToken | null> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        created_at as createdAt
      FROM email_verification_tokens
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

    return rows[0] as EmailVerificationToken;
  }

  /**
   * Find the latest pending verification token for a user by user ID
   */
  async findPendingByUserId(
    userId: number,
  ): Promise<EmailVerificationToken | null> {
    const query = `
      SELECT
        id,
        user_id as userId,
        token,
        email,
        expires_at as expiresAt,
        used_at as usedAt,
        created_at as createdAt
      FROM email_verification_tokens
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

    return rows[0] as EmailVerificationToken;
  }

  /**
   * Mark a token as used
   */
  async markAsUsed(tokenId: number): Promise<void> {
    const query = `
      UPDATE email_verification_tokens
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
      DELETE FROM email_verification_tokens
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
      DELETE FROM email_verification_tokens
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
      DELETE FROM email_verification_tokens
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
      UPDATE email_verification_tokens
      SET used_at = NOW()
      WHERE user_id = ?
        AND used_at IS NULL
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [userId]);
    return result.affectedRows;
  }

  /**
   * Check if a user has any pending verification tokens
   */
  async hasPendingToken(userId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM email_verification_tokens
      WHERE user_id = ?
        AND used_at IS NULL
        AND expires_at > NOW()
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);
    return (rows[0]?.count ?? 0) > 0;
  }
}
