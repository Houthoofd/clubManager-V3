import { z } from 'zod';
export declare const CreateOrderItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    commande_id: z.ZodNumber;
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite: z.ZodNumber;
    prix: z.ZodEffects<z.ZodNumber, number, number>;
}, "prix" | "article_id" | "taille_id" | "quantite" | "commande_id">, "strip", z.ZodTypeAny, {
    prix: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    commande_id: number;
}, {
    prix: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    commande_id: number;
}>;
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemDto>;
export declare const UpdateOrderItemDto: z.ZodObject<{
    prix: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    quantite: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    prix?: number | undefined;
    quantite?: number | undefined;
}, {
    prix?: number | undefined;
    quantite?: number | undefined;
}>;
export type UpdateOrderItemDto = z.infer<typeof UpdateOrderItemDto>;
export declare const OrderItemResponseDto: z.ZodObject<{
    id: z.ZodNumber;
    commande_id: z.ZodNumber;
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite: z.ZodNumber;
    prix: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    id: number;
    prix: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    commande_id: number;
}, {
    id: number;
    prix: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    commande_id: number;
}>;
export type OrderItemResponseDto = z.infer<typeof OrderItemResponseDto>;
export declare const OrderItemListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    commande_id: z.ZodNumber;
    article_id: z.ZodNumber;
    taille_id: z.ZodNumber;
    quantite: z.ZodNumber;
    prix: z.ZodEffects<z.ZodNumber, number, number>;
}, "id" | "prix" | "article_id" | "taille_id" | "quantite" | "commande_id">, "strip", z.ZodTypeAny, {
    id: number;
    prix: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    commande_id: number;
}, {
    id: number;
    prix: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    commande_id: number;
}>;
export type OrderItemListItemDto = z.infer<typeof OrderItemListItemDto>;
export declare const OrderItemListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        commande_id: z.ZodNumber;
        article_id: z.ZodNumber;
        taille_id: z.ZodNumber;
        quantite: z.ZodNumber;
        prix: z.ZodEffects<z.ZodNumber, number, number>;
    }, "id" | "prix" | "article_id" | "taille_id" | "quantite" | "commande_id">, "strip", z.ZodTypeAny, {
        id: number;
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        commande_id: number;
    }, {
        id: number;
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        commande_id: number;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    total: number;
    items: {
        id: number;
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        commande_id: number;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        commande_id: number;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type OrderItemListResponseDto = z.infer<typeof OrderItemListResponseDto>;
//# sourceMappingURL=OrderItemDto.d.ts.map