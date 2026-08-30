import { z } from "zod";
import { EMAIL_REGEX, VALIDATION_CONSTANTS, VALIDATION_ERRORS, } from "../../constants/validation.constants.js";
import { ageValidationSchema, idSchema, userIdSchema, } from "../common/common.validators.js";
const emailSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.EMAIL.MIN_LENGTH, VALIDATION_ERRORS.INVALID_EMAIL)
    .max(VALIDATION_CONSTANTS.USER.EMAIL.MAX_LENGTH, `L'email ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.EMAIL.MAX_LENGTH} caractères`)
    .regex(EMAIL_REGEX, VALIDATION_ERRORS.INVALID_EMAIL)
    .email(VALIDATION_ERRORS.INVALID_EMAIL);
const passwordSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.PASSWORD.MIN_LENGTH, VALIDATION_ERRORS.INVALID_PASSWORD)
    .max(VALIDATION_CONSTANTS.USER.PASSWORD.MAX_LENGTH, `Le mot de passe ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.PASSWORD.MAX_LENGTH} caractères`);
const nameSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.NAME.MIN_LENGTH, `Le nom doit contenir au moins ${VALIDATION_CONSTANTS.USER.NAME.MIN_LENGTH} caractères`)
    .max(VALIDATION_CONSTANTS.USER.NAME.MAX_LENGTH, `Le nom ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.NAME.MAX_LENGTH} caractères`);
const usernameSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.USERNAME.MIN_LENGTH, `Le nom d'utilisateur doit contenir au moins ${VALIDATION_CONSTANTS.USER.USERNAME.MIN_LENGTH} caractères`)
    .max(VALIDATION_CONSTANTS.USER.USERNAME.MAX_LENGTH, `Le nom d'utilisateur ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.USERNAME.MAX_LENGTH} caractères`);
const tokenSchema = z
    .string()
    .min(32, "Le token doit contenir au moins 32 caractères")
    .max(255, "Le token ne peut pas dépasser 255 caractères");
export const loginSchema = z.object({
    userId: userIdSchema,
    password: passwordSchema,
});
export const loginByUserIdSchema = z.object({
    userId: userIdSchema,
    password: passwordSchema,
});
export const registerSchema = z.object({
    first_name: nameSchema,
    last_name: nameSchema,
    nom_utilisateur: usernameSchema.optional(),
    email: emailSchema,
    password: passwordSchema,
    date_of_birth: ageValidationSchema,
    genre_id: idSchema,
    abonnement_id: idSchema.optional(),
});
export const registerWithConfirmSchema = registerSchema
    .extend({
    confirmPassword: passwordSchema,
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
export const validateEmailTokenSchema = z.object({
    token: tokenSchema,
    userId: userIdSchema,
});
export const passwordResetRequestSchema = z.object({
    email: emailSchema,
});
export const passwordResetSchema = z.object({
    token: tokenSchema,
    newPassword: passwordSchema,
});
export const passwordResetWithConfirmSchema = z
    .object({
    token: tokenSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
export const changePasswordSchema = z
    .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
})
    .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ["newPassword"],
});
export const searchUserByEmailSchema = z.object({
    email: emailSchema,
});
export const verifyUserExistsSchema = z.object({
    nom: nameSchema,
    prenom: nameSchema,
    date_naissance: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_ERRORS.INVALID_DATE),
});
export const refreshTokenSchema = z.object({
    refreshToken: tokenSchema,
});
export const verifyJwtSchema = z.object({
    token: z.string().min(1, "Le token est requis"),
});
export const logoutSchema = z.object({
    token: z.string().optional(),
});
export const resendEmailValidationSchema = z.object({
    email: emailSchema,
});
//# sourceMappingURL=auth.validators.js.map