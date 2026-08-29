import { z } from "zod";
import { DATE_ISO_REGEX, VALIDATION_CONSTANTS, VALIDATION_ERRORS, } from "../../constants/validation.constants.js";
export const idSchema = z.number().int().positive({
    message: "L'ID doit être un nombre positif",
});
export const idStringSchema = z
    .string()
    .regex(/^\d+$/, "L'ID doit être un nombre")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, {
    message: "L'ID doit être un nombre positif",
});
export const userIdSchema = z
    .string()
    .regex(/^U-\d{4}-\d{4}$/, "Format userId invalide (attendu: U-YYYY-XXXX)");
export const dateISOSchema = z
    .string()
    .regex(DATE_ISO_REGEX, VALIDATION_ERRORS.INVALID_DATE);
export const dateISOOptionalSchema = dateISOSchema.optional();
export const dateSchema = z.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
});
export const dateOptionalSchema = dateSchema.optional().nullable();
export const timestampSchema = z.date({
    required_error: "Le timestamp est requis",
    invalid_type_error: "Format de timestamp invalide",
});
export const pastDateSchema = z
    .string()
    .regex(DATE_ISO_REGEX, VALIDATION_ERRORS.INVALID_DATE)
    .refine((date) => {
    const inputDate = new Date(date);
    return inputDate < new Date();
}, { message: "La date doit être dans le passé" });
export const futureDateSchema = z
    .string()
    .regex(DATE_ISO_REGEX, VALIDATION_ERRORS.INVALID_DATE)
    .refine((date) => {
    const inputDate = new Date(date);
    return inputDate > new Date();
}, { message: "La date doit être dans le futur" });
export const ageValidationSchema = z
    .string()
    .regex(DATE_ISO_REGEX, VALIDATION_ERRORS.INVALID_DATE)
    .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return (age - 1 >= VALIDATION_CONSTANTS.USER.AGE.MIN &&
            age - 1 <= VALIDATION_CONSTANTS.USER.AGE.MAX);
    }
    return (age >= VALIDATION_CONSTANTS.USER.AGE.MIN &&
        age <= VALIDATION_CONSTANTS.USER.AGE.MAX);
}, {
    message: `L'âge doit être entre ${VALIDATION_CONSTANTS.USER.AGE.MIN} et ${VALIDATION_CONSTANTS.USER.AGE.MAX} ans`,
});
export const paginationSchema = z.object({
    page: z
        .number()
        .int()
        .positive()
        .optional()
        .default(VALIDATION_CONSTANTS.PAGINATION.DEFAULT_PAGE),
    limit: z
        .number()
        .int()
        .positive()
        .max(VALIDATION_CONSTANTS.PAGINATION.MAX_LIMIT, `La limite maximale est de ${VALIDATION_CONSTANTS.PAGINATION.MAX_LIMIT} éléments`)
        .optional()
        .default(VALIDATION_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
});
export const paginationQuerySchema = z.object({
    page: z
        .string()
        .regex(/^\d+$/, "Le numéro de page doit être un nombre")
        .transform((val) => parseInt(val, 10))
        .default(String(VALIDATION_CONSTANTS.PAGINATION.DEFAULT_PAGE))
        .optional(),
    limit: z
        .string()
        .regex(/^\d+$/, "La limite doit être un nombre")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val <= VALIDATION_CONSTANTS.PAGINATION.MAX_LIMIT, {
        message: `La limite maximale est de ${VALIDATION_CONSTANTS.PAGINATION.MAX_LIMIT} éléments`,
    })
        .default(String(VALIDATION_CONSTANTS.PAGINATION.DEFAULT_LIMIT))
        .optional(),
});
export const booleanSchema = z
    .union([z.boolean(), z.string()])
    .transform((val) => {
    if (typeof val === "boolean")
        return val;
    return val === "true" || val === "1";
});
export const idsArraySchema = z
    .array(idSchema)
    .min(1, "Au moins un ID est requis");
export const searchQuerySchema = z
    .string()
    .min(1, "Le terme de recherche ne peut pas être vide")
    .max(100, "Le terme de recherche est trop long (max 100 caractères)")
    .optional();
export const sortOrderSchema = z.enum(["asc", "desc"], {
    errorMap: () => ({
        message: "L'ordre doit être 'asc' ou 'desc'",
    }),
});
export const idParamSchema = z.object({
    id: idStringSchema,
});
export const userIdParamSchema = z.object({
    userId: userIdSchema,
});
//# sourceMappingURL=common.validators.js.map