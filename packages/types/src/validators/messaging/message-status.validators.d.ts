import { z } from "zod";
export declare const messageStatusBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
}, {
    id: number;
    nom: string;
}>;
export type MessageStatus = z.infer<typeof messageStatusBaseSchema>;
export declare const createMessageStatusSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
}, "nom">, "strip", z.ZodTypeAny, {
    nom: string;
}, {
    nom: string;
}>;
export type CreateMessageStatus = z.infer<typeof createMessageStatusSchema>;
export declare const updateMessageStatusSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
}, {
    nom?: string | undefined;
}>;
export type UpdateMessageStatus = z.infer<typeof updateMessageStatusSchema>;
export declare const listMessageStatusesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["nom", "id"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "id" | "nom";
    sort_order: "asc" | "desc";
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "id" | "nom" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ListMessageStatusesQuery = z.infer<typeof listMessageStatusesSchema>;
export declare const messageStatusIdSchema: z.ZodNumber;
export declare const messageStatusIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const messageStatusIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type MessageStatusIdParam = z.infer<typeof messageStatusIdParamSchema>;
export declare const messageStatusResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
}, {
    id: number;
    nom: string;
}>;
export type MessageStatusResponse = z.infer<typeof messageStatusResponseSchema>;
export declare const messageStatusesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
    }, {
        id: number;
        nom: string;
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
        nom: string;
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
        nom: string;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type MessageStatusesListResponse = z.infer<typeof messageStatusesListResponseSchema>;
export declare const messageStatusStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    usage_count: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    total: number;
    usage_count: Record<string, number>;
}, {
    total: number;
    usage_count: Record<string, number>;
}>;
export type MessageStatusStats = z.infer<typeof messageStatusStatsSchema>;
//# sourceMappingURL=message-status.validators.d.ts.map