import { z } from "zod";
export declare const stockSchema: z.ZodObject<{
    id: z.ZodNumber;
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite: z.ZodNumber;
    quantite_minimum: z.ZodDefault<z.ZodNumber>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    quantite_minimum: number;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    updated_at?: Date | null | undefined;
    quantite_minimum?: number | undefined;
}>;
export declare const createStockSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite: z.ZodNumber;
    quantite_minimum: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    taille_id: number;
    quantite: number;
    quantite_minimum?: number | undefined;
}, {
    article_id: number;
    taille_id: number;
    quantite: number;
    quantite_minimum?: number | undefined;
}>;
export declare const updateStockSchema: z.ZodObject<{
    quantite: z.ZodOptional<z.ZodNumber>;
    quantite_minimum: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    quantite?: number | undefined;
    quantite_minimum?: number | undefined;
}, {
    quantite?: number | undefined;
    quantite_minimum?: number | undefined;
}>;
export declare const stockIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const stocksByArticleParamSchema: z.ZodObject<{
    article_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
}, {
    article_id: string;
}>;
export declare const stocksBySizeParamSchema: z.ZodObject<{
    taille_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    taille_id: number;
}, {
    taille_id: string;
}>;
export declare const stockQuerySchema: z.ZodObject<{
    article_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    taille_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    low_stock: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false", "1", "0"]>, boolean, "1" | "0" | "true" | "false">>;
    out_of_stock: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false", "1", "0"]>, boolean, "1" | "0" | "true" | "false">>;
    quantite_min: z.ZodOptional<z.ZodNumber>;
    quantite_max: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    article_id?: number | undefined;
    taille_id?: number | undefined;
    low_stock?: boolean | undefined;
    out_of_stock?: boolean | undefined;
    quantite_min?: number | undefined;
    quantite_max?: number | undefined;
}, {
    article_id?: string | undefined;
    taille_id?: string | undefined;
    low_stock?: "1" | "0" | "true" | "false" | undefined;
    out_of_stock?: "1" | "0" | "true" | "false" | undefined;
    quantite_min?: number | undefined;
    quantite_max?: number | undefined;
}>;
export declare const adjustStockSchema: z.ZodObject<{
    quantite: z.ZodEffects<z.ZodNumber, number, number>;
    motif: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantite: number;
    motif?: string | undefined;
}, {
    quantite: number;
    motif?: string | undefined;
}>;
export declare const setStockQuantitySchema: z.ZodObject<{
    quantite: z.ZodNumber;
    motif: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantite: number;
    motif?: string | undefined;
}, {
    quantite: number;
    motif?: string | undefined;
}>;
export declare const bulkStockSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const bulkUpdateStockSchema: z.ZodObject<{
    stocks: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        quantite: z.ZodOptional<z.ZodNumber>;
        quantite_minimum: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        quantite?: number | undefined;
        quantite_minimum?: number | undefined;
    }, {
        id: number;
        quantite?: number | undefined;
        quantite_minimum?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    stocks: {
        id: number;
        quantite?: number | undefined;
        quantite_minimum?: number | undefined;
    }[];
}, {
    stocks: {
        id: number;
        quantite?: number | undefined;
        quantite_minimum?: number | undefined;
    }[];
}>;
export declare const checkStockAvailabilitySchema: z.ZodObject<{
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite_demandee: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    taille_id: number;
    quantite_demandee: number;
}, {
    article_id: number;
    taille_id: number;
    quantite_demandee: number;
}>;
export declare const bulkAdjustStockSchema: z.ZodObject<{
    adjustments: z.ZodArray<z.ZodObject<{
        article_id: z.ZodNumber;
        taille_id: z.ZodNumber;
        quantite: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        article_id: number;
        taille_id: number;
        quantite: number;
    }, {
        article_id: number;
        taille_id: number;
        quantite: number;
    }>, "many">;
    motif: z.ZodString;
}, "strip", z.ZodTypeAny, {
    motif: string;
    adjustments: {
        article_id: number;
        taille_id: number;
        quantite: number;
    }[];
}, {
    motif: string;
    adjustments: {
        article_id: number;
        taille_id: number;
        quantite: number;
    }[];
}>;
export type Stock = z.infer<typeof stockSchema>;
export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type StockIdParam = z.infer<typeof stockIdParamSchema>;
export type StocksByArticleParam = z.infer<typeof stocksByArticleParamSchema>;
export type StocksBySizeParam = z.infer<typeof stocksBySizeParamSchema>;
export type StockQuery = z.infer<typeof stockQuerySchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type SetStockQuantityInput = z.infer<typeof setStockQuantitySchema>;
export type BulkStockInput = z.infer<typeof bulkStockSchema>;
export type BulkUpdateStockInput = z.infer<typeof bulkUpdateStockSchema>;
export type CheckStockAvailabilityInput = z.infer<typeof checkStockAvailabilitySchema>;
export type BulkAdjustStockInput = z.infer<typeof bulkAdjustStockSchema>;
//# sourceMappingURL=stock.validators.d.ts.map