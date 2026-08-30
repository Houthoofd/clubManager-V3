import { z } from "zod";
import { STATISTIC_TYPE_MAX_LENGTH, STATISTIC_TYPE_MIN_LENGTH, STATISTIC_KEY_MAX_LENGTH, STATISTIC_KEY_MIN_LENGTH, STATISTIC_VALUE_MAX_LENGTH, STATISTIC_VALUE_MIN_LENGTH, STATISTICS_DEFAULT_SORT_ORDER, MAX_STATISTICS_DATE_RANGE_DAYS, } from "../../constants/statistics.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const statisticBaseSchema = z.object({
    id: idSchema,
    type: z
        .string()
        .trim()
        .min(STATISTIC_TYPE_MIN_LENGTH, {
        message: `Le type doit contenir au moins ${STATISTIC_TYPE_MIN_LENGTH} caractère`,
    })
        .max(STATISTIC_TYPE_MAX_LENGTH, {
        message: `Le type ne peut pas dépasser ${STATISTIC_TYPE_MAX_LENGTH} caractères`,
    }),
    cle: z
        .string()
        .trim()
        .min(STATISTIC_KEY_MIN_LENGTH, {
        message: `La clé doit contenir au moins ${STATISTIC_KEY_MIN_LENGTH} caractère`,
    })
        .max(STATISTIC_KEY_MAX_LENGTH, {
        message: `La clé ne peut pas dépasser ${STATISTIC_KEY_MAX_LENGTH} caractères`,
    }),
    valeur: z
        .string()
        .trim()
        .min(STATISTIC_VALUE_MIN_LENGTH, {
        message: `La valeur doit contenir au moins ${STATISTIC_VALUE_MIN_LENGTH} caractère`,
    })
        .max(STATISTIC_VALUE_MAX_LENGTH, {
        message: `La valeur ne peut pas dépasser ${STATISTIC_VALUE_MAX_LENGTH} caractères`,
    }),
    date_stat: z.coerce.date(),
    created_at: z.coerce.date(),
});
export const createStatisticSchema = statisticBaseSchema.pick({
    type: true,
    cle: true,
    valeur: true,
    date_stat: true,
});
export const createStatisticWithJsonSchema = z.object({
    type: z
        .string()
        .trim()
        .min(STATISTIC_TYPE_MIN_LENGTH)
        .max(STATISTIC_TYPE_MAX_LENGTH),
    cle: z
        .string()
        .trim()
        .min(STATISTIC_KEY_MIN_LENGTH)
        .max(STATISTIC_KEY_MAX_LENGTH),
    valeur: z.record(z.unknown()),
    date_stat: z.coerce.date(),
});
export const updateStatisticSchema = statisticBaseSchema
    .pick({
    type: true,
    cle: true,
    valeur: true,
})
    .partial();
export const listStatisticsSchema = paginationSchema
    .extend({
    type: z.string().trim().optional(),
    cle: z.string().trim().optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z
        .enum(["date_stat", "type", "cle", "created_at"])
        .default("date_stat"),
    sort_order: z.enum(["asc", "desc"]).default(STATISTICS_DEFAULT_SORT_ORDER),
})
    .refine((data) => {
    if (data.date_debut && data.date_fin) {
        const diffTime = Math.abs(data.date_fin.getTime() - data.date_debut.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= MAX_STATISTICS_DATE_RANGE_DAYS;
    }
    return true;
}, {
    message: `La plage de dates ne peut pas dépasser ${MAX_STATISTICS_DATE_RANGE_DAYS} jours`,
    path: ["date_fin"],
});
export const statisticsByTypeSchema = paginationSchema.extend({
    type: z.string().trim(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z.enum(["date_stat", "cle"]).default("date_stat"),
    sort_order: z.enum(["asc", "desc"]).default(STATISTICS_DEFAULT_SORT_ORDER),
});
export const statisticsByDateRangeSchema = z
    .object({
    date_debut: z.coerce.date(),
    date_fin: z.coerce.date(),
    type: z.string().trim().optional(),
})
    .refine((data) => data.date_fin >= data.date_debut, {
    message: "La date de fin doit être supérieure ou égale à la date de début",
    path: ["date_fin"],
})
    .refine((data) => {
    const diffTime = Math.abs(data.date_fin.getTime() - data.date_debut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= MAX_STATISTICS_DATE_RANGE_DAYS;
}, {
    message: `La plage de dates ne peut pas dépasser ${MAX_STATISTICS_DATE_RANGE_DAYS} jours`,
    path: ["date_fin"],
});
export const statisticIdSchema = idSchema;
export const statisticIdStringSchema = idStringSchema;
export const statisticIdParamSchema = z.object({
    id: statisticIdStringSchema,
});
export const bulkCreateStatisticsSchema = z.object({
    statistics: z
        .array(createStatisticSchema)
        .min(1, { message: "Au moins une statistique doit être fournie" })
        .max(100, {
        message: "Vous ne pouvez pas créer plus de 100 statistiques à la fois",
    }),
});
export const bulkDeleteStatisticsSchema = z.object({
    statistic_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins une statistique doit être sélectionnée" })
        .max(100, {
        message: "Vous ne pouvez pas supprimer plus de 100 statistiques à la fois",
    }),
});
export const statisticResponseSchema = statisticBaseSchema;
export const statisticsListResponseSchema = z.object({
    data: z.array(statisticResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const statisticsSummarySchema = z.object({
    type: z.string(),
    count: z.number().int().nonnegative(),
    date_debut: z.coerce.date(),
    date_fin: z.coerce.date(),
    statistics: z.array(statisticResponseSchema).optional(),
});
export const aggregatedStatisticsSchema = z.object({
    total_records: z.number().int().nonnegative(),
    types: z.record(z.number().int().nonnegative()),
    date_range: z.object({
        earliest: z.coerce.date(),
        latest: z.coerce.date(),
    }),
});
//# sourceMappingURL=statistic.validators.js.map