import { z } from "zod";
export declare const alertStatusSchema: z.ZodEnum<["active", "resolue", "ignoree"]>;
export declare const alertContextDataSchema: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
export declare const userAlertBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    alerte_type_id: z.ZodNumber;
    statut: z.ZodDefault<z.ZodEnum<["active", "resolue", "ignoree"]>>;
    message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    donnees_contexte: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    date_detection: z.ZodDate;
    date_resolution: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    resolu_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lu: z.ZodDefault<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    utilisateur_id: number;
    statut: "active" | "resolue" | "ignoree";
    lu: boolean;
    alerte_type_id: number;
    date_detection: Date;
    message?: string | null | undefined;
    date_lecture?: Date | null | undefined;
    donnees_contexte?: Record<string, unknown> | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}, {
    id: number;
    utilisateur_id: number;
    alerte_type_id: number;
    date_detection: Date;
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
    donnees_contexte?: Record<string, unknown> | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}>;
export type UserAlert = z.infer<typeof userAlertBaseSchema>;
export declare const createUserAlertSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    alerte_type_id: z.ZodNumber;
    statut: z.ZodDefault<z.ZodEnum<["active", "resolue", "ignoree"]>>;
    message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    donnees_contexte: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    date_detection: z.ZodDate;
    date_resolution: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    resolu_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lu: z.ZodDefault<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "message" | "utilisateur_id" | "statut" | "alerte_type_id" | "donnees_contexte">, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    statut: "active" | "resolue" | "ignoree";
    alerte_type_id: number;
    message?: string | null | undefined;
    donnees_contexte?: Record<string, unknown> | null | undefined;
}, {
    utilisateur_id: number;
    alerte_type_id: number;
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    donnees_contexte?: Record<string, unknown> | null | undefined;
}>;
export type CreateUserAlert = z.infer<typeof createUserAlertSchema>;
export declare const updateUserAlertSchema: z.ZodEffects<z.ZodObject<{
    statut: z.ZodOptional<z.ZodEnum<["active", "resolue", "ignoree"]>>;
    message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    resolu_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lu: z.ZodOptional<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    date_resolution: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}, {
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}>, {
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}, {
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}>;
export type UpdateUserAlert = z.infer<typeof updateUserAlertSchema>;
export declare const resolveAlertSchema: z.ZodObject<{
    resolu_par: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    resolu_par: number;
    notes?: string | undefined;
}, {
    resolu_par: number;
    notes?: string | undefined;
}>;
export type ResolveAlert = z.infer<typeof resolveAlertSchema>;
export declare const ignoreAlertSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export type IgnoreAlert = z.infer<typeof ignoreAlertSchema>;
export declare const listUserAlertsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    alerte_type_id: z.ZodOptional<z.ZodNumber>;
    statut: z.ZodOptional<z.ZodEnum<["active", "resolue", "ignoree"]>>;
    lu: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    resolu_par: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_detection", "date_resolution", "statut"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "statut" | "date_detection" | "date_resolution";
    sort_order: "asc" | "desc";
    utilisateur_id?: number | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    alerte_type_id?: number | undefined;
    resolu_par?: number | undefined;
}, {
    utilisateur_id?: number | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    lu?: string | undefined;
    sort_by?: "statut" | "date_detection" | "date_resolution" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    alerte_type_id?: number | undefined;
    resolu_par?: number | undefined;
}>;
export type ListUserAlertsQuery = z.infer<typeof listUserAlertsSchema>;
export declare const activeAlertsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    alerte_type_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_detection"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "date_detection";
    sort_order: "asc" | "desc";
    utilisateur_id?: number | undefined;
    alerte_type_id?: number | undefined;
}, {
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "date_detection" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    alerte_type_id?: number | undefined;
}>;
export type ActiveAlertsQuery = z.infer<typeof activeAlertsSchema>;
export declare const resolvedAlertsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    resolu_par: z.ZodOptional<z.ZodNumber>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_resolution", "date_detection"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "date_detection" | "date_resolution";
    sort_order: "asc" | "desc";
    utilisateur_id?: number | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    resolu_par?: number | undefined;
}, {
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "date_detection" | "date_resolution" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    resolu_par?: number | undefined;
}>;
export type ResolvedAlertsQuery = z.infer<typeof resolvedAlertsSchema>;
export declare const userAlertIdSchema: z.ZodNumber;
export declare const userAlertIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const userAlertIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type UserAlertIdParam = z.infer<typeof userAlertIdParamSchema>;
export declare const bulkMarkReadAlertsSchema: z.ZodObject<{
    alert_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    alert_ids: number[];
}, {
    alert_ids: number[];
}>;
export type BulkMarkReadAlerts = z.infer<typeof bulkMarkReadAlertsSchema>;
export declare const bulkResolveAlertsSchema: z.ZodObject<{
    alert_ids: z.ZodArray<z.ZodNumber, "many">;
    resolu_par: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    resolu_par: number;
    alert_ids: number[];
    notes?: string | undefined;
}, {
    resolu_par: number;
    alert_ids: number[];
    notes?: string | undefined;
}>;
export type BulkResolveAlerts = z.infer<typeof bulkResolveAlertsSchema>;
export declare const userAlertResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    alerte_type_id: z.ZodNumber;
    statut: z.ZodDefault<z.ZodEnum<["active", "resolue", "ignoree"]>>;
    message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    donnees_contexte: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    date_detection: z.ZodDate;
    date_resolution: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    resolu_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lu: z.ZodDefault<z.ZodBoolean>;
    date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    utilisateur_id: number;
    statut: "active" | "resolue" | "ignoree";
    lu: boolean;
    alerte_type_id: number;
    date_detection: Date;
    message?: string | null | undefined;
    date_lecture?: Date | null | undefined;
    donnees_contexte?: Record<string, unknown> | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}, {
    id: number;
    utilisateur_id: number;
    alerte_type_id: number;
    date_detection: Date;
    message?: string | null | undefined;
    statut?: "active" | "resolue" | "ignoree" | undefined;
    lu?: boolean | undefined;
    date_lecture?: Date | null | undefined;
    donnees_contexte?: Record<string, unknown> | null | undefined;
    date_resolution?: Date | null | undefined;
    notes?: string | null | undefined;
    resolu_par?: number | null | undefined;
}>;
export type UserAlertResponse = z.infer<typeof userAlertResponseSchema>;
export declare const userAlertsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        utilisateur_id: z.ZodNumber;
        alerte_type_id: z.ZodNumber;
        statut: z.ZodDefault<z.ZodEnum<["active", "resolue", "ignoree"]>>;
        message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        donnees_contexte: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        date_detection: z.ZodDate;
        date_resolution: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        resolu_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        lu: z.ZodDefault<z.ZodBoolean>;
        date_lecture: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        utilisateur_id: number;
        statut: "active" | "resolue" | "ignoree";
        lu: boolean;
        alerte_type_id: number;
        date_detection: Date;
        message?: string | null | undefined;
        date_lecture?: Date | null | undefined;
        donnees_contexte?: Record<string, unknown> | null | undefined;
        date_resolution?: Date | null | undefined;
        notes?: string | null | undefined;
        resolu_par?: number | null | undefined;
    }, {
        id: number;
        utilisateur_id: number;
        alerte_type_id: number;
        date_detection: Date;
        message?: string | null | undefined;
        statut?: "active" | "resolue" | "ignoree" | undefined;
        lu?: boolean | undefined;
        date_lecture?: Date | null | undefined;
        donnees_contexte?: Record<string, unknown> | null | undefined;
        date_resolution?: Date | null | undefined;
        notes?: string | null | undefined;
        resolu_par?: number | null | undefined;
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
        utilisateur_id: number;
        statut: "active" | "resolue" | "ignoree";
        lu: boolean;
        alerte_type_id: number;
        date_detection: Date;
        message?: string | null | undefined;
        date_lecture?: Date | null | undefined;
        donnees_contexte?: Record<string, unknown> | null | undefined;
        date_resolution?: Date | null | undefined;
        notes?: string | null | undefined;
        resolu_par?: number | null | undefined;
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
        utilisateur_id: number;
        alerte_type_id: number;
        date_detection: Date;
        message?: string | null | undefined;
        statut?: "active" | "resolue" | "ignoree" | undefined;
        lu?: boolean | undefined;
        date_lecture?: Date | null | undefined;
        donnees_contexte?: Record<string, unknown> | null | undefined;
        date_resolution?: Date | null | undefined;
        notes?: string | null | undefined;
        resolu_par?: number | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type UserAlertsListResponse = z.infer<typeof userAlertsListResponseSchema>;
export declare const userAlertStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    active: z.ZodNumber;
    resolved: z.ZodNumber;
    ignored: z.ZodNumber;
    unread: z.ZodNumber;
    by_type: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    active: number;
    total: number;
    by_type: Record<string, number>;
    unread: number;
    resolved: number;
    ignored: number;
}, {
    active: number;
    total: number;
    by_type: Record<string, number>;
    unread: number;
    resolved: number;
    ignored: number;
}>;
export type UserAlertStats = z.infer<typeof userAlertStatsSchema>;
//# sourceMappingURL=user-alert.validators.d.ts.map