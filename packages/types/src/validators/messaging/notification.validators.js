import { z } from "zod";
import { NOTIFICATION_TITLE_MAX_LENGTH, NOTIFICATION_TITLE_MIN_LENGTH, NOTIFICATION_MESSAGE_MIN_LENGTH, NOTIFICATION_MESSAGE_MAX_LENGTH, MESSAGING_DEFAULT_SORT_ORDER, } from "../../constants/messaging.constants.js";
import { NotificationType, NOTIFICATION_TYPES, } from "../../enums/messaging.enums.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const notificationTypeSchema = z.enum(["info", "warning", "error", "success"], {
    errorMap: () => ({
        message: `Le type de notification doit être l'un des suivants: ${NOTIFICATION_TYPES.join(", ")}`,
    }),
});
export const notificationBaseSchema = z.object({
    id: idSchema,
    utilisateur_id: idSchema,
    type: notificationTypeSchema.default(NotificationType.INFO),
    titre: z
        .string()
        .trim()
        .min(NOTIFICATION_TITLE_MIN_LENGTH, {
        message: `Le titre doit contenir au moins ${NOTIFICATION_TITLE_MIN_LENGTH} caractère`,
    })
        .max(NOTIFICATION_TITLE_MAX_LENGTH, {
        message: `Le titre ne peut pas dépasser ${NOTIFICATION_TITLE_MAX_LENGTH} caractères`,
    }),
    message: z
        .string()
        .trim()
        .min(NOTIFICATION_MESSAGE_MIN_LENGTH, {
        message: `Le message doit contenir au moins ${NOTIFICATION_MESSAGE_MIN_LENGTH} caractère`,
    })
        .max(NOTIFICATION_MESSAGE_MAX_LENGTH, {
        message: `Le message ne peut pas dépasser ${NOTIFICATION_MESSAGE_MAX_LENGTH} caractères`,
    }),
    lu: z.boolean().default(false),
    created_at: z.coerce.date(),
});
export const createNotificationSchema = notificationBaseSchema.pick({
    utilisateur_id: true,
    type: true,
    titre: true,
    message: true,
});
export const updateNotificationSchema = z.object({
    lu: z.boolean(),
});
export const listNotificationsSchema = paginationSchema.extend({
    utilisateur_id: idSchema.optional(),
    type: notificationTypeSchema.optional(),
    lu: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    search: z.string().trim().optional(),
    sort_by: z.enum(["created_at", "type", "titre"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const userNotificationsSchema = paginationSchema.extend({
    type: notificationTypeSchema.optional(),
    lu: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    sort_by: z.enum(["created_at"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const notificationIdSchema = idSchema;
export const notificationIdStringSchema = idStringSchema;
export const notificationIdParamSchema = z.object({
    id: notificationIdStringSchema,
});
export const bulkMarkReadNotificationsSchema = z.object({
    notification_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins une notification doit être sélectionnée" })
        .max(100, {
        message: "Vous ne pouvez pas marquer plus de 100 notifications à la fois",
    }),
});
export const bulkDeleteNotificationsSchema = z.object({
    notification_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins une notification doit être sélectionnée" })
        .max(100, {
        message: "Vous ne pouvez pas supprimer plus de 100 notifications à la fois",
    }),
});
export const markAllReadSchema = z.object({
    utilisateur_id: idSchema,
    type: notificationTypeSchema.optional(),
});
export const notificationResponseSchema = notificationBaseSchema;
export const notificationsListResponseSchema = z.object({
    data: z.array(notificationResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const notificationStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    unread: z.number().int().nonnegative(),
    by_type: z.object({
        info: z.number().int().nonnegative(),
        warning: z.number().int().nonnegative(),
        error: z.number().int().nonnegative(),
        success: z.number().int().nonnegative(),
    }),
});
//# sourceMappingURL=notification.validators.js.map