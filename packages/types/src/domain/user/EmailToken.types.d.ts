export interface EmailVerificationToken {
    id: number;
    userId: number;
    token: string;
    email: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}
export interface CreateEmailVerificationTokenDTO {
    userId: number;
    email: string;
}
export interface VerifyEmailDTO {
    token: string;
}
export interface ResendVerificationEmailDTO {
    email: string;
}
export interface EmailVerificationResponse {
    success: boolean;
    message: string;
    emailVerified?: boolean;
}
export interface PasswordResetToken {
    id: number;
    userId: number;
    token: string;
    email: string;
    expiresAt: Date;
    usedAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}
export interface CreatePasswordResetTokenDTO {
    userId: number;
    email: string;
    ipAddress?: string;
    userAgent?: string;
}
export interface RequestPasswordResetDTO {
    email: string;
}
export interface ResetPasswordDTO {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export interface PasswordResetResponse {
    success: boolean;
    message: string;
}
export interface VerificationEmailData {
    firstName: string;
    verificationUrl: string;
    expiresInHours: number;
}
export interface PasswordResetEmailData {
    firstName: string;
    resetUrl: string;
    expiresInHours: number;
    ipAddress?: string;
}
export interface PasswordChangedEmailData {
    firstName: string;
    changedAt: Date;
    ipAddress?: string;
}
export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface TokenValidationResult {
    valid: boolean;
    token?: EmailVerificationToken | PasswordResetToken;
    error?: 'TOKEN_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_ALREADY_USED';
}
export interface TokenGenerationOptions {
    length?: number;
    expiresInHours?: number;
}
//# sourceMappingURL=EmailToken.types.d.ts.map