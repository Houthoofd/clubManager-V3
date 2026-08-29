import { z } from "zod";
import { INFORMATION_KEY_MAX_LENGTH, INFORMATION_KEY_MIN_LENGTH, INFORMATION_VALUE_MAX_LENGTH, INFORMATION_VALUE_MIN_LENGTH, INFORMATION_DESCRIPTION_MAX_LENGTH, STATISTICS_DEFAULT_SORT_ORDER, } from "../../constants/statistics.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const informationBaseSchema = z.object({
    id: idSchema,
    cle: z
        .string()
        .trim()
        .min(INFORMATION_KEY_MIN_LENGTH, {
        message: `La clé doit contenir au moins ${INFORMATION_KEY_MIN_LENGTH} caractère`,
    })
        .max(INFORMATION_KEY_MAX_LENGTH, {
        message: `La clé ne peut pas dépasser ${INFORMATION_KEY_MAX_LENGTH} caractères`,
    }),
    valeur: z
        .string()
        .trim()
        .min(INFORMATION_VALUE_MIN_LENGTH, {
        message: `La valeur doit contenir au moins ${INFORMATION_VALUE_MIN_LENGTH} caractère`,
    })
        .max(INFORMATION_VALUE_MAX_LENGTH, {
        message: `La valeur ne peut pas dépasser ${INFORMATION_VALUE_MAX_LENGTH} caractères`,
    }),
    description: z
        .string()
        .trim()
        .max(INFORMATION_DESCRIPTION_MAX_LENGTH, {
        message: `La description ne peut pas dépasser ${INFORMATION_DESCRIPTION_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    updated_at: z.coerce.date().nullable().optional(),
});
export const createInformationSchema = informationBaseSchema.pick({
    cle: true,
    valeur: true,
    description: true,
});
export const updateInformationSchema = z.object({
    valeur: z
        .string()
        .trim()
        .min(INFORMATION_VALUE_MIN_LENGTH)
        .max(INFORMATION_VALUE_MAX_LENGTH)
        .optional(),
    description: z
        .string()
        .trim()
        .max(INFORMATION_DESCRIPTION_MAX_LENGTH)
        .nullable()
        .optional(),
});
export const listInformationsSchema = paginationSchema.extend({
    search: z.string().trim().optional(),
    cle: z.string().trim().optional(),
    sort_by: z.enum(["cle", "updated_at"]).default("cle"),
    sort_order: z.enum(["asc", "desc"]).default(STATISTICS_DEFAULT_SORT_ORDER),
});
export const getInformationByKeySchema = z.object({
    cle: z
        .string()
        .trim()
        .min(INFORMATION_KEY_MIN_LENGTH)
        .max(INFORMATION_KEY_MAX_LENGTH),
});
export const informationKeyExistsSchema = z.object({
    cle: z.string().trim().min(1),
});
export const informationIdSchema = idSchema;
export const informationIdStringSchema = idStringSchema;
export const informationIdParamSchema = z.object({
    id: informationIdStringSchema,
});
export const informationKeyParamSchema = z.object({
    cle: z.string().trim().min(1),
});
export const bulkUpsertInformationsSchema = z.object({
    informations: z
        .array(createInformationSchema)
        .min(1, { message: "Au moins une information doit être fournie" })
        .max(50, {
        message: "Vous ne pouvez pas créer/modifier plus de 50 informations à la fois",
    }),
});
export const bulkDeleteInformationsSchema = z.object({
    information_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins une information doit être sélectionnée" })
        .max(50, {
        message: "Vous ne pouvez pas supprimer plus de 50 informations à la fois",
    }),
});
export const informationResponseSchema = informationBaseSchema;
export const informationsListResponseSchema = z.object({
    data: z.array(informationResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const informationStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    with_description: z.number().int().nonnegative(),
    without_description: z.number().int().nonnegative(),
    recently_updated: z.number().int().nonnegative(),
});
export const groupedInformationsSchema = z.object({
    category: z.string(),
    informations: z.array(informationResponseSchema),
    count: z.number().int().nonnegative(),
});
//# sourceMappingURL=information.validators.js.map