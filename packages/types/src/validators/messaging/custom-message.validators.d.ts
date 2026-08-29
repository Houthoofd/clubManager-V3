import { z } from "zod";
export declare const customMessageBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    type_id: z.ZodNumber;
    titre: z.ZodString;
    contenu: z.ZodString;
    actif: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    actif: boolean;
    created_at: Date;
    contenu: string;
    type_id: number;
    titre: string;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    created_at: Date;
    contenu: string;
    type_id: number;
    titre: string;
    actif?: boolean | undefined;
    updated_at?: Date | null | undefined;
}>;
export type CustomMessage = z.infer<typeof customMessageBaseSchema>;
export declare const createCustomMessageSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    type_id: z.ZodNumber;
    titre: z.ZodString;
    contenu: z.ZodString;
    actif: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "actif" | "contenu" | "type_id" | "titre">, "strip", z.ZodTypeAny, {
    actif: boolean;
    contenu: string;
    type_id: number;
    titre: string;
}, {
    contenu: string;
    type_id: number;
    titre: string;
    actif?: boolean | undefined;
}>;
export type CreateCustomMessage = z.infer<typeof createCustomMessageSchema>;
export declare const updateCustomMessageSchema: z.ZodObject<{
    actif: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    contenu: z.ZodOptional<z.ZodString>;
    type_id: z.ZodOptional<z.ZodNumber>;
    titre: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    actif?: boolean | undefined;
    contenu?: string | undefined;
    type_id?: number | undefined;
    titre?: string | undefined;
}, {
    actif?: boolean | undefined;
    contenu?: string | undefined;
    type_id?: number | undefined;
    titre?: string | undefined;
}>;
export type UpdateCustomMessage = z.infer<typeof updateCustomMessageSchema>;
export declare const listCustomMessagesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    type_id: z.ZodOptional<z.ZodNumber>;
    actif: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    search: z.ZodOptional<z.ZodString>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at", "updated_at", "titre", "actif"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "actif" | "created_at" | "updated_at" | "titre";
    sort_order: "asc" | "desc";
    actif?: boolean | undefined;
    search?: string | undefined;
    type_id?: number | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    actif?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    type_id?: number | undefined;
    sort_by?: "actif" | "created_at" | "updated_at" | "titre" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export type ListCustomMessagesQuery = z.infer<typeof listCustomMessagesSchema>;
export declare const activeCustomMessagesByTypeSchema: z.ZodObject<{
    type_id: z.ZodNumber;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at", "titre"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type_id: number;
    sort_by: "created_at" | "titre";
    sort_order: "asc" | "desc";
}, {
    type_id: number;
    sort_by?: "created_at" | "titre" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ActiveCustomMessagesByTypeQuery = z.infer<typeof activeCustomMessagesByTypeSchema>;
export declare const activeCustomMessagesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    type_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at", "titre"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "created_at" | "titre";
    sort_order: "asc" | "desc";
    type_id?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    type_id?: number | undefined;
    sort_by?: "created_at" | "titre" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ActiveCustomMessagesQuery = z.infer<typeof activeCustomMessagesSchema>;
export declare const customMessageIdSchema: z.ZodNumber;
export declare const customMessageIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const customMessageIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type CustomMessageIdParam = z.infer<typeof customMessageIdParamSchema>;
export declare const activateCustomMessageSchema: z.ZodObject<{
    actif: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    actif: true;
}, {
    actif: true;
}>;
export type ActivateCustomMessage = z.infer<typeof activateCustomMessageSchema>;
export declare const deactivateCustomMessageSchema: z.ZodObject<{
    actif: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    actif: false;
}, {
    actif: false;
}>;
export type DeactivateCustomMessage = z.infer<typeof deactivateCustomMessageSchema>;
export declare const bulkToggleCustomMessagesSchema: z.ZodObject<{
    message_ids: z.ZodArray<z.ZodNumber, "many">;
    actif: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    actif: boolean;
    message_ids: number[];
}, {
    actif: boolean;
    message_ids: number[];
}>;
export type BulkToggleCustomMessages = z.infer<typeof bulkToggleCustomMessagesSchema>;
export declare const templateVariablesSchema: z.ZodObject<{
    variables: z.ZodArray<z.ZodString, "many">;
    exemple: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    variables: string[];
    exemple?: Record<string, string> | undefined;
}, {
    variables: string[];
    exemple?: Record<string, string> | undefined;
}>;
export type TemplateVariables = z.infer<typeof templateVariablesSchema>;
export declare const renderTemplateSchema: z.ZodObject<{
    template_id: z.ZodNumber;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, unknown>;
    template_id: number;
}, {
    data: Record<string, unknown>;
    template_id: number;
}>;
export type RenderTemplate = z.infer<typeof renderTemplateSchema>;
export declare const renderedTemplateSchema: z.ZodObject<{
    titre: z.ZodString;
    contenu: z.ZodString;
    variables_used: z.ZodArray<z.ZodString, "many">;
    missing_variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    contenu: string;
    titre: string;
    variables_used: string[];
    missing_variables?: string[] | undefined;
}, {
    contenu: string;
    titre: string;
    variables_used: string[];
    missing_variables?: string[] | undefined;
}>;
export type RenderedTemplate = z.infer<typeof renderedTemplateSchema>;
export declare const customMessageResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    type_id: z.ZodNumber;
    titre: z.ZodString;
    contenu: z.ZodString;
    actif: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    actif: boolean;
    created_at: Date;
    contenu: string;
    type_id: number;
    titre: string;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    created_at: Date;
    contenu: string;
    type_id: number;
    titre: string;
    actif?: boolean | undefined;
    updated_at?: Date | null | undefined;
}>;
export type CustomMessageResponse = z.infer<typeof customMessageResponseSchema>;
export declare const customMessagesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        type_id: z.ZodNumber;
        titre: z.ZodString;
        contenu: z.ZodString;
        actif: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodDate;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        actif: boolean;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        updated_at?: Date | null | undefined;
    }, {
        id: number;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        actif?: boolean | undefined;
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
        actif: boolean;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
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
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        actif?: boolean | undefined;
        updated_at?: Date | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type CustomMessagesListResponse = z.infer<typeof customMessagesListResponseSchema>;
export declare const customMessageStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    active: z.ZodNumber;
    inactive: z.ZodNumber;
    by_type: z.ZodRecord<z.ZodString, z.ZodNumber>;
    most_used: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        type_id: z.ZodNumber;
        titre: z.ZodString;
        contenu: z.ZodString;
        actif: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodDate;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        actif: boolean;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        updated_at?: Date | null | undefined;
    }, {
        id: number;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        actif?: boolean | undefined;
        updated_at?: Date | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    active: number;
    total: number;
    by_type: Record<string, number>;
    inactive: number;
    most_used: {
        id: number;
        actif: boolean;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        updated_at?: Date | null | undefined;
    }[];
}, {
    active: number;
    total: number;
    by_type: Record<string, number>;
    inactive: number;
    most_used: {
        id: number;
        created_at: Date;
        contenu: string;
        type_id: number;
        titre: string;
        actif?: boolean | undefined;
        updated_at?: Date | null | undefined;
    }[];
}>;
export type CustomMessageStats = z.infer<typeof customMessageStatsSchema>;
export declare const customMessagePreviewSchema: z.ZodObject<{
    id: z.ZodNumber;
    type_id: z.ZodNumber;
    type_name: z.ZodString;
    titre: z.ZodString;
    contenu_preview: z.ZodString;
    actif: z.ZodBoolean;
    variables: z.ZodArray<z.ZodString, "many">;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    actif: boolean;
    created_at: Date;
    type_id: number;
    titre: string;
    variables: string[];
    type_name: string;
    contenu_preview: string;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    actif: boolean;
    created_at: Date;
    type_id: number;
    titre: string;
    variables: string[];
    type_name: string;
    contenu_preview: string;
    updated_at?: Date | null | undefined;
}>;
export type CustomMessagePreview = z.infer<typeof customMessagePreviewSchema>;
//# sourceMappingURL=custom-message.validators.d.ts.map