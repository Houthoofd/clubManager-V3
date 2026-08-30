import { z } from "zod";
export declare const groupUserBaseSchema: z.ZodObject<{
    groupe_id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    created_at: Date;
    utilisateur_id: number;
    groupe_id: number;
}, {
    created_at: Date;
    utilisateur_id: number;
    groupe_id: number;
}>;
export declare const assignUserToGroupSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    groupe_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    groupe_id: number;
}, {
    utilisateur_id: number;
    groupe_id: number;
}>;
export declare const unassignUserFromGroupSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    groupe_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    groupe_id: number;
}, {
    utilisateur_id: number;
    groupe_id: number;
}>;
export declare const bulkAssignUsersSchema: z.ZodObject<{
    groupe_id: z.ZodNumber;
    utilisateur_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    groupe_id: number;
    utilisateur_ids: number[];
}, {
    groupe_id: number;
    utilisateur_ids: number[];
}>;
export declare const bulkUnassignUsersSchema: z.ZodObject<{
    groupe_id: z.ZodNumber;
    utilisateur_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    groupe_id: number;
    utilisateur_ids: number[];
}, {
    groupe_id: number;
    utilisateur_ids: number[];
}>;
declare const groupUserSortByValues: readonly ["created_at", "utilisateur_id"];
export declare const listGroupUsersSchema: z.ZodObject<{
    groupe_id: z.ZodNumber;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<["created_at", "utilisateur_id"]>>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "created_at" | "utilisateur_id";
    sort_order: "asc" | "desc";
    groupe_id: number;
}, {
    groupe_id: number;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
declare const userGroupSortByValues: readonly ["created_at", "groupe_id"];
export declare const listUserGroupsSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<["created_at", "groupe_id"]>>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    page: number;
    limit: number;
    sort_by: "created_at" | "groupe_id";
    sort_order: "asc" | "desc";
}, {
    utilisateur_id: number;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "groupe_id" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export declare const groupUserResponseSchema: z.ZodObject<{
    groupe_id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    created_at: Date;
    utilisateur_id: number;
    groupe_id: number;
}, {
    created_at: Date;
    utilisateur_id: number;
    groupe_id: number;
}>;
export declare const groupUsersListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        groupe_id: z.ZodNumber;
        utilisateur_id: z.ZodNumber;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
    }, {
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
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
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}, {
    data: {
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export declare const userGroupsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        groupe_id: z.ZodNumber;
        utilisateur_id: z.ZodNumber;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
    }, {
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
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
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}, {
    data: {
        created_at: Date;
        utilisateur_id: number;
        groupe_id: number;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export declare const bulkOperationResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    assigned_count: z.ZodOptional<z.ZodNumber>;
    unassigned_count: z.ZodOptional<z.ZodNumber>;
    errors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    errors?: string[] | undefined;
    assigned_count?: number | undefined;
    unassigned_count?: number | undefined;
}, {
    success: boolean;
    errors?: string[] | undefined;
    assigned_count?: number | undefined;
    unassigned_count?: number | undefined;
}>;
export type GroupUser = z.infer<typeof groupUserBaseSchema>;
export type AssignUserToGroup = z.infer<typeof assignUserToGroupSchema>;
export type UnassignUserFromGroup = z.infer<typeof unassignUserFromGroupSchema>;
export type BulkAssignUsers = z.infer<typeof bulkAssignUsersSchema>;
export type BulkUnassignUsers = z.infer<typeof bulkUnassignUsersSchema>;
export type ListGroupUsersQuery = z.infer<typeof listGroupUsersSchema>;
export type ListUserGroupsQuery = z.infer<typeof listUserGroupsSchema>;
export type GroupUserResponse = z.infer<typeof groupUserResponseSchema>;
export type GroupUsersListResponse = z.infer<typeof groupUsersListResponseSchema>;
export type UserGroupsListResponse = z.infer<typeof userGroupsListResponseSchema>;
export type BulkOperationResponse = z.infer<typeof bulkOperationResponseSchema>;
export type GroupUserSortBy = (typeof groupUserSortByValues)[number];
export type UserGroupSortBy = (typeof userGroupSortByValues)[number];
export {};
//# sourceMappingURL=group-user.validators.d.ts.map