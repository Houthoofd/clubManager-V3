import { z } from "zod";
export declare const informationBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    cle: z.ZodString;
    valeur: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    cle: string;
    valeur: string;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    cle: string;
    valeur: string;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}>;
export type Information = z.infer<typeof informationBaseSchema>;
export declare const createInformationSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    cle: z.ZodString;
    valeur: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "description" | "cle" | "valeur">, "strip", z.ZodTypeAny, {
    cle: string;
    valeur: string;
    description?: string | null | undefined;
}, {
    cle: string;
    valeur: string;
    description?: string | null | undefined;
}>;
export type CreateInformation = z.infer<typeof createInformationSchema>;
export declare const updateInformationSchema: z.ZodObject<{
    valeur: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | null | undefined;
    valeur?: string | undefined;
}, {
    description?: string | null | undefined;
    valeur?: string | undefined;
}>;
export type UpdateInformation = z.infer<typeof updateInformationSchema>;
export declare const listInformationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    search: z.ZodOptional<z.ZodString>;
    cle: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["cle", "updated_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "updated_at" | "cle";
    sort_order: "asc" | "desc";
    search?: string | undefined;
    cle?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    cle?: string | undefined;
    sort_by?: "updated_at" | "cle" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ListInformationsQuery = z.infer<typeof listInformationsSchema>;
export declare const getInformationByKeySchema: z.ZodObject<{
    cle: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cle: string;
}, {
    cle: string;
}>;
export type GetInformationByKey = z.infer<typeof getInformationByKeySchema>;
export declare const informationKeyExistsSchema: z.ZodObject<{
    cle: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cle: string;
}, {
    cle: string;
}>;
export type InformationKeyExists = z.infer<typeof informationKeyExistsSchema>;
export declare const informationIdSchema: z.ZodNumber;
export declare const informationIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const informationIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type InformationIdParam = z.infer<typeof informationIdParamSchema>;
export declare const informationKeyParamSchema: z.ZodObject<{
    cle: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cle: string;
}, {
    cle: string;
}>;
export type InformationKeyParam = z.infer<typeof informationKeyParamSchema>;
export declare const bulkUpsertInformationsSchema: z.ZodObject<{
    informations: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        cle: z.ZodString;
        valeur: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "description" | "cle" | "valeur">, "strip", z.ZodTypeAny, {
        cle: string;
        valeur: string;
        description?: string | null | undefined;
    }, {
        cle: string;
        valeur: string;
        description?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    informations: {
        cle: string;
        valeur: string;
        description?: string | null | undefined;
    }[];
}, {
    informations: {
        cle: string;
        valeur: string;
        description?: string | null | undefined;
    }[];
}>;
export type BulkUpsertInformations = z.infer<typeof bulkUpsertInformationsSchema>;
export declare const bulkDeleteInformationsSchema: z.ZodObject<{
    information_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    information_ids: number[];
}, {
    information_ids: number[];
}>;
export type BulkDeleteInformations = z.infer<typeof bulkDeleteInformationsSchema>;
export declare const informationResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    cle: z.ZodString;
    valeur: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    cle: string;
    valeur: string;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    cle: string;
    valeur: string;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}>;
export type InformationResponse = z.infer<typeof informationResponseSchema>;
export declare const informationsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        cle: z.ZodString;
        valeur: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }, {
        id: number;
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
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
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
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
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type InformationsListResponse = z.infer<typeof informationsListResponseSchema>;
export declare const informationStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    with_description: z.ZodNumber;
    without_description: z.ZodNumber;
    recently_updated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    with_description: number;
    without_description: number;
    recently_updated: number;
}, {
    total: number;
    with_description: number;
    without_description: number;
    recently_updated: number;
}>;
export type InformationStats = z.infer<typeof informationStatsSchema>;
export declare const groupedInformationsSchema: z.ZodObject<{
    category: z.ZodString;
    informations: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        cle: z.ZodString;
        valeur: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }, {
        id: number;
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }>, "many">;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    informations: {
        id: number;
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }[];
    count: number;
    category: string;
}, {
    informations: {
        id: number;
        cle: string;
        valeur: string;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }[];
    count: number;
    category: string;
}>;
export type GroupedInformations = z.infer<typeof groupedInformationsSchema>;
//# sourceMappingURL=information.validators.d.ts.map