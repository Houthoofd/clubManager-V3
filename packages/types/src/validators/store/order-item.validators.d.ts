import { z } from 'zod';
export declare const orderItemSchema: z.ZodObject<{
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
export declare const createOrderItemSchema: z.ZodObject<Pick<{
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
export declare const updateOrderItemSchema: z.ZodObject<{
    prix: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    quantite: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    prix?: number | undefined;
    quantite?: number | undefined;
}, {
    prix?: number | undefined;
    quantite?: number | undefined;
}>;
export declare const orderItemIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const orderItemsByOrderParamSchema: z.ZodObject<{
    commande_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    commande_id: number;
}, {
    commande_id: string;
}>;
export declare const orderItemsByArticleParamSchema: z.ZodObject<{
    article_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
}, {
    article_id: string;
}>;
export declare const orderItemQuerySchema: z.ZodObject<{
    commande_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    article_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    taille_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    quantite_min: z.ZodOptional<z.ZodNumber>;
    quantite_max: z.ZodOptional<z.ZodNumber>;
    prix_min: z.ZodOptional<z.ZodNumber>;
    prix_max: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    article_id?: number | undefined;
    taille_id?: number | undefined;
    commande_id?: number | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
    quantite_min?: number | undefined;
    quantite_max?: number | undefined;
}, {
    article_id?: string | undefined;
    taille_id?: string | undefined;
    commande_id?: string | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
    quantite_min?: number | undefined;
    quantite_max?: number | undefined;
}>;
export declare const bulkOrderItemSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const addOrderItemsSchema: z.ZodObject<{
    commande_id: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        article_id: z.ZodNumber;
        taille_id: z.ZodNumber;
        quantite: z.ZodNumber;
        prix: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
    }, {
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    commande_id: number;
    items: {
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
    }[];
}, {
    commande_id: number;
    items: {
        prix: number;
        article_id: number;
        taille_id: number;
        quantite: number;
    }[];
}>;
export declare const updateOrderItemQuantitySchema: z.ZodObject<{
    quantite: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quantite: number;
}, {
    quantite: number;
}>;
export declare const calculateOrderItemTotalSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        quantite: z.ZodNumber;
        prix: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        prix: number;
        quantite: number;
    }, {
        prix: number;
        quantite: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        prix: number;
        quantite: number;
    }[];
}, {
    items: {
        prix: number;
        quantite: number;
    }[];
}>;
export declare const validateOrderItemsSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        article_id: z.ZodNumber;
        taille_id: z.ZodNumber;
        quantite: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        article_id: number;
        taille_id: number;
        quantite: number;
    }, {
        article_id: number;
        taille_id: number;
        quantite: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        article_id: number;
        taille_id: number;
        quantite: number;
    }[];
}, {
    items: {
        article_id: number;
        taille_id: number;
        quantite: number;
    }[];
}>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type OrderItemIdParam = z.infer<typeof orderItemIdParamSchema>;
export type OrderItemsByOrderParam = z.infer<typeof orderItemsByOrderParamSchema>;
export type OrderItemsByArticleParam = z.infer<typeof orderItemsByArticleParamSchema>;
export type OrderItemQuery = z.infer<typeof orderItemQuerySchema>;
export type BulkOrderItemInput = z.infer<typeof bulkOrderItemSchema>;
export type AddOrderItemsInput = z.infer<typeof addOrderItemsSchema>;
export type UpdateOrderItemQuantityInput = z.infer<typeof updateOrderItemQuantitySchema>;
export type CalculateOrderItemTotalInput = z.infer<typeof calculateOrderItemTotalSchema>;
export type ValidateOrderItemsInput = z.infer<typeof validateOrderItemsSchema>;
//# sourceMappingURL=order-item.validators.d.ts.map