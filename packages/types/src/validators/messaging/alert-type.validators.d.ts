import { z } from "zod";
export declare const alertSeveritySchema: z.ZodEnum<["info", "warning", "critical"]>;
export declare const alertTypeBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    severite: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    severite: "info" | "warning" | "critical";
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}>;
export type AlertType = z.infer<typeof alertTypeBaseSchema>;
export declare const createAlertTypeSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    severite: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
}, "nom" | "description" | "severite">, "strip", z.ZodTypeAny, {
    nom: string;
    severite: "info" | "warning" | "critical";
    description?: string | null | undefined;
}, {
    nom: string;
    description?: string | null | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}>;
export type CreateAlertType = z.infer<typeof createAlertTypeSchema>;
export declare const updateAlertTypeSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    severite: z.ZodOptional<z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    description?: string | null | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}>;
export type UpdateAlertType = z.infer<typeof updateAlertTypeSchema>;
export declare const listAlertTypesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    severite: z.ZodOptional<z.ZodEnum<["info", "warning", "critical"]>>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["nom", "severite"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "nom" | "severite";
    sort_order: "asc" | "desc";
    search?: string | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "severite" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}>;
export type ListAlertTypesQuery = z.infer<typeof listAlertTypesSchema>;
export declare const alertTypesBySeveritySchema: z.ZodObject<{
    severite: z.ZodEnum<["info", "warning", "critical"]>;
}, "strip", z.ZodTypeAny, {
    severite: "info" | "warning" | "critical";
}, {
    severite: "info" | "warning" | "critical";
}>;
export type AlertTypesBySeverityQuery = z.infer<typeof alertTypesBySeveritySchema>;
export declare const alertTypeIdSchema: z.ZodNumber;
export declare const alertTypeIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const alertTypeIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type AlertTypeIdParam = z.infer<typeof alertTypeIdParamSchema>;
export declare const alertTypeResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    severite: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    severite: "info" | "warning" | "critical";
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
    severite?: "info" | "warning" | "critical" | undefined;
}>;
export type AlertTypeResponse = z.infer<typeof alertTypeResponseSchema>;
export declare const alertTypesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        severite: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        severite: "info" | "warning" | "critical";
        description?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        description?: string | null | undefined;
        severite?: "info" | "warning" | "critical" | undefined;
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
        severite: "info" | "warning" | "critical";
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
        severite?: "info" | "warning" | "critical" | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type AlertTypesListResponse = z.infer<typeof alertTypesListResponseSchema>;
export declare const alertTypeStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    by_severity: z.ZodObject<{
        info: z.ZodNumber;
        warning: z.ZodNumber;
        critical: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        info: number;
        warning: number;
        critical: number;
    }, {
        info: number;
        warning: number;
        critical: number;
    }>;
}, "strip", z.ZodTypeAny, {
    total: number;
    by_severity: {
        info: number;
        warning: number;
        critical: number;
    };
}, {
    total: number;
    by_severity: {
        info: number;
        warning: number;
        critical: number;
    };
}>;
export type AlertTypeStats = z.infer<typeof alertTypeStatsSchema>;
//# sourceMappingURL=alert-type.validators.d.ts.map