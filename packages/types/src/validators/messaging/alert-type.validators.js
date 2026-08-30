import { z } from "zod";
import { ALERT_TYPE_NAME_MAX_LENGTH, ALERT_TYPE_NAME_MIN_LENGTH, ALERT_TYPE_DESCRIPTION_MAX_LENGTH, } from "../../constants/messaging.constants.js";
import { AlertSeverity, ALERT_SEVERITIES, } from "../../enums/messaging.enums.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const alertSeveritySchema = z.enum(["info", "warning", "critical"], {
    errorMap: () => ({
        message: `La sévérité doit être l'une des suivantes: ${ALERT_SEVERITIES.join(", ")}`,
    }),
});
export const alertTypeBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .trim()
        .min(ALERT_TYPE_NAME_MIN_LENGTH, {
        message: `Le nom doit contenir au moins ${ALERT_TYPE_NAME_MIN_LENGTH} caractère`,
    })
        .max(ALERT_TYPE_NAME_MAX_LENGTH, {
        message: `Le nom ne peut pas dépasser ${ALERT_TYPE_NAME_MAX_LENGTH} caractères`,
    }),
    description: z
        .string()
        .trim()
        .max(ALERT_TYPE_DESCRIPTION_MAX_LENGTH, {
        message: `La description ne peut pas dépasser ${ALERT_TYPE_DESCRIPTION_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    severite: alertSeveritySchema.default(AlertSeverity.INFO),
});
export const createAlertTypeSchema = alertTypeBaseSchema.pick({
    nom: true,
    description: true,
    severite: true,
});
export const updateAlertTypeSchema = alertTypeBaseSchema
    .pick({
    nom: true,
    description: true,
    severite: true,
})
    .partial();
export const listAlertTypesSchema = paginationSchema.extend({
    severite: alertSeveritySchema.optional(),
    search: z.string().trim().optional(),
    sort_by: z.enum(["nom", "severite"]).default("nom"),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
});
export const alertTypesBySeveritySchema = z.object({
    severite: alertSeveritySchema,
});
export const alertTypeIdSchema = idSchema;
export const alertTypeIdStringSchema = idStringSchema;
export const alertTypeIdParamSchema = z.object({
    id: alertTypeIdStringSchema,
});
export const alertTypeResponseSchema = alertTypeBaseSchema;
export const alertTypesListResponseSchema = z.object({
    data: z.array(alertTypeResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const alertTypeStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    by_severity: z.object({
        info: z.number().int().nonnegative(),
        warning: z.number().int().nonnegative(),
        critical: z.number().int().nonnegative(),
    }),
});
//# sourceMappingURL=alert-type.validators.js.map