import { z } from "zod";
import { ALERT_ACTION_DESCRIPTION_MAX_LENGTH, ALERT_ACTION_DESCRIPTION_MIN_LENGTH, MESSAGING_DEFAULT_PAGE_SIZE, MESSAGING_MAX_PAGE_SIZE, MESSAGING_MIN_PAGE_SIZE, MESSAGING_DEFAULT_PAGE, MESSAGING_DEFAULT_SORT_ORDER, } from "../../constants/messaging.constants.js";
import { ALERT_ACTION_TYPES, } from "../../enums/messaging.enums.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const alertActionTypeSchema = z.enum([
    "message_envoye",
    "information_mise_a_jour",
    "paiement_recu",
    "statut_change",
    "autre",
], {
    errorMap: () => ({
        message: `Le type d'action doit être l'un des suivants: ${ALERT_ACTION_TYPES.join(", ")}`,
    }),
});
export const alertActionBaseSchema = z.object({
    id: idSchema,
    alerte_id: idSchema,
    action_type: alertActionTypeSchema,
    description: z
        .string()
        .trim()
        .min(ALERT_ACTION_DESCRIPTION_MIN_LENGTH, {
        message: `La description doit contenir au moins ${ALERT_ACTION_DESCRIPTION_MIN_LENGTH} caractère`,
    })
        .max(ALERT_ACTION_DESCRIPTION_MAX_LENGTH, {
        message: `La description ne peut pas dépasser ${ALERT_ACTION_DESCRIPTION_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    effectue_par: idSchema.nullable().optional(),
    date_action: z.coerce.date(),
});
export const createAlertActionSchema = alertActionBaseSchema.pick({
    alerte_id: true,
    action_type: true,
    description: true,
    effectue_par: true,
});
export const listAlertActionsSchema = paginationSchema.extend({
    alerte_id: idSchema.optional(),
    action_type: alertActionTypeSchema.optional(),
    effectue_par: idSchema.optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z.enum(["date_action", "action_type"]).default("date_action"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const alertHistorySchema = z.object({
    alerte_id: idSchema,
    page: z.coerce.number().int().positive().default(MESSAGING_DEFAULT_PAGE),
    page_size: z.coerce
        .number()
        .int()
        .min(MESSAGING_MIN_PAGE_SIZE)
        .max(MESSAGING_MAX_PAGE_SIZE)
        .default(MESSAGING_DEFAULT_PAGE_SIZE),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
});
export const actionsByTypeSchema = z.object({
    action_type: alertActionTypeSchema,
    alerte_id: idSchema.optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
});
export const actionsByUserSchema = paginationSchema.extend({
    effectue_par: idSchema,
    action_type: alertActionTypeSchema.optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z.enum(["date_action"]).default("date_action"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const alertActionIdSchema = idSchema;
export const alertActionIdStringSchema = idStringSchema;
export const alertActionIdParamSchema = z.object({
    id: alertActionIdStringSchema,
});
export const alertIdParamSchema = z.object({
    alerte_id: idStringSchema,
});
export const alertActionResponseSchema = alertActionBaseSchema;
export const alertActionsListResponseSchema = z.object({
    data: z.array(alertActionResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const alertActionStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    by_type: z.object({
        message_envoye: z.number().int().nonnegative(),
        information_mise_a_jour: z.number().int().nonnegative(),
        paiement_recu: z.number().int().nonnegative(),
        statut_change: z.number().int().nonnegative(),
        autre: z.number().int().nonnegative(),
    }),
    by_user: z.record(z.number().int().nonnegative()),
    recent_actions: z.array(alertActionResponseSchema).max(10),
});
export const alertTimelineEntrySchema = alertActionBaseSchema.extend({
    user_name: z.string().optional(),
    alert_status_before: z.string().optional(),
    alert_status_after: z.string().optional(),
});
export const alertTimelineSchema = z.object({
    alerte_id: idSchema,
    entries: z.array(alertTimelineEntrySchema),
    total_actions: z.number().int().nonnegative(),
});
//# sourceMappingURL=alert-action.validators.js.map