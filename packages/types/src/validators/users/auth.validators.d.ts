import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    userId: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    userId: string;
}, {
    password: string;
    userId: string;
}>;
export declare const loginByUserIdSchema: z.ZodObject<{
    userId: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    userId: string;
}, {
    password: string;
    userId: string;
}>;
export declare const registerSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    nom_utilisateur: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
    date_of_birth: z.ZodEffects<z.ZodString, string, string>;
    genre_id: z.ZodNumber;
    abonnement_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    abonnement_id?: number | undefined;
}, {
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    abonnement_id?: number | undefined;
}>;
export declare const registerWithConfirmSchema: z.ZodEffects<z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    nom_utilisateur: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
    date_of_birth: z.ZodEffects<z.ZodString, string, string>;
    genre_id: z.ZodNumber;
    abonnement_id: z.ZodOptional<z.ZodNumber>;
} & {
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    abonnement_id?: number | undefined;
}, {
    password: string;
    email: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    abonnement_id?: number | undefined;
}>, {
    password: string;
    email: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    abonnement_id?: number | undefined;
}, {
    password: string;
    email: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    abonnement_id?: number | undefined;
}>;
export declare const validateEmailTokenSchema: z.ZodObject<{
    token: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    token: string;
}, {
    userId: string;
    token: string;
}>;
export declare const passwordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const passwordResetSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export declare const passwordResetWithConfirmSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    oldPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
}, {
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
}>, {
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
}, {
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
}>, {
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
}, {
    newPassword: string;
    confirmPassword: string;
    oldPassword: string;
}>;
export declare const searchUserByEmailSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const verifyUserExistsSchema: z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    date_naissance: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nom: string;
    prenom: string;
    date_naissance: string;
}, {
    nom: string;
    prenom: string;
    date_naissance: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const verifyJwtSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const logoutSchema: z.ZodObject<{
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token?: string | undefined;
}, {
    token?: string | undefined;
}>;
export declare const resendEmailValidationSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginByUserIdInput = z.infer<typeof loginByUserIdSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterWithConfirmInput = z.infer<typeof registerWithConfirmSchema>;
export type ValidateEmailTokenInput = z.infer<typeof validateEmailTokenSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordResetWithConfirmInput = z.infer<typeof passwordResetWithConfirmSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SearchUserByEmailInput = z.infer<typeof searchUserByEmailSchema>;
export type VerifyUserExistsInput = z.infer<typeof verifyUserExistsSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type VerifyJwtInput = z.infer<typeof verifyJwtSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type ResendEmailValidationInput = z.infer<typeof resendEmailValidationSchema>;
//# sourceMappingURL=auth.validators.d.ts.map