import { z } from "zod";
import { STATUS_NAME_MAX_LENGTH, STATUS_NAME_MIN_LENGTH, STATUS_DESCRIPTION_MAX_LENGTH, LOOKUP_DEFAULT_SORT_ORDER, } from "../../constants/lookup.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const statusBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .trim()
        .min(STATUS_NAME_MIN_LENGTH, {
        message: `Le nom doit contenir au moins ${STATUS_NAME_MIN_LENGTH} caractère`,
    })
        .max(STATUS_NAME_MAX_LENGTH, {
        message: `Le nom ne peut pas dépasser ${STATUS_NAME_MAX_LENGTH} caractères`,
    }),
    description: z
        .string()
        .trim()
        .max(STATUS_DESCRIPTION_MAX_LENGTH, {
        message: `La description ne peut pas dépasser ${STATUS_DESCRIPTION_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
});
export const createStatusSchema = statusBaseSchema.pick({
    nom: true,
    description: true,
});
export const updateStatusSchema = statusBaseSchema
    .pick({
    nom: true,
    description: true,
})
    .partial();
export const listStatusesSchema = paginationSchema.extend({
    search: z.string().trim().optional(),
    has_description: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    sort_by: z.enum(["nom", "id"]).default("nom"),
    sort_order: z.enum(["asc", "desc"]).default(LOOKUP_DEFAULT_SORT_ORDER),
});
export const statusIdSchema = idSchema;
export const statusIdStringSchema = idStringSchema;
export const statusIdParamSchema = z.object({
    id: statusIdStringSchema,
});
export const statusResponseSchema = statusBaseSchema;
export const statusesListResponseSchema = z.object({
    data: z.array(statusResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const statusStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    with_description: z.number().int().nonnegative(),
    without_description: z.number().int().nonnegative(),
    usage_count: z.record(z.number().int().nonnegative()),
});
//# sourceMappingURL=status.validators.js.map