import { z } from "zod";
export declare const alertActionTypeSchema: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
export declare const alertActionBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    alerte_id: z.ZodNumber;
    action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    date_action: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    date_action: Date;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
}, {
    id: number;
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    date_action: Date;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
}>;
export type AlertAction = z.infer<typeof alertActionBaseSchema>;
export declare const createAlertActionSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    alerte_id: z.ZodNumber;
    action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    date_action: z.ZodDate;
}, "description" | "effectue_par" | "action_type" | "alerte_id">, "strip", z.ZodTypeAny, {
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
}, {
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
}>;
export type CreateAlertAction = z.infer<typeof createAlertActionSchema>;
export declare const listAlertActionsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    alerte_id: z.ZodOptional<z.ZodNumber>;
    action_type: z.ZodOptional<z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>>;
    effectue_par: z.ZodOptional<z.ZodNumber>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_action", "action_type"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "action_type" | "date_action";
    sort_order: "asc" | "desc";
    effectue_par?: number | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    action_type?: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre" | undefined;
    alerte_id?: number | undefined;
}, {
    effectue_par?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "action_type" | "date_action" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    action_type?: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre" | undefined;
    alerte_id?: number | undefined;
}>;
export type ListAlertActionsQuery = z.infer<typeof listAlertActionsSchema>;
export declare const alertHistorySchema: z.ZodObject<{
    alerte_id: z.ZodNumber;
    page: z.ZodDefault<z.ZodNumber>;
    page_size: z.ZodDefault<z.ZodNumber>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    sort_order: "asc" | "desc";
    page_size: number;
    alerte_id: number;
}, {
    alerte_id: number;
    page?: number | undefined;
    sort_order?: "asc" | "desc" | undefined;
    page_size?: number | undefined;
}>;
export type AlertHistoryQuery = z.infer<typeof alertHistorySchema>;
export declare const actionsByTypeSchema: z.ZodObject<{
    action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
    alerte_id: z.ZodOptional<z.ZodNumber>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    alerte_id?: number | undefined;
}, {
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    alerte_id?: number | undefined;
}>;
export type ActionsByTypeQuery = z.infer<typeof actionsByTypeSchema>;
export declare const actionsByUserSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    effectue_par: z.ZodNumber;
    action_type: z.ZodOptional<z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_action"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    effectue_par: number;
    page: number;
    limit: number;
    sort_by: "date_action";
    sort_order: "asc" | "desc";
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    action_type?: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre" | undefined;
}, {
    effectue_par: number;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "date_action" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    action_type?: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre" | undefined;
}>;
export type ActionsByUserQuery = z.infer<typeof actionsByUserSchema>;
export declare const alertActionIdSchema: z.ZodNumber;
export declare const alertActionIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const alertActionIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type AlertActionIdParam = z.infer<typeof alertActionIdParamSchema>;
export declare const alertIdParamSchema: z.ZodObject<{
    alerte_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    alerte_id: number;
}, {
    alerte_id: string;
}>;
export type AlertIdParam = z.infer<typeof alertIdParamSchema>;
export declare const alertActionResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    alerte_id: z.ZodNumber;
    action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    date_action: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    date_action: Date;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
}, {
    id: number;
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    date_action: Date;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
}>;
export type AlertActionResponse = z.infer<typeof alertActionResponseSchema>;
export declare const alertActionsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        alerte_id: z.ZodNumber;
        action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        date_action: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
    }, {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
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
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
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
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type AlertActionsListResponse = z.infer<typeof alertActionsListResponseSchema>;
export declare const alertActionStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    by_type: z.ZodObject<{
        message_envoye: z.ZodNumber;
        information_mise_a_jour: z.ZodNumber;
        paiement_recu: z.ZodNumber;
        statut_change: z.ZodNumber;
        autre: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        message_envoye: number;
        information_mise_a_jour: number;
        paiement_recu: number;
        statut_change: number;
        autre: number;
    }, {
        message_envoye: number;
        information_mise_a_jour: number;
        paiement_recu: number;
        statut_change: number;
        autre: number;
    }>;
    by_user: z.ZodRecord<z.ZodString, z.ZodNumber>;
    recent_actions: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        alerte_id: z.ZodNumber;
        action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        date_action: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
    }, {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    total: number;
    by_type: {
        message_envoye: number;
        information_mise_a_jour: number;
        paiement_recu: number;
        statut_change: number;
        autre: number;
    };
    by_user: Record<string, number>;
    recent_actions: {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
    }[];
}, {
    total: number;
    by_type: {
        message_envoye: number;
        information_mise_a_jour: number;
        paiement_recu: number;
        statut_change: number;
        autre: number;
    };
    by_user: Record<string, number>;
    recent_actions: {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
    }[];
}>;
export type AlertActionStats = z.infer<typeof alertActionStatsSchema>;
export declare const alertTimelineEntrySchema: z.ZodObject<{
    id: z.ZodNumber;
    alerte_id: z.ZodNumber;
    action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    date_action: z.ZodDate;
} & {
    user_name: z.ZodOptional<z.ZodString>;
    alert_status_before: z.ZodOptional<z.ZodString>;
    alert_status_after: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    date_action: Date;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
    user_name?: string | undefined;
    alert_status_before?: string | undefined;
    alert_status_after?: string | undefined;
}, {
    id: number;
    action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
    alerte_id: number;
    date_action: Date;
    description?: string | null | undefined;
    effectue_par?: number | null | undefined;
    user_name?: string | undefined;
    alert_status_before?: string | undefined;
    alert_status_after?: string | undefined;
}>;
export type AlertTimelineEntry = z.infer<typeof alertTimelineEntrySchema>;
export declare const alertTimelineSchema: z.ZodObject<{
    alerte_id: z.ZodNumber;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        alerte_id: z.ZodNumber;
        action_type: z.ZodEnum<["message_envoye", "information_mise_a_jour", "paiement_recu", "statut_change", "autre"]>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        date_action: z.ZodDate;
    } & {
        user_name: z.ZodOptional<z.ZodString>;
        alert_status_before: z.ZodOptional<z.ZodString>;
        alert_status_after: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
        user_name?: string | undefined;
        alert_status_before?: string | undefined;
        alert_status_after?: string | undefined;
    }, {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
        user_name?: string | undefined;
        alert_status_before?: string | undefined;
        alert_status_after?: string | undefined;
    }>, "many">;
    total_actions: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    entries: {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
        user_name?: string | undefined;
        alert_status_before?: string | undefined;
        alert_status_after?: string | undefined;
    }[];
    alerte_id: number;
    total_actions: number;
}, {
    entries: {
        id: number;
        action_type: "message_envoye" | "information_mise_a_jour" | "paiement_recu" | "statut_change" | "autre";
        alerte_id: number;
        date_action: Date;
        description?: string | null | undefined;
        effectue_par?: number | null | undefined;
        user_name?: string | undefined;
        alert_status_before?: string | undefined;
        alert_status_after?: string | undefined;
    }[];
    alerte_id: number;
    total_actions: number;
}>;
export type AlertTimeline = z.infer<typeof alertTimelineSchema>;
//# sourceMappingURL=alert-action.validators.d.ts.map