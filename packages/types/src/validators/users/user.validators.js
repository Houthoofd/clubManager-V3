import { z } from "zod";
import { EMAIL_REGEX, HASHED_PASSWORD_REGEX, NAME_REGEX, PHONE_REGEX, USERNAME_REGEX, VALIDATION_CONSTANTS, VALIDATION_ERRORS, } from "../../constants/validation.constants.js";
import { ageValidationSchema, idSchema, } from "../common/common.validators.js";
const usernameSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.USERNAME.MIN_LENGTH, `Le nom d'utilisateur doit contenir au moins ${VALIDATION_CONSTANTS.USER.USERNAME.MIN_LENGTH} caractères`)
    .max(VALIDATION_CONSTANTS.USER.USERNAME.MAX_LENGTH, `Le nom d'utilisateur ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.USERNAME.MAX_LENGTH} caractères`)
    .regex(USERNAME_REGEX, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores");
const emailSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.EMAIL.MIN_LENGTH, VALIDATION_ERRORS.INVALID_EMAIL)
    .max(VALIDATION_CONSTANTS.USER.EMAIL.MAX_LENGTH, `L'email ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.EMAIL.MAX_LENGTH} caractères`)
    .regex(EMAIL_REGEX, VALIDATION_ERRORS.INVALID_EMAIL)
    .email(VALIDATION_ERRORS.INVALID_EMAIL);
const passwordSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.PASSWORD.MIN_LENGTH, `Le mot de passe doit contenir au moins ${VALIDATION_CONSTANTS.USER.PASSWORD.MIN_LENGTH} caractères`)
    .max(VALIDATION_CONSTANTS.USER.PASSWORD.MAX_LENGTH, `Le mot de passe ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.PASSWORD.MAX_LENGTH} caractères`);
const hashedPasswordSchema = z
    .string()
    .regex(HASHED_PASSWORD_REGEX, "Le mot de passe doit être hashé avec bcrypt ou argon2");
const nameSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.NAME.MIN_LENGTH, `Le nom doit contenir au moins ${VALIDATION_CONSTANTS.USER.NAME.MIN_LENGTH} caractères`)
    .max(VALIDATION_CONSTANTS.USER.NAME.MAX_LENGTH, `Le nom ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.NAME.MAX_LENGTH} caractères`)
    .regex(NAME_REGEX, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes");
const phoneSchema = z
    .string()
    .regex(PHONE_REGEX, VALIDATION_ERRORS.INVALID_PHONE)
    .optional();
const addressSchema = z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(255, "L'adresse ne peut pas dépasser 255 caractères")
    .optional();
export const createUserSchema = z.object({
    first_name: nameSchema,
    last_name: nameSchema,
    nom_utilisateur: usernameSchema.optional(),
    email: emailSchema,
    password: passwordSchema,
    date_of_birth: ageValidationSchema,
    telephone: phoneSchema,
    adresse: addressSchema,
    genre_id: idSchema,
    grade_id: idSchema.optional(),
    abonnement_id: idSchema.optional(),
    status_id: idSchema.optional(),
});
export const updateUserSchema = z.object({
    id: idSchema,
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    nom_utilisateur: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    date_of_birth: ageValidationSchema.optional(),
    telephone: phoneSchema,
    adresse: addressSchema,
    genre_id: idSchema.optional(),
    grade_id: idSchema.optional().nullable(),
    abonnement_id: idSchema.optional().nullable(),
    status_id: idSchema.optional(),
});
export const softDeleteUserSchema = z.object({
    userId: idSchema,
    deletedBy: idSchema,
    reason: z
        .string()
        .min(VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MIN_LENGTH, `La raison doit contenir au moins ${VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MIN_LENGTH} caractères`)
        .max(VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MAX_LENGTH, `La raison ne peut pas dépasser ${VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MAX_LENGTH} caractères`),
});
export const restoreUserSchema = z.object({
    userId: idSchema,
    restoredBy: idSchema,
});
export const updatePasswordSchema = z.object({
    userId: idSchema,
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
});
export const updateEmailSchema = z.object({
    userId: idSchema,
    newEmail: emailSchema,
});
export const updateProfileSchema = z.object({
    userId: idSchema,
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    telephone: phoneSchema,
    adresse: addressSchema,
    photo_url: z
        .string()
        .url("L'URL de la photo doit être valide")
        .max(255, "L'URL de la photo ne peut pas dépasser 255 caractères")
        .optional(),
});
export const anonymizeUserSchema = z.object({
    userId: idSchema,
    anonymizedBy: idSchema,
    reason: z
        .string()
        .min(VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MIN_LENGTH, `La raison doit contenir au moins ${VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MIN_LENGTH} caractères`)
        .max(VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MAX_LENGTH, `La raison ne peut pas dépasser ${VALIDATION_CONSTANTS.RGPD.DELETION_REASON_MAX_LENGTH} caractères`),
});
//# sourceMappingURL=user.validators.js.map