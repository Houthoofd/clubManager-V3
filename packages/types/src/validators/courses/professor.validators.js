import { z } from "zod";
import { EMAIL_REGEX, NAME_REGEX, PHONE_REGEX, VALIDATION_CONSTANTS, VALIDATION_ERRORS, } from "../../constants/validation.constants.js";
import { booleanSchema, idSchema, paginationSchema, searchQuerySchema, sortOrderSchema, } from "../common/common.validators.js";
const nameSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.NAME.MIN_LENGTH, `Le nom doit contenir au moins ${VALIDATION_CONSTANTS.USER.NAME.MIN_LENGTH} caractères`)
    .max(VALIDATION_CONSTANTS.USER.NAME.MAX_LENGTH, `Le nom ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.NAME.MAX_LENGTH} caractères`)
    .regex(NAME_REGEX, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes");
const emailSchema = z
    .string()
    .min(VALIDATION_CONSTANTS.USER.EMAIL.MIN_LENGTH, VALIDATION_ERRORS.INVALID_EMAIL)
    .max(VALIDATION_CONSTANTS.USER.EMAIL.MAX_LENGTH, `L'email ne peut pas dépasser ${VALIDATION_CONSTANTS.USER.EMAIL.MAX_LENGTH} caractères`)
    .regex(EMAIL_REGEX, VALIDATION_ERRORS.INVALID_EMAIL)
    .email(VALIDATION_ERRORS.INVALID_EMAIL)
    .optional();
const phoneSchema = z
    .string()
    .regex(PHONE_REGEX, VALIDATION_ERRORS.INVALID_PHONE)
    .optional();
const specialiteSchema = z
    .string()
    .min(1, "La spécialité doit contenir au moins 1 caractère")
    .max(100, "La spécialité ne peut pas dépasser 100 caractères")
    .optional();
const photoUrlSchema = z
    .string()
    .url("L'URL de la photo doit être valide")
    .max(255, "L'URL de la photo ne peut pas dépasser 255 caractères")
    .optional();
export const createProfessorSchema = z.object({
    nom: nameSchema,
    prenom: nameSchema,
    email: emailSchema,
    telephone: phoneSchema,
    specialite: specialiteSchema,
    grade_id: idSchema.optional().nullable(),
    photo_url: photoUrlSchema,
    actif: z.boolean().default(true),
});
export const updateProfessorSchema = z.object({
    id: idSchema,
    nom: nameSchema.optional(),
    prenom: nameSchema.optional(),
    email: emailSchema,
    telephone: phoneSchema,
    specialite: specialiteSchema,
    grade_id: idSchema.optional().nullable(),
    photo_url: photoUrlSchema,
    actif: z.boolean().optional(),
});
export const searchProfessorSchema = z
    .object({
    nom: searchQuerySchema,
    prenom: searchQuerySchema,
    email: searchQuerySchema,
    specialite: searchQuerySchema,
    actif: booleanSchema.optional(),
    grade_id: idSchema.optional(),
    sort_by: z
        .enum(["nom", "prenom", "email", "specialite", "created_at"], {
        errorMap: () => ({
            message: "Le tri doit être par 'nom', 'prenom', 'email', 'specialite' ou 'created_at'",
        }),
    })
        .default("nom")
        .optional(),
    sort_order: sortOrderSchema.default("asc").optional(),
})
    .merge(paginationSchema);
export const toggleProfessorSchema = z.object({
    id: idSchema,
    actif: z.boolean(),
});
export const getProfessorCoursesSchema = z.object({
    professeur_id: idSchema,
    date_debut: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format ISO (YYYY-MM-DD)")
        .optional(),
    date_fin: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format ISO (YYYY-MM-DD)")
        .optional(),
});
//# sourceMappingURL=professor.validators.js.map