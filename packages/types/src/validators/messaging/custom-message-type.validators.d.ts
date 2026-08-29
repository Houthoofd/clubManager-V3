import { z } from "zod";
export declare const customMessageTypeBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actif: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    actif: boolean;
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
    actif?: boolean | undefined;
}>;
export type CustomMessageType = z.infer<typeof customMessageTypeBaseSchema>;
export declare const createCustomMessageTypeSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actif: z.ZodDefault<z.ZodBoolean>;
}, "nom" | "description" | "actif">, "strip", z.ZodTypeAny, {
    nom: string;
    actif: boolean;
    description?: string | null | undefined;
}, {
    nom: string;
    description?: string | null | undefined;
    actif?: boolean | undefined;
}>;
export type CreateCustomMessageType = z.infer<typeof createCustomMessageTypeSchema>;
export declare const updateCustomMessageTypeSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    actif: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    description?: string | null | undefined;
    actif?: boolean | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
    actif?: boolean | undefined;
}>;
export type UpdateCustomMessageType = z.infer<typeof updateCustomMessageTypeSchema>;
export declare const listCustomMessageTypesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    actif: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["nom", "actif"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "nom" | "actif";
    sort_order: "asc" | "desc";
    actif?: boolean | undefined;
    search?: string | undefined;
}, {
    actif?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "actif" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ListCustomMessageTypesQuery = z.infer<typeof listCustomMessageTypesSchema>;
export declare const activeCustomMessageTypesSchema: z.ZodObject<{
    sort_by: z.ZodDefault<z.ZodEnum<["nom"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sort_by: "nom";
    sort_order: "asc" | "desc";
}, {
    sort_by?: "nom" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ActiveCustomMessageTypesQuery = z.infer<typeof activeCustomMessageTypesSchema>;
export declare const customMessageTypeIdSchema: z.ZodNumber;
export declare const customMessageTypeIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const customMessageTypeIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type CustomMessageTypeIdParam = z.infer<typeof customMessageTypeIdParamSchema>;
export declare const customMessageTypeResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actif: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    actif: boolean;
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
    actif?: boolean | undefined;
}>;
export type CustomMessageTypeResponse = z.infer<typeof customMessageTypeResponseSchema>;
export declare const customMessageTypesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        actif: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        actif: boolean;
        description?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        description?: string | null | undefined;
        actif?: boolean | undefined;
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
        actif: boolean;
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
        actif?: boolean | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type CustomMessageTypesListResponse = z.infer<typeof customMessageTypesListResponseSchema>;
export declare const customMessageTypeStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    active: z.ZodNumber;
    inactive: z.ZodNumber;
    templates_count: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    active: number;
    total: number;
    templates_count: Record<string, number>;
    inactive: number;
}, {
    active: number;
    total: number;
    templates_count: Record<string, number>;
    inactive: number;
}>;
export type CustomMessageTypeStats = z.infer<typeof customMessageTypeStatsSchema>;
//# sourceMappingURL=custom-message-type.validators.d.ts.map