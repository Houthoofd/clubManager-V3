/**
 * Email Verification & Password Reset Token Types
 * @module domain/user/EmailToken.types
 */

// ============================================================
// Email Verification Token Types
// ============================================================

/**
 * Email Verification Token Entity (Database)
 */
export interface EmailVerificationToken {
  id: number;
  userId: number;
  token: string; // Hashed token (SHA-256)
  email: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

/**
 * Create Email Verification Token DTO
 */
export interface CreateEmailVerificationTokenDTO {
  userId: number;
  email: string;
}

/**
 * Verify Email DTO (from user)
 */
export interface VerifyEmailDTO {
  token: string;
}

/**
 * Resend Verification Email DTO
 */
export interface ResendVerificationEmailDTO {
  email: string;
}

/**
 * Email Verification Response
 */
export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  emailVerified?: boolean;
}

// ============================================================
// Password Reset Token Types
// ============================================================

/**
 * Password Reset Token Entity (Database)
 */
export interface PasswordResetToken {
  id: number;
  userId: number;
  token: string; // Hashed token (SHA-256)
  email: string;
  expiresAt: Date;
  usedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

/**
 * Create Password Reset Token DTO
 */
export interface CreatePasswordResetTokenDTO {
  userId: number;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Request Password Reset DTO (from user)
 */
export interface RequestPasswordResetDTO {
  email: string;
}

/**
 * Reset Password DTO (from user)
 */
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password Reset Response
 */
export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

// ============================================================
// Email Service Types
// ============================================================

/**
 * Email Template Data for Verification Email
 */
export interface VerificationEmailData {
  firstName: string;
  verificationUrl: string;
  expiresInHours: number;
}

/**
 * Email Template Data for Password Reset Email
 */
export interface PasswordResetEmailData {
  firstName: string;
  resetUrl: string;
  expiresInHours: number;
  ipAddress?: string;
}

/**
 * Email Template Data for Password Changed Confirmation
 */
export interface PasswordChangedEmailData {
  firstName: string;
  changedAt: Date;
  ipAddress?: string;
}

/**
 * Email Send Result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================================
// Token Validation Types
// ============================================================

/**
 * Token Validation Result
 */
export interface TokenValidationResult {
  valid: boolean;
  token?: EmailVerificationToken | PasswordResetToken;
  error?: 'TOKEN_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_ALREADY_USED';
}

/**
 * Token Generation Options
 */
export interface TokenGenerationOptions {
  length?: number; // Length of the random token (before hashing)
  expiresInHours?: number; // Expiration time in hours
}
