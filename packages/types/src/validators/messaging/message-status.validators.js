import { z } from "zod";
import { MESSAGE_STATUS_NAME_MAX_LENGTH, MESSAGE_STATUS_NAME_MIN_LENGTH, MESSAGING_DEFAULT_SORT_ORDER, } from "../../constants/messaging.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const messageStatusBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .trim()
        .min(MESSAGE_STATUS_NAME_MIN_LENGTH, {
        message: `Le nom doit contenir au moins ${MESSAGE_STATUS_NAME_MIN_LENGTH} caractère`,
    })
        .max(MESSAGE_STATUS_NAME_MAX_LENGTH, {
        message: `Le nom ne peut pas dépasser ${MESSAGE_STATUS_NAME_MAX_LENGTH} caractères`,
    }),
});
export const createMessageStatusSchema = messageStatusBaseSchema.pick({
    nom: true,
});
export const updateMessageStatusSchema = messageStatusBaseSchema
    .pick({
    nom: true,
})
    .partial();
export const listMessageStatusesSchema = paginationSchema.extend({
    search: z.string().trim().optional(),
    sort_by: z.enum(["nom", "id"]).default("nom"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const messageStatusIdSchema = idSchema;
export const messageStatusIdStringSchema = idStringSchema;
export const messageStatusIdParamSchema = z.object({
    id: messageStatusIdStringSchema,
});
export const messageStatusResponseSchema = messageStatusBaseSchema;
export const messageStatusesListResponseSchema = z.object({
    data: z.array(messageStatusResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const messageStatusStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    usage_count: z.record(z.number().int().nonnegative()),
});
//# sourceMappingURL=message-status.validators.js.map