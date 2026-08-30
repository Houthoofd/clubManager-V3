import { z } from "zod";
export declare const groupBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    created_at: Date;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    nom: string;
    created_at: Date;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}>;
export declare const createGroupSchema: z.ZodObject<{
    nom: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    description?: string | null | undefined;
}, {
    nom: string;
    description?: string | null | undefined;
}>;
export declare const updateGroupSchema: z.ZodEffects<z.ZodObject<{
    nom: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    nom?: string | undefined;
    description?: string | null | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
}>, {
    nom?: string | undefined;
    description?: string | null | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
}>;
declare const groupSortByValues: readonly ["nom", "created_at", "updated_at"];
export declare const listGroupsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<["nom", "created_at", "updated_at"]>>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "nom" | "created_at" | "updated_at";
    sort_order: "asc" | "desc";
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "created_at" | "updated_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export declare const groupIdSchema: z.ZodNumber;
export declare const groupIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const groupIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const groupResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    created_at: Date;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    nom: string;
    created_at: Date;
    description?: string | null | undefined;
    updated_at?: Date | null | undefined;
}>;
export declare const groupsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodEffects<z.ZodString, string, string>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        created_at: z.ZodDate;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        created_at: Date;
        description?: string | null | undefined;
        updated_at?: Date | null | undefined;
    }, {
        id: number;
        nom: string;
        created_at: Date;
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
        nom: string;
        created_at: Date;
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
        nom: string;
        created_at: Date;
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
export declare const groupStatsSchema: z.ZodObject<{
    total_groups: z.ZodNumber;
    total_users_assigned: z.ZodNumber;
    groups_with_users: z.ZodNumber;
    groups_without_users: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_groups: number;
    total_users_assigned: number;
    groups_with_users: number;
    groups_without_users: number;
}, {
    total_groups: number;
    total_users_assigned: number;
    groups_with_users: number;
    groups_without_users: number;
}>;
export type Group = z.infer<typeof groupBaseSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type ListGroupsQuery = z.infer<typeof listGroupsSchema>;
export type GroupIdParam = z.infer<typeof groupIdParamSchema>;
export type GroupResponse = z.infer<typeof groupResponseSchema>;
export type GroupsListResponse = z.infer<typeof groupsListResponseSchema>;
export type GroupStats = z.infer<typeof groupStatsSchema>;
export type GroupSortBy = (typeof groupSortByValues)[number];
export {};
//# sourceMappingURL=group.validators.d.ts.map