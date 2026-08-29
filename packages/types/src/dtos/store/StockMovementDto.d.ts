import { z } from 'zod';
export declare const CreateStockMovementDto: z.ZodObject<{
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
export type CreateStockMovementDto = z.infer<typeof CreateStockMovementDto>;
export declare const StockMovementResponseDto: z.ZodObject<{
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
export type StockMovementResponseDto = z.infer<typeof StockMovementResponseDto>;
export declare const StockMovementListItemDto: z.ZodObject<Pick<{
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
}, "id" | "created_at" | "article_id" | "commande_id" | "taille" | "type_mouvement" | "quantite_mouvement" | "motif">, "strip", z.ZodTypeAny, {
    id: number;
    created_at: Date;
    article_id: number;
    taille: string;
    type_mouvement: string;
    quantite_mouvement: number;
    commande_id?: string | null | undefined;
    motif?: string | null | undefined;
}, {
    id: number;
    created_at: Date;
    article_id: number;
    taille: string;
    type_mouvement: string;
    quantite_mouvement: number;
    commande_id?: string | null | undefined;
    motif?: string | null | undefined;
}>;
export type StockMovementListItemDto = z.infer<typeof StockMovementListItemDto>;
export declare const StockMovementListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
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
    }, "id" | "created_at" | "article_id" | "commande_id" | "taille" | "type_mouvement" | "quantite_mouvement" | "motif">, "strip", z.ZodTypeAny, {
        id: number;
        created_at: Date;
        article_id: number;
        taille: string;
        type_mouvement: string;
        quantite_mouvement: number;
        commande_id?: string | null | undefined;
        motif?: string | null | undefined;
    }, {
        id: number;
        created_at: Date;
        article_id: number;
        taille: string;
        type_mouvement: string;
        quantite_mouvement: number;
        commande_id?: string | null | undefined;
        motif?: string | null | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    total: number;
    items: {
        id: number;
        created_at: Date;
        article_id: number;
        taille: string;
        type_mouvement: string;
        quantite_mouvement: number;
        commande_id?: string | null | undefined;
        motif?: string | null | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        created_at: Date;
        article_id: number;
        taille: string;
        type_mouvement: string;
        quantite_mouvement: number;
        commande_id?: string | null | undefined;
        motif?: string | null | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type StockMovementListResponseDto = z.infer<typeof StockMovementListResponseDto>;
//# sourceMappingURL=StockMovementDto.d.ts.map