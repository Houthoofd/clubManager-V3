import { z } from 'zod';
export declare const CreateStockDto: z.ZodObject<{
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
export type CreateStockDto = z.infer<typeof CreateStockDto>;
export declare const UpdateStockDto: z.ZodObject<{
    quantite: z.ZodOptional<z.ZodNumber>;
    quantite_minimum: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    quantite?: number | undefined;
    quantite_minimum?: number | undefined;
}, {
    quantite?: number | undefined;
    quantite_minimum?: number | undefined;
}>;
export type UpdateStockDto = z.infer<typeof UpdateStockDto>;
export declare const StockResponseDto: z.ZodObject<{
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
export type StockResponseDto = z.infer<typeof StockResponseDto>;
export declare const StockListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite: z.ZodNumber;
    quantite_minimum: z.ZodDefault<z.ZodNumber>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "id" | "article_id" | "taille_id" | "quantite" | "quantite_minimum">, "strip", z.ZodTypeAny, {
    id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    quantite_minimum: number;
}, {
    id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    quantite_minimum?: number | undefined;
}>;
export type StockListItemDto = z.infer<typeof StockListItemDto>;
export declare const StockListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        article_id: z.ZodNumber;
        taille_id: z.ZodNumber;
        quantite: z.ZodNumber;
        quantite_minimum: z.ZodDefault<z.ZodNumber>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "id" | "article_id" | "taille_id" | "quantite" | "quantite_minimum">, "strip", z.ZodTypeAny, {
        id: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        quantite_minimum: number;
    }, {
        id: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        quantite_minimum?: number | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    total: number;
    items: {
        id: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        quantite_minimum: number;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        quantite_minimum?: number | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type StockListResponseDto = z.infer<typeof StockListResponseDto>;
//# sourceMappingURL=StockDto.d.ts.map