import { z } from "zod";
import { CUSTOM_MESSAGE_TITLE_MAX_LENGTH, CUSTOM_MESSAGE_TITLE_MIN_LENGTH, CUSTOM_MESSAGE_CONTENT_MIN_LENGTH, CUSTOM_MESSAGE_CONTENT_MAX_LENGTH, MESSAGING_DEFAULT_SORT_ORDER, } from "../../constants/messaging.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const customMessageBaseSchema = z.object({
    id: idSchema,
    type_id: idSchema,
    titre: z
        .string()
        .trim()
        .min(CUSTOM_MESSAGE_TITLE_MIN_LENGTH, {
        message: `Le titre doit contenir au moins ${CUSTOM_MESSAGE_TITLE_MIN_LENGTH} caractère`,
    })
        .max(CUSTOM_MESSAGE_TITLE_MAX_LENGTH, {
        message: `Le titre ne peut pas dépasser ${CUSTOM_MESSAGE_TITLE_MAX_LENGTH} caractères`,
    }),
    contenu: z
        .string()
        .trim()
        .min(CUSTOM_MESSAGE_CONTENT_MIN_LENGTH, {
        message: `Le contenu doit contenir au moins ${CUSTOM_MESSAGE_CONTENT_MIN_LENGTH} caractère`,
    })
        .max(CUSTOM_MESSAGE_CONTENT_MAX_LENGTH, {
        message: `Le contenu ne peut pas dépasser ${CUSTOM_MESSAGE_CONTENT_MAX_LENGTH} caractères`,
    }),
    actif: z.boolean().default(true),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().nullable().optional(),
});
export const createCustomMessageSchema = customMessageBaseSchema.pick({
    type_id: true,
    titre: true,
    contenu: true,
    actif: true,
});
export const updateCustomMessageSchema = customMessageBaseSchema
    .pick({
    type_id: true,
    titre: true,
    contenu: true,
    actif: true,
})
    .partial();
export const listCustomMessagesSchema = paginationSchema.extend({
    type_id: idSchema.optional(),
    actif: z
        .string()
        .transform((val) => val === "true" || val === "1")
        .pipe(z.boolean())
        .optional(),
    search: z.string().trim().optional(),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    sort_by: z
        .enum(["created_at", "updated_at", "titre", "actif"])
        .default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default(MESSAGING_DEFAULT_SORT_ORDER),
});
export const activeCustomMessagesByTypeSchema = z.object({
    type_id: idSchema,
    sort_by: z.enum(["created_at", "titre"]).default("titre"),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
});
export const activeCustomMessagesSchema = paginationSchema.extend({
    type_id: idSchema.optional(),
    sort_by: z.enum(["created_at", "titre"]).default("titre"),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
});
export const customMessageIdSchema = idSchema;
export const customMessageIdStringSchema = idStringSchema;
export const customMessageIdParamSchema = z.object({
    id: customMessageIdStringSchema,
});
export const activateCustomMessageSchema = z.object({
    actif: z.literal(true),
});
export const deactivateCustomMessageSchema = z.object({
    actif: z.literal(false),
});
export const bulkToggleCustomMessagesSchema = z.object({
    message_ids: z
        .array(idSchema)
        .min(1, { message: "Au moins un message doit être sélectionné" })
        .max(50, {
        message: "Vous ne pouvez pas modifier plus de 50 messages à la fois",
    }),
    actif: z.boolean(),
});
export const templateVariablesSchema = z.object({
    variables: z.array(z.string()).min(0),
    exemple: z.record(z.string()).optional(),
});
export const renderTemplateSchema = z.object({
    template_id: idSchema,
    data: z.record(z.unknown()),
});
export const renderedTemplateSchema = z.object({
    titre: z.string(),
    contenu: z.string(),
    variables_used: z.array(z.string()),
    missing_variables: z.array(z.string()).optional(),
});
export const customMessageResponseSchema = customMessageBaseSchema;
export const customMessagesListResponseSchema = z.object({
    data: z.array(customMessageResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const customMessageStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    inactive: z.number().int().nonnegative(),
    by_type: z.record(z.number().int().nonnegative()),
    most_used: z.array(customMessageResponseSchema).max(5),
});
export const customMessagePreviewSchema = z.object({
    id: idSchema,
    type_id: idSchema,
    type_name: z.string(),
    titre: z.string(),
    contenu_preview: z.string().max(200),
    actif: z.boolean(),
    variables: z.array(z.string()),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().nullable().optional(),
});
//# sourceMappingURL=custom-message.validators.js.map