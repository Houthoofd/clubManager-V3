import { z } from 'zod';
export declare const orderSchema: z.ZodObject<{
    id: z.ZodNumber;
    unique_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    numero_commande: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    utilisateur_id: z.ZodNumber;
    total: z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>;
    date_commande: z.ZodDefault<z.ZodDate>;
    statut: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
    ip_address: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodString]>>>;
    user_agent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: Date;
    utilisateur_id: number;
    total: number;
    date_commande: Date;
    statut: string;
    updated_at?: Date | null | undefined;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}, {
    id: number;
    created_at: Date;
    utilisateur_id: number;
    updated_at?: Date | null | undefined;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    unique_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    numero_commande: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    utilisateur_id: z.ZodNumber;
    total: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>>;
    date_commande: z.ZodOptional<z.ZodDefault<z.ZodDate>>;
    statut: z.ZodOptional<z.ZodDefault<z.ZodEnum<[string, ...string[]]>>>;
    ip_address: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodString]>>>>;
    user_agent: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}, {
    utilisateur_id: number;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}>;
export declare const updateOrderSchema: z.ZodObject<{
    unique_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    numero_commande: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    total: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>>;
    statut: z.ZodOptional<z.ZodDefault<z.ZodEnum<[string, ...string[]]>>>;
}, "strip", z.ZodTypeAny, {
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    statut?: string | undefined;
}, {
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    statut?: string | undefined;
}>;
export declare const orderIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const orderUniqueIdParamSchema: z.ZodObject<{
    unique_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    unique_id: string;
}, {
    unique_id: string;
}>;
export declare const orderQuerySchema: z.ZodObject<{
    utilisateur_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    statut: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    numero_commande: z.ZodOptional<z.ZodString>;
    date_min: z.ZodOptional<z.ZodDate>;
    date_max: z.ZodOptional<z.ZodDate>;
    total_min: z.ZodOptional<z.ZodNumber>;
    total_max: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodEnum<["date_commande", "total", "statut", "created_at", "updated_at"]>>;
    sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    numero_commande?: string | undefined;
    utilisateur_id?: number | undefined;
    statut?: string | undefined;
    sort_by?: "created_at" | "updated_at" | "total" | "date_commande" | "statut" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_min?: Date | undefined;
    date_max?: Date | undefined;
    total_min?: number | undefined;
    total_max?: number | undefined;
}, {
    numero_commande?: string | undefined;
    utilisateur_id?: string | undefined;
    statut?: string | undefined;
    sort_by?: "created_at" | "updated_at" | "total" | "date_commande" | "statut" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_min?: Date | undefined;
    date_max?: Date | undefined;
    total_min?: number | undefined;
    total_max?: number | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    statut: z.ZodEnum<[string, ...string[]]>;
}, "strip", z.ZodTypeAny, {
    statut: string;
}, {
    statut: string;
}>;
export declare const bulkOrderSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const bulkUpdateOrderStatusSchema: z.ZodObject<{
    order_ids: z.ZodArray<z.ZodNumber, "many">;
    statut: z.ZodEnum<[string, ...string[]]>;
}, "strip", z.ZodTypeAny, {
    statut: string;
    order_ids: number[];
}, {
    statut: string;
    order_ids: number[];
}>;
export declare const cancelOrderSchema: z.ZodObject<{
    motif: z.ZodString;
}, "strip", z.ZodTypeAny, {
    motif: string;
}, {
    motif: string;
}>;
export declare const orderStatsQuerySchema: z.ZodObject<{
    utilisateur_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    statut: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id?: number | undefined;
    statut?: string | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    utilisateur_id?: string | undefined;
    statut?: string | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export declare const validateOrderNumberSchema: z.ZodObject<{
    numero_commande: z.ZodString;
}, "strip", z.ZodTypeAny, {
    numero_commande: string;
}, {
    numero_commande: string;
}>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;
export type OrderUniqueIdParam = z.infer<typeof orderUniqueIdParamSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type BulkOrderInput = z.infer<typeof bulkOrderSchema>;
export type BulkUpdateOrderStatusInput = z.infer<typeof bulkUpdateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderStatsQuery = z.infer<typeof orderStatsQuerySchema>;
export type ValidateOrderNumberInput = z.infer<typeof validateOrderNumberSchema>;
//# sourceMappingURL=order.validators.d.ts.map