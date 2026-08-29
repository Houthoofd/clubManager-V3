import { z } from "zod";
export declare const stockMovementSchema: z.ZodObject<{
    id: z.ZodNumber;
    article_id: z.ZodNumber;
    taille: z.ZodString;
    type_mouvement: z.ZodEnum<[string, ...string[]]>;
    quantite_avant: z.ZodNumber;
    quantite_apres: z.ZodNumber;
    quantite_mouvement: z.ZodEffects<z.ZodNumber, number, number>;
    commande_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    motif: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    effectue_par: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: Date;
    article_id: number;
    taille: string;
    type_mouvement: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null | undefined;
    motif?: string | null | undefined;
    effectue_par?: number | null | undefined;
}, {
    id: number;
    created_at: Date;
    article_id: number;
    taille: string;
    type_mouvement: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null | undefined;
    motif?: string | null | undefined;
    effectue_par?: number | null | undefined;
}>;
export declare const createStockMovementSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    commande_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    taille: z.ZodString;
    type_mouvement: z.ZodEnum<[string, ...string[]]>;
    quantite_avant: z.ZodNumber;
    quantite_apres: z.ZodNumber;
    quantite_mouvement: z.ZodEffects<z.ZodNumber, number, number>;
    motif: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    effectue_par: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    taille: string;
    type_mouvement: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null | undefined;
    motif?: string | null | undefined;
    effectue_par?: number | null | undefined;
}, {
    article_id: number;
    taille: string;
    type_mouvement: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null | undefined;
    motif?: string | null | undefined;
    effectue_par?: number | null | undefined;
}>;
export declare const stockMovementIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const stockMovementsByArticleParamSchema: z.ZodObject<{
    article_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
}, {
    article_id: string;
}>;
export declare const stockMovementQuerySchema: z.ZodObject<{
    article_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    taille: z.ZodOptional<z.ZodString>;
    type_mouvement: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    commande_id: z.ZodOptional<z.ZodString>;
    effectue_par: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    quantite_mouvement_min: z.ZodOptional<z.ZodNumber>;
    quantite_mouvement_max: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodEnum<["created_at", "quantite_mouvement", "type_mouvement"]>>;
    sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    article_id?: number | undefined;
    commande_id?: string | undefined;
    taille?: string | undefined;
    type_mouvement?: string | undefined;
    effectue_par?: number | undefined;
    sort_by?: "created_at" | "type_mouvement" | "quantite_mouvement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    quantite_mouvement_min?: number | undefined;
    quantite_mouvement_max?: number | undefined;
}, {
    article_id?: string | undefined;
    commande_id?: string | undefined;
    taille?: string | undefined;
    type_mouvement?: string | undefined;
    effectue_par?: string | undefined;
    sort_by?: "created_at" | "type_mouvement" | "quantite_mouvement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    quantite_mouvement_min?: number | undefined;
    quantite_mouvement_max?: number | undefined;
}>;
export declare const recordStockAdjustmentSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    taille: z.ZodString;
    quantite_avant: z.ZodNumber;
    quantite_apres: z.ZodNumber;
    motif: z.ZodString;
    effectue_par: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    motif: string;
    effectue_par?: number | undefined;
}, {
    article_id: number;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    motif: string;
    effectue_par?: number | undefined;
}>;
export declare const recordOrderMovementSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    taille: z.ZodString;
    quantite_avant: z.ZodNumber;
    quantite_apres: z.ZodNumber;
    commande_id: z.ZodString;
    effectue_par: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    commande_id: string;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    effectue_par?: number | undefined;
}, {
    article_id: number;
    commande_id: string;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    effectue_par?: number | undefined;
}>;
export declare const recordDeliveryMovementSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    taille: z.ZodString;
    quantite_avant: z.ZodNumber;
    quantite_apres: z.ZodNumber;
    motif: z.ZodOptional<z.ZodString>;
    effectue_par: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    motif?: string | undefined;
    effectue_par?: number | undefined;
}, {
    article_id: number;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    motif?: string | undefined;
    effectue_par?: number | undefined;
}>;
export declare const recordInventoryMovementSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    taille: z.ZodString;
    quantite_avant: z.ZodNumber;
    quantite_apres: z.ZodNumber;
    motif: z.ZodString;
    effectue_par: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    motif: string;
    effectue_par: number;
}, {
    article_id: number;
    taille: string;
    quantite_avant: number;
    quantite_apres: number;
    motif: string;
    effectue_par: number;
}>;
export declare const stockMovementStatsQuerySchema: z.ZodObject<{
    article_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    type_mouvement: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    effectue_par: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
}, "strip", z.ZodTypeAny, {
    article_id?: number | undefined;
    type_mouvement?: string | undefined;
    effectue_par?: number | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    article_id?: string | undefined;
    type_mouvement?: string | undefined;
    effectue_par?: string | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export declare const bulkStockMovementQuerySchema: z.ZodObject<{
    article_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    type_mouvements: z.ZodOptional<z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    article_ids?: number[] | undefined;
    type_mouvements?: string[] | undefined;
}, {
    limit?: number | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    article_ids?: number[] | undefined;
    type_mouvements?: string[] | undefined;
}>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type StockMovementIdParam = z.infer<typeof stockMovementIdParamSchema>;
export type StockMovementsByArticleParam = z.infer<typeof stockMovementsByArticleParamSchema>;
export type StockMovementQuery = z.infer<typeof stockMovementQuerySchema>;
export type RecordStockAdjustmentInput = z.infer<typeof recordStockAdjustmentSchema>;
export type RecordOrderMovementInput = z.infer<typeof recordOrderMovementSchema>;
export type RecordDeliveryMovementInput = z.infer<typeof recordDeliveryMovementSchema>;
export type RecordInventoryMovementInput = z.infer<typeof recordInventoryMovementSchema>;
export type StockMovementStatsQuery = z.infer<typeof stockMovementStatsQuerySchema>;
export type BulkStockMovementQuery = z.infer<typeof bulkStockMovementQuerySchema>;
//# sourceMappingURL=stock-movement.validators.d.ts.map