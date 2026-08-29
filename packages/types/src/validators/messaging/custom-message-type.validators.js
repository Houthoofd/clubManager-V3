import { z } from "zod";
import { CUSTOM_MESSAGE_TYPE_NAME_MAX_LENGTH, CUSTOM_MESSAGE_TYPE_NAME_MIN_LENGTH, CUSTOM_MESSAGE_TYPE_DESCRIPTION_MAX_LENGTH, } from "../../constants/messaging.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const customMessageTypeBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .trim()
        .min(CUSTOM_MESSAGE_TYPE_NAME_MIN_LENGTH, {
        message: `Le nom doit contenir au moins ${CUSTOM_MESSAGE_TYPE_NAME_MIN_LENGTH} caractère`,
    })
        .max(CUSTOM_MESSAGE_TYPE_NAME_MAX_LENGTH, {
        message: `Le nom ne peut pas dépasser ${CUSTOM_MESSAGE_TYPE_NAME_MAX_LENGTH} caractères`,
    }),
    description: z
        .string()
        .trim()
        .max(CUSTOM_MESSAGE_TYPE_DESCRIPTION_MAX_LENGTH, {
        message: `La description ne peut pas dépasser ${CUSTOM_MESSAGE_TYPE_DESCRIPTION_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    actif: z.boolean().default(true),
});
export const createCustomMessageTypeSchema = customMessageTypeBaseSchema.pick({
    nom: true,
    description: true,
    actif: true,
});
export const updateCustomMessageTypeSchema = customMessageTypeBaseSchema
    .pick({
    nom: true,
    description: true,
    actif: true,
})
    .partial();
export const listCustomMessageTypesSchema = paginationSchema.extend({
    actif: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    search: z.string().trim().optional(),
    sort_by: z.enum(["nom", "actif"]).default("nom"),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
});
export const activeCustomMessageTypesSchema = z.object({
    sort_by: z.enum(["nom"]).default("nom"),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
});
export const customMessageTypeIdSchema = idSchema;
export const customMessageTypeIdStringSchema = idStringSchema;
export const customMessageTypeIdParamSchema = z.object({
    id: customMessageTypeIdStringSchema,
});
export const customMessageTypeResponseSchema = customMessageTypeBaseSchema;
export const customMessageTypesListResponseSchema = z.object({
    data: z.array(customMessageTypeResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const customMessageTypeStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    inactive: z.number().int().nonnegative(),
    templates_count: z.record(z.number().int().nonnegative()),
});
//# sourceMappingURL=custom-message-type.validators.js.map