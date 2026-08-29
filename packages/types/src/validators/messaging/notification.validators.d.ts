import { z } from "zod";
export declare const notificationTypeSchema: z.ZodEnum<["info", "warning", "error", "success"]>;
export declare const notificationBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "success"]>>;
    titre: z.ZodString;
    message: z.ZodString;
    lu: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    message: string;
    type: "info" | "warning" | "error" | "success";
    created_at: Date;
    utilisateur_id: number;
    lu: boolean;
    titre: string;
}, {
    id: number;
    message: string;
    created_at: Date;
    utilisateur_id: number;
    titre: string;
    type?: "info" | "warning" | "error" | "success" | undefined;
    lu?: boolean | undefined;
}>;
export type Notification = z.infer<typeof notificationBaseSchema>;
export declare const createNotificationSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "success"]>>;
    titre: z.ZodString;
    message: z.ZodString;
    lu: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
}, "message" | "type" | "utilisateur_id" | "titre">, "strip", z.ZodTypeAny, {
    message: string;
    type: "info" | "warning" | "error" | "success";
    utilisateur_id: number;
    titre: string;
}, {
    message: string;
    utilisateur_id: number;
    titre: string;
    type?: "info" | "warning" | "error" | "success" | undefined;
}>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export declare const updateNotificationSchema: z.ZodObject<{
    lu: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    lu: boolean;
}, {
    lu: boolean;
}>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export declare const listNotificationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "success"]>>;
    lu: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at", "type", "titre"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "type" | "created_at" | "titre";
    sort_order: "asc" | "desc";
    type?: "info" | "warning" | "error" | "success" | undefined;
    utilisateur_id?: number | undefined;
    search?: string | undefined;
    lu?: boolean | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    type?: "info" | "warning" | "error" | "success" | undefined;
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    lu?: string | undefined;
    sort_by?: "type" | "created_at" | "titre" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>;
export declare const userNotificationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    type: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "success"]>>;
    lu: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean>>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "created_at";
    sort_order: "asc" | "desc";
    type?: "info" | "warning" | "error" | "success" | undefined;
    lu?: boolean | undefined;
}, {
    type?: "info" | "warning" | "error" | "success" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    lu?: string | undefined;
    sort_by?: "created_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type UserNotificationsQuery = z.infer<typeof userNotificationsSchema>;
export declare const notificationIdSchema: z.ZodNumber;
export declare const notificationIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const notificationIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export declare const bulkMarkReadNotificationsSchema: z.ZodObject<{
    notification_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    notification_ids: number[];
}, {
    notification_ids: number[];
}>;
export type BulkMarkReadNotifications = z.infer<typeof bulkMarkReadNotificationsSchema>;
export declare const bulkDeleteNotificationsSchema: z.ZodObject<{
    notification_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    notification_ids: number[];
}, {
    notification_ids: number[];
}>;
export type BulkDeleteNotifications = z.infer<typeof bulkDeleteNotificationsSchema>;
export declare const markAllReadSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    type: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "success"]>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    type?: "info" | "warning" | "error" | "success" | undefined;
}, {
    utilisateur_id: number;
    type?: "info" | "warning" | "error" | "success" | undefined;
}>;
export type MarkAllRead = z.infer<typeof markAllReadSchema>;
export declare const notificationResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    utilisateur_id: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "success"]>>;
    titre: z.ZodString;
    message: z.ZodString;
    lu: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    message: string;
    type: "info" | "warning" | "error" | "success";
    created_at: Date;
    utilisateur_id: number;
    lu: boolean;
    titre: string;
}, {
    id: number;
    message: string;
    created_at: Date;
    utilisateur_id: number;
    titre: string;
    type?: "info" | "warning" | "error" | "success" | undefined;
    lu?: boolean | undefined;
}>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export declare const notificationsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        utilisateur_id: z.ZodNumber;
        type: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "success"]>>;
        titre: z.ZodString;
        message: z.ZodString;
        lu: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        message: string;
        type: "info" | "warning" | "error" | "success";
        created_at: Date;
        utilisateur_id: number;
        lu: boolean;
        titre: string;
    }, {
        id: number;
        message: string;
        created_at: Date;
        utilisateur_id: number;
        titre: string;
        type?: "info" | "warning" | "error" | "success" | undefined;
        lu?: boolean | undefined;
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
        message: string;
        type: "info" | "warning" | "error" | "success";
        created_at: Date;
        utilisateur_id: number;
        lu: boolean;
        titre: string;
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
        message: string;
        created_at: Date;
        utilisateur_id: number;
        titre: string;
        type?: "info" | "warning" | "error" | "success" | undefined;
        lu?: boolean | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type NotificationsListResponse = z.infer<typeof notificationsListResponseSchema>;
export declare const notificationStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    unread: z.ZodNumber;
    by_type: z.ZodObject<{
        info: z.ZodNumber;
        warning: z.ZodNumber;
        error: z.ZodNumber;
        success: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        info: number;
        warning: number;
        error: number;
        success: number;
    }, {
        info: number;
        warning: number;
        error: number;
        success: number;
    }>;
}, "strip", z.ZodTypeAny, {
    total: number;
    by_type: {
        info: number;
        warning: number;
        error: number;
        success: number;
    };
    unread: number;
}, {
    total: number;
    by_type: {
        info: number;
        warning: number;
        error: number;
        success: number;
    };
    unread: number;
}>;
export type NotificationStats = z.infer<typeof notificationStatsSchema>;
//# sourceMappingURL=notification.validators.d.ts.map