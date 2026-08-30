import { z } from "zod";
import { USER_ALERT_MESSAGE_MAX_LENGTH, USER_ALERT_MESSAGE_MIN_LENGTH, USER_ALERT_NOTES_MAX_LENGTH, USER_ALERT_NOTES_MIN_LENGTH, MESSAGING_DEFAULT_SORT_ORDER, } from "../../constants/messaging.constants.js";
import { AlertStatus, ALERT_STATUSES, } from "../../enums/messaging.enums.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const alertStatusSchema = z.enum(["active", "resolue", "ignoree"], {
    errorMap: () => ({
        message: `Le statut doit être l'un des suivants: ${ALERT_STATUSES.join(", ")}`,
    }),
});
export const alertContextDataSchema = z
    .record(z.unknown())
    .nullable()
    .optional();
export const userAlertBaseSchema = z.object({
    id: idSchema,
    utilisateur_id: idSchema,
    alerte_type_id: idSchema,
    statut: alertStatusSchema.default(AlertStatus.ACTIVE),
    message: z
        .string()
        .trim()
        .min(USER_ALERT_MESSAGE_MIN_LENGTH, {
        message: `Le message doit contenir au moins ${USER_ALERT_MESSAGE_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_MESSAGE_MAX_LENGTH, {
        message: `Le message ne peut pas dépasser ${USER_ALERT_MESSAGE_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    donnees_contexte: alertContextDataSchema,
    date_detection: z.coerce.date(),
    date_resolution: z.coerce.date().nullable().optional(),
    notes: z
        .string()
        .trim()
        .min(USER_ALERT_NOTES_MIN_LENGTH, {
        message: `Les notes doivent contenir au moins ${USER_ALERT_NOTES_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_NOTES_MAX_LENGTH, {
        message: `Les notes ne peuvent pas dépasser ${USER_ALERT_NOTES_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    resolu_par: idSchema.nullable().optional(),
    lu: z.boolean().default(false),
    date_lecture: z.coerce.date().nullable().optional(),
});
export const createUserAlertSchema = userAlertBaseSchema.pick({
    utilisateur_id: true,
    alerte_type_id: true,
    statut: true,
    message: true,
    donnees_contexte: true,
});
export const updateUserAlertSchema = z
    .object({
    statut: alertStatusSchema.optional(),
    message: z
        .string()
        .trim()
        .min(USER_ALERT_MESSAGE_MIN_LENGTH, {
        message: `Le message doit contenir au moins ${USER_ALERT_MESSAGE_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_MESSAGE_MAX_LENGTH, {
        message: `Le message ne peut pas dépasser ${USER_ALERT_MESSAGE_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    notes: z
        .string()
        .trim()
        .min(USER_ALERT_NOTES_MIN_LENGTH, {
        message: `Les notes doivent contenir au moins ${USER_ALERT_NOTES_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_NOTES_MAX_LENGTH, {
        message: `Les notes ne peuvent pas dépasser ${USER_ALERT_NOTES_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    resolu_par: idSchema.nullable().optional(),
    lu: z.boolean().optional(),
    date_lecture: z.coerce.date().nullable().optional(),
    date_resolution: z.coerce.date().nullable().optional(),
})
    .refine((data) => {
    if (data.statut === AlertStatus.RESOLVED) {
        return (data.date_resolution !== undefined && data.resolu_par !== undefined);
    }
    return true;
}, {
    message: "Une alerte résolue doit avoir une date de résolution et un utilisateur résolveur",
    path: ["statut"],
});
export const resolveAlertSchema = z.object({
    resolu_par: idSchema,
    notes: z
        .string()
        .trim()
        .min(USER_ALERT_NOTES_MIN_LENGTH, {
        message: `Les notes doivent contenir au moins ${USER_ALERT_NOTES_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_NOTES_MAX_LENGTH, {
        message: `Les notes ne peuvent pas dépasser ${USER_ALERT_NOTES_MAX_LENGTH} caractères`,
    })
        .optional(),
});
export const ignoreAlertSchema = z.object({
    notes: z
        .string()
        .trim()
        .min(USER_ALERT_NOTES_MIN_LENGTH, {
        message: `Les notes doivent contenir au moins ${USER_ALERT_NOTES_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_NOTES_MAX_LENGTH, {
        message: `Les notes ne peuvent pas dépasser ${USER_ALERT_NOTES_MAX_LENGTH} caractères`,
    })
        .optional(),
});
export const listUserAlertsSchema = paginationSchema.extend({
    utilisateur_id: idSchema.optional(),
    alerte_type_id: idSchema.optional(),
    statut: alertStatusSchema.optional(),
    lu: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    resolu_par: idSchema.optional(),
    sort_by: z
        .enum(["date_detection", "date_resolution", "statut"])
        .default("date_detection"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const activeAlertsSchema = paginationSchema.extend({
    utilisateur_id: idSchema.optional(),
    alerte_type_id: idSchema.optional(),
    sort_by: z.enum(["date_detection"]).default("date_detection"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const resolvedAlertsSchema = paginationSchema.extend({
    utilisateur_id: idSchema.optional(),
    resolu_par: idSchema.optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z
        .enum(["date_resolution", "date_detection"])
        .default("date_resolution"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const userAlertIdSchema = idSchema;
export const userAlertIdStringSchema = idStringSchema;
export const userAlertIdParamSchema = z.object({
    id: userAlertIdStringSchema,
});
export const bulkMarkReadAlertsSchema = z.object({
    alert_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins une alerte doit être sélectionnée" })
        .max(100, {
        message: "Vous ne pouvez pas marquer plus de 100 alertes à la fois",
    }),
});
export const bulkResolveAlertsSchema = z.object({
    alert_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins une alerte doit être sélectionnée" })
        .max(50, {
        message: "Vous ne pouvez pas résoudre plus de 50 alertes à la fois",
    }),
    resolu_par: idSchema,
    notes: z
        .string()
        .trim()
        .min(USER_ALERT_NOTES_MIN_LENGTH, {
        message: `Les notes doivent contenir au moins ${USER_ALERT_NOTES_MIN_LENGTH} caractère`,
    })
        .max(USER_ALERT_NOTES_MAX_LENGTH, {
        message: `Les notes ne peuvent pas dépasser ${USER_ALERT_NOTES_MAX_LENGTH} caractères`,
    })
        .optional(),
});
export const userAlertResponseSchema = userAlertBaseSchema;
export const userAlertsListResponseSchema = z.object({
    data: z.array(userAlertResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const userAlertStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    resolved: z.number().int().nonnegative(),
    ignored: z.number().int().nonnegative(),
    unread: z.number().int().nonnegative(),
    by_type: z.record(z.number().int().nonnegative()),
});
//# sourceMappingURL=user-alert.validators.js.map