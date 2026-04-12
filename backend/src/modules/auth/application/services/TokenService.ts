/**
 * Token Service
 * @module auth/application/services/TokenService
 *
 * Service for generating and validating email verification and password reset tokens.
 * Tokens are generated using crypto.randomBytes and hashed with SHA-256 before storage.
 */

import crypto from "crypto";
import {
  EmailVerificationToken,
  PasswordResetToken,
  TokenValidationResult,
  TokenGenerationOptions,
} from "@clubmanager/types";
import { EmailVerificationTokenRepository } from "../../infrastructure/repositories/EmailVerificationTokenRepository.js";
import { PasswordResetTokenRepository } from "../../infrastructure/repositories/PasswordResetTokenRepository.js";

/**
 * Default token expiration times (in hours)
 */
const DEFAULT_EMAIL_VERIFICATION_EXPIRY_HOURS = 24; // 24 hours
const DEFAULT_PASSWORD_RESET_EXPIRY_HOURS = 1; // 1 hour

/**
 * Default token length (before hashing)
 */
const DEFAULT_TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters

/**
 * Token Service
 */
export class TokenService {
  private emailVerificationTokenRepo: EmailVerificationTokenRepository;
  private passwordResetTokenRepo: PasswordResetTokenRepository;

  constructor() {
    this.emailVerificationTokenRepo = new EmailVerificationTokenRepository();
    this.passwordResetTokenRepo = new PasswordResetTokenRepository();
  }

  // ============================================================
  // Token Generation
  // ============================================================

  /**
   * Generate a random token string
   */
  private generateRandomToken(length: number = DEFAULT_TOKEN_LENGTH): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Hash a token using SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Calculate expiration date
   */
  private calculateExpiry(hours: number): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
  }

  // ============================================================
  // Email Verification Tokens
  // ============================================================

  /**
   * Generate and store an email verification token
   *
   * @returns Plain token (to send in email) and token ID
   */
  async generateEmailVerificationToken(
    userId: number,
    email: string,
    options?: TokenGenerationOptions,
  ): Promise<{ token: string; tokenId: number; expiresAt: Date }> {
    // Generate random token
    const plainToken = this.generateRandomToken(options?.length);

    // Hash token for storage
    const hashedToken = this.hashToken(plainToken);

    // Calculate expiry
    const expiresAt = this.calculateExpiry(
      options?.expiresInHours || DEFAULT_EMAIL_VERIFICATION_EXPIRY_HOURS,
    );

    // Invalidate any existing tokens for this user
    await this.emailVerificationTokenRepo.invalidateUserTokens(userId);

    // Store hashed token
    const tokenId = await this.emailVerificationTokenRepo.create({
      userId,
      hashedToken,
      email,
      expiresAt,
    });

    return {
      token: plainToken,
      tokenId,
      expiresAt,
    };
  }

  /**
   * Validate an email verification token
   */
  async validateEmailVerificationToken(
    plainToken: string,
  ): Promise<TokenValidationResult> {
    // Hash the token to look it up
    const hashedToken = this.hashToken(plainToken);

    // Find token in database
    const token =
      await this.emailVerificationTokenRepo.findByToken(hashedToken);

    if (!token) {
      return {
        valid: false,
        error: "TOKEN_NOT_FOUND",
      };
    }

    // Check if already used
    if (token.usedAt) {
      return {
        valid: false,
        error: "TOKEN_ALREADY_USED",
      };
    }

    // Check if expired
    if (new Date() > new Date(token.expiresAt)) {
      return {
        valid: false,
        error: "TOKEN_EXPIRED",
      };
    }

    return {
      valid: true,
      token,
    };
  }

  /**
   * Mark email verification token as used
   */
  async markEmailVerificationTokenAsUsed(tokenId: number): Promise<void> {
    await this.emailVerificationTokenRepo.markAsUsed(tokenId);
  }

  /**
   * Get pending email verification token for a user
   */
  async getPendingEmailVerificationToken(
    userId: number,
  ): Promise<EmailVerificationToken | null> {
    return this.emailVerificationTokenRepo.findPendingByUserId(userId);
  }

  // ============================================================
  // Password Reset Tokens
  // ============================================================

  /**
   * Generate and store a password reset token
   *
   * @returns Plain token (to send in email) and token ID
   */
  async generatePasswordResetToken(
    userId: number,
    email: string,
    ipAddress?: string,
    userAgent?: string,
    options?: TokenGenerationOptions,
  ): Promise<{ token: string; tokenId: number; expiresAt: Date }> {
    // Generate random token
    const plainToken = this.generateRandomToken(options?.length);

    // Hash token for storage
    const hashedToken = this.hashToken(plainToken);

    // Calculate expiry
    const expiresAt = this.calculateExpiry(
      options?.expiresInHours || DEFAULT_PASSWORD_RESET_EXPIRY_HOURS,
    );

    // Invalidate any existing tokens for this user
    await this.passwordResetTokenRepo.invalidateUserTokens(userId);

    // Store hashed token
    const tokenId = await this.passwordResetTokenRepo.create({
      userId,
      hashedToken,
      email,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return {
      token: plainToken,
      tokenId,
      expiresAt,
    };
  }

  /**
   * Validate a password reset token
   */
  async validatePasswordResetToken(
    plainToken: string,
  ): Promise<TokenValidationResult> {
    // Hash the token to look it up
    const hashedToken = this.hashToken(plainToken);

    // Find token in database
    const token = await this.passwordResetTokenRepo.findByToken(hashedToken);

    if (!token) {
      return {
        valid: false,
        error: "TOKEN_NOT_FOUND",
      };
    }

    // Check if already used
    if (token.usedAt) {
      return {
        valid: false,
        error: "TOKEN_ALREADY_USED",
      };
    }

    // Check if expired
    if (new Date() > new Date(token.expiresAt)) {
      return {
        valid: false,
        error: "TOKEN_EXPIRED",
      };
    }

    return {
      valid: true,
      token,
    };
  }

  /**
   * Mark password reset token as used
   */
  async markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
    await this.passwordResetTokenRepo.markAsUsed(tokenId);
  }

  /**
   * Get pending password reset token for a user
   */
  async getPendingPasswordResetToken(
    userId: number,
  ): Promise<PasswordResetToken | null> {
    return this.passwordResetTokenRepo.findPendingByUserId(userId);
  }

  /**
   * Check rate limiting for password reset requests
   * Returns true if user is within rate limits
   */
  async checkPasswordResetRateLimit(
    email: string,
    maxAttempts: number = 3,
    windowMinutes: number = 15,
  ): Promise<{ allowed: boolean; attemptsCount: number; resetAt?: Date }> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - windowMinutes);

    const attempts = await this.passwordResetTokenRepo.getRecentAttemptsByEmail(
      email,
      since,
    );

    const attemptsCount = attempts.length;
    const allowed = attemptsCount < maxAttempts;

    if (!allowed && attempts.length > 0) {
      // Calculate when the oldest attempt will expire
      const oldestAttempt = attempts[attempts.length - 1];
      if (oldestAttempt) {
        const resetAt = new Date(oldestAttempt.createdAt);
        resetAt.setMinutes(resetAt.getMinutes() + windowMinutes);

        return {
          allowed: false,
          attemptsCount,
          resetAt,
        };
      }
    }

    return {
      allowed: true,
      attemptsCount,
    };
  }

  /**
   * Check rate limiting by IP address
   */
  async checkIpAddressRateLimit(
    ipAddress: string,
    maxAttempts: number = 10,
    windowMinutes: number = 60,
  ): Promise<{ allowed: boolean; attemptsCount: number }> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - windowMinutes);

    const attemptsCount =
      await this.passwordResetTokenRepo.countAttemptsByIpAddress(
        ipAddress,
        since,
      );

    return {
      allowed: attemptsCount < maxAttempts,
      attemptsCount,
    };
  }

  // ============================================================
  // Cleanup
  // ============================================================

  /**
   * Clean up expired email verification tokens
   */
  async cleanupExpiredEmailVerificationTokens(
    olderThanDays: number = 7,
  ): Promise<number> {
    const olderThan = new Date();
    olderThan.setDate(olderThan.getDate() - olderThanDays);

    return this.emailVerificationTokenRepo.deleteExpiredTokens(olderThan);
  }

  /**
   * Clean up expired password reset tokens
   */
  async cleanupExpiredPasswordResetTokens(
    olderThanDays: number = 7,
  ): Promise<number> {
    const olderThan = new Date();
    olderThan.setDate(olderThan.getDate() - olderThanDays);

    return this.passwordResetTokenRepo.deleteExpiredTokens(olderThan);
  }
}
