/**
 * Email Verification & Password Reset Validators
 * @module validators/users/email.validators
 */

import { z } from 'zod';

// ============================================================
// Email Verification Validators
// ============================================================

/**
 * Verify Email Schema
 */
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Le token de vérification est requis')
    .max(500, 'Le token de vérification est invalide'),
});

/**
 * Resend Verification Email Schema
 */
export const resendVerificationEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est requise')
    .email('Format d\'email invalide')
    .max(255, 'L\'adresse email est trop longue')
    .toLowerCase()
    .trim(),
});

// ============================================================
// Password Reset Validators
// ============================================================

/**
 * Request Password Reset Schema
 */
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse email est requise')
    .email('Format d\'email invalide')
    .max(255, 'L\'adresse email est trop longue')
    .toLowerCase()
    .trim(),
});

/**
 * Reset Password Schema
 * Validates token and new password with confirmation
 */
export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, 'Le token de réinitialisation est requis')
      .max(500, 'Le token de réinitialisation est invalide'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(72, 'Le mot de passe ne peut pas dépasser 72 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#)'
      ),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// ============================================================
// Type Exports
// ============================================================

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
