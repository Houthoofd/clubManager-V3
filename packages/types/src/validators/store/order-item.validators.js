import { z } from 'zod';
import { ORDER_ITEM_CONSTRAINTS } from '../../constants/store.constants.js';
import { idSchema, idStringSchema } from '../common/common.validators.js';
export const orderItemSchema = z.object({
    id: idSchema,
    commande_id: idSchema,
    article_id: idSchema,
    taille_id: idSchema,
    quantite: z
        .number()
        .int('La quantité doit être un nombre entier')
        .min(ORDER_ITEM_CONSTRAINTS.QUANTITE_MIN, `La quantité doit être supérieure ou égale à ${ORDER_ITEM_CONSTRAINTS.QUANTITE_MIN}`),
    prix: z
        .number()
        .min(ORDER_ITEM_CONSTRAINTS.PRIX_MIN, `Le prix doit être supérieur ou égal à ${ORDER_ITEM_CONSTRAINTS.PRIX_MIN}`)
        .max(ORDER_ITEM_CONSTRAINTS.PRIX_MAX, `Le prix ne peut pas dépasser ${ORDER_ITEM_CONSTRAINTS.PRIX_MAX}`)
        .refine((val) => {
        const decimalPart = val.toString().split('.')[1];
        return !decimalPart || decimalPart.length <= 2;
    }, 'Le prix ne peut avoir que 2 décimales maximum'),
});
export const createOrderItemSchema = orderItemSchema.pick({
    commande_id: true,
    article_id: true,
    taille_id: true,
    quantite: true,
    prix: true,
});
export const updateOrderItemSchema = orderItemSchema
    .pick({
    quantite: true,
    prix: true,
})
    .partial();
export const orderItemIdParamSchema = z.object({
    id: idStringSchema,
});
export const orderItemsByOrderParamSchema = z.object({
    commande_id: idStringSchema,
});
export const orderItemsByArticleParamSchema = z.object({
    article_id: idStringSchema,
});
export const orderItemQuerySchema = z.object({
    commande_id: idStringSchema.optional(),
    article_id: idStringSchema.optional(),
    taille_id: idStringSchema.optional(),
    quantite_min: z.coerce.number().int().positive().optional(),
    quantite_max: z.coerce.number().int().positive().optional(),
    prix_min: z.coerce.number().nonnegative().optional(),
    prix_max: z.coerce.number().nonnegative().optional(),
});
export const bulkOrderItemSchema = z.object({
    ids: z.array(idSchema).min(1, 'Au moins un ID est requis'),
});
export const addOrderItemsSchema = z.object({
    commande_id: idSchema,
    items: z
        .array(z.object({
        article_id: idSchema,
        taille_id: idSchema,
        quantite: z.number().int().min(ORDER_ITEM_CONSTRAINTS.QUANTITE_MIN),
        prix: z
            .number()
            .min(ORDER_ITEM_CONSTRAINTS.PRIX_MIN)
            .max(ORDER_ITEM_CONSTRAINTS.PRIX_MAX)
            .refine((val) => {
            const decimalPart = val.toString().split('.')[1];
            return !decimalPart || decimalPart.length <= 2;
        }, 'Le prix ne peut avoir que 2 décimales maximum'),
    }))
        .min(1, 'Au moins un article est requis')
        .max(100, 'Maximum 100 articles par commande'),
});
export const updateOrderItemQuantitySchema = z.object({
    quantite: z
        .number()
        .int('La quantité doit être un nombre entier')
        .min(ORDER_ITEM_CONSTRAINTS.QUANTITE_MIN, `La quantité doit être supérieure ou égale à ${ORDER_ITEM_CONSTRAINTS.QUANTITE_MIN}`),
});
export const calculateOrderItemTotalSchema = z.object({
    items: z
        .array(z.object({
        quantite: z.number().int().positive(),
        prix: z.number().nonnegative(),
    }))
        .min(1, 'Au moins un article est requis'),
});
export const validateOrderItemsSchema = z.object({
    items: z
        .array(z.object({
        article_id: idSchema,
        taille_id: idSchema,
        quantite: z.number().int().min(ORDER_ITEM_CONSTRAINTS.QUANTITE_MIN),
    }))
        .min(1, 'Au moins un article est requis'),
});
//# sourceMappingURL=order-item.validators.js.map