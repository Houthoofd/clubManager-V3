import { z } from "zod";
import { MESSAGE_SUBJECT_MAX_LENGTH, MESSAGE_SUBJECT_MIN_LENGTH, MESSAGE_CONTENT_MIN_LENGTH, MESSAGE_CONTENT_MAX_LENGTH, MESSAGING_DEFAULT_SORT_ORDER, } from "../../constants/messaging.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const messageBaseSchema = z.object({
    id: idSchema,
    expediteur_id: idSchema,
    destinataire_id: idSchema,
    sujet: z
        .string()
        .trim()
        .min(MESSAGE_SUBJECT_MIN_LENGTH, {
        message: `Le sujet doit contenir au moins ${MESSAGE_SUBJECT_MIN_LENGTH} caractère`,
    })
        .max(MESSAGE_SUBJECT_MAX_LENGTH, {
        message: `Le sujet ne peut pas dépasser ${MESSAGE_SUBJECT_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
    contenu: z
        .string()
        .trim()
        .min(MESSAGE_CONTENT_MIN_LENGTH, {
        message: `Le contenu doit contenir au moins ${MESSAGE_CONTENT_MIN_LENGTH} caractère`,
    })
        .max(MESSAGE_CONTENT_MAX_LENGTH, {
        message: `Le contenu ne peut pas dépasser ${MESSAGE_CONTENT_MAX_LENGTH} caractères`,
    }),
    lu: z.boolean().default(false),
    date_lecture: z.coerce.date().nullable().optional(),
    created_at: z.coerce.date(),
});
export const createMessageSchema = messageBaseSchema
    .pick({
    expediteur_id: true,
    destinataire_id: true,
    sujet: true,
    contenu: true,
})
    .refine((data) => data.expediteur_id !== data.destinataire_id, {
    message: "L'expéditeur et le destinataire doivent être différents",
    path: ["destinataire_id"],
});
export const updateMessageSchema = z.object({
    lu: z.boolean().optional(),
    date_lecture: z.coerce.date().nullable().optional(),
});
export const listMessagesSchema = paginationSchema.extend({
    expediteur_id: idSchema.optional(),
    destinataire_id: idSchema.optional(),
    lu: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    sujet: z.string().trim().optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z
        .enum(["created_at", "date_lecture", "sujet"])
        .default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const messageInboxSchema = paginationSchema.extend({
    lu: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    expediteur_id: idSchema.optional(),
    sort_by: z.enum(["created_at", "date_lecture"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const messageOutboxSchema = paginationSchema.extend({
    destinataire_id: idSchema.optional(),
    sort_by: z.enum(["created_at"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const messageIdSchema = idSchema;
export const messageIdStringSchema = idStringSchema;
export const messageIdParamSchema = z.object({
    id: messageIdStringSchema,
});
export const bulkMarkReadSchema = z.object({
    message_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins un message doit être sélectionné" })
        .max(100, {
        message: "Vous ne pouvez pas marquer plus de 100 messages à la fois",
    }),
});
export const bulkDeleteMessagesSchema = z.object({
    message_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins un message doit être sélectionné" })
        .max(100, {
        message: "Vous ne pouvez pas supprimer plus de 100 messages à la fois",
    }),
});
export const messageResponseSchema = messageBaseSchema;
export const messagesListResponseSchema = z.object({
    data: z.array(messageResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const messageStatsSchema = z.object({
    total_messages: z.number().int().nonnegative(),
    unread_messages: z.number().int().nonnegative(),
    sent_messages: z.number().int().nonnegative(),
    received_messages: z.number().int().nonnegative(),
});
//# sourceMappingURL=message.validators.js.map