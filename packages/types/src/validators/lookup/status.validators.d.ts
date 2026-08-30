import { z } from "zod";
export declare const statusBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
}>;
export type Status = z.infer<typeof statusBaseSchema>;
export declare const createStatusSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "nom" | "description">, "strip", z.ZodTypeAny, {
    nom: string;
    description?: string | null | undefined;
}, {
    nom: string;
    description?: string | null | undefined;
}>;
export type CreateStatus = z.infer<typeof createStatusSchema>;
export declare const updateStatusSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    description?: string | null | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
}>;
export type UpdateStatus = z.infer<typeof updateStatusSchema>;
export declare const listStatusesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    search: z.ZodOptional<z.ZodString>;
    has_description: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    sort_by: z.ZodDefault<z.ZodEnum<["nom", "id"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "id" | "nom";
    sort_order: "asc" | "desc";
    search?: string | undefined;
    has_description?: boolean | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "id" | "nom" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    has_description?: string | undefined;
}>;
export type ListStatusesQuery = z.infer<typeof listStatusesSchema>;
export declare const statusIdSchema: z.ZodNumber;
export declare const statusIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const statusIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type StatusIdParam = z.infer<typeof statusIdParamSchema>;
export declare const statusResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
}>;
export type StatusResponse = z.infer<typeof statusResponseSchema>;
export declare const statusesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        description?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        description?: string | null | undefined;
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
        description?: string | null | undefined;
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
        description?: string | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type StatusesListResponse = z.infer<typeof statusesListResponseSchema>;
export declare const statusStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    with_description: z.ZodNumber;
    without_description: z.ZodNumber;
    usage_count: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    total: number;
    usage_count: Record<string, number>;
    with_description: number;
    without_description: number;
}, {
    total: number;
    usage_count: Record<string, number>;
    with_description: number;
    without_description: number;
}>;
export type StatusStats = z.infer<typeof statusStatsSchema>;
//# sourceMappingURL=status.validators.d.ts.map