import { z } from "zod";
export declare const messageBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    expediteur_id: z.ZodNumber;
    destinataire_id: z.ZodNumber;
    sujet: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contenu: z.ZodString;
    lu: z.ZodDefault<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: Date;
    lu: boolean;
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    sujet?: string | null | undefined;
    date_lecture?: Date | null | undefined;
}, {
    id: number;
    created_at: Date;
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    lu?: boolean | undefined;
    sujet?: string | null | undefined;
    date_lecture?: Date | null | undefined;
}>;
export type Message = z.infer<typeof messageBaseSchema>;
export declare const createMessageSchema: z.ZodEffects<z.ZodObject<Pick<{
    id: z.ZodNumber;
    expediteur_id: z.ZodNumber;
    destinataire_id: z.ZodNumber;
    sujet: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contenu: z.ZodString;
    lu: z.ZodDefault<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    created_at: z.ZodDate;
}, "expediteur_id" | "destinataire_id" | "sujet" | "contenu">, "strip", z.ZodTypeAny, {
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    sujet?: string | null | undefined;
}, {
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    sujet?: string | null | undefined;
}>, {
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    sujet?: string | null | undefined;
}, {
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    sujet?: string | null | undefined;
}>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
export declare const updateMessageSchema: z.ZodObject<{
    lu: z.ZodOptional<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
}, {
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
}>;
export type UpdateMessage = z.infer<typeof updateMessageSchema>;
export declare const listMessagesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    expediteur_id: z.ZodOptional<z.ZodNumber>;
    destinataire_id: z.ZodOptional<z.ZodNumber>;
    lu: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    sujet: z.ZodOptional<z.ZodString>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at", "date_lecture", "sujet"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "created_at" | "sujet" | "date_lecture";
    sort_order: "asc" | "desc";
    lu?: boolean | undefined;
    expediteur_id?: number | undefined;
    destinataire_id?: number | undefined;
    sujet?: string | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    lu?: string | undefined;
    expediteur_id?: number | undefined;
    destinataire_id?: number | undefined;
    sujet?: string | undefined;
    sort_by?: "created_at" | "sujet" | "date_lecture" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export type ListMessagesQuery = z.infer<typeof listMessagesSchema>;
export declare const messageInboxSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    lu: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    expediteur_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at", "date_lecture"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "created_at" | "date_lecture";
    sort_order: "asc" | "desc";
    lu?: boolean | undefined;
    expediteur_id?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    lu?: string | undefined;
    expediteur_id?: number | undefined;
    sort_by?: "created_at" | "date_lecture" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type MessageInboxQuery = z.infer<typeof messageInboxSchema>;
export declare const messageOutboxSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    destinataire_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "created_at";
    sort_order: "asc" | "desc";
    destinataire_id?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    destinataire_id?: number | undefined;
    sort_by?: "created_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type MessageOutboxQuery = z.infer<typeof messageOutboxSchema>;
export declare const messageIdSchema: z.ZodNumber;
export declare const messageIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const messageIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type MessageIdParam = z.infer<typeof messageIdParamSchema>;
export declare const bulkMarkReadSchema: z.ZodObject<{
    message_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    message_ids: number[];
}, {
    message_ids: number[];
}>;
export type BulkMarkRead = z.infer<typeof bulkMarkReadSchema>;
export declare const bulkDeleteMessagesSchema: z.ZodObject<{
    message_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    message_ids: number[];
}, {
    message_ids: number[];
}>;
export type BulkDeleteMessages = z.infer<typeof bulkDeleteMessagesSchema>;
export declare const messageResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    expediteur_id: z.ZodNumber;
    destinataire_id: z.ZodNumber;
    sujet: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contenu: z.ZodString;
    lu: z.ZodDefault<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: Date;
    lu: boolean;
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    sujet?: string | null | undefined;
    date_lecture?: Date | null | undefined;
}, {
    id: number;
    created_at: Date;
    expediteur_id: number;
    destinataire_id: number;
    contenu: string;
    lu?: boolean | undefined;
    sujet?: string | null | undefined;
    date_lecture?: Date | null | undefined;
}>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export declare const messagesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        expediteur_id: z.ZodNumber;
        destinataire_id: z.ZodNumber;
        sujet: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        contenu: z.ZodString;
        lu: z.ZodDefault<z.ZodBoolean>;
        date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        created_at: Date;
        lu: boolean;
        expediteur_id: number;
        destinataire_id: number;
        contenu: string;
        sujet?: string | null | undefined;
        date_lecture?: Date | null | undefined;
    }, {
        id: number;
        created_at: Date;
        expediteur_id: number;
        destinataire_id: number;
        contenu: string;
        lu?: boolean | undefined;
        sujet?: string | null | undefined;
        date_lecture?: Date | null | undefined;
    }>, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        page_size: z.ZodNumber;
        total: z.ZodNumber;
        total_pages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }, {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        id: number;
        created_at: Date;
        lu: boolean;
        expediteur_id: number;
        destinataire_id: number;
        contenu: string;
        sujet?: string | null | undefined;
        date_lecture?: Date | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}, {
    data: {
        id: number;
        created_at: Date;
        expediteur_id: number;
        destinataire_id: number;
        contenu: string;
        lu?: boolean | undefined;
        sujet?: string | null | undefined;
        date_lecture?: Date | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type MessagesListResponse = z.infer<typeof messagesListResponseSchema>;
export declare const messageStatsSchema: z.ZodObject<{
    total_messages: z.ZodNumber;
    unread_messages: z.ZodNumber;
    sent_messages: z.ZodNumber;
    received_messages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_messages: number;
    unread_messages: number;
    sent_messages: number;
    received_messages: number;
}, {
    total_messages: number;
    unread_messages: number;
    sent_messages: number;
    received_messages: number;
}>;
export type MessageStats = z.infer<typeof messageStatsSchema>;
//# sourceMappingURL=message.validators.d.ts.map