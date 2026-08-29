import { z } from 'zod';
import { createOrderItemSchema, updateOrderItemSchema, orderItemSchema, } from '../../validators/store/order-item.validators.js';
export const CreateOrderItemDto = createOrderItemSchema;
export const UpdateOrderItemDto = updateOrderItemSchema;
export const OrderItemResponseDto = orderItemSchema;
export const OrderItemListItemDto = orderItemSchema.pick({
    id: true,
    commande_id: true,
    article_id: true,
    taille_id: true,
    quantite: true,
    prix: true,
});
export const OrderItemListResponseDto = z.object({
    items: z.array(OrderItemListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=OrderItemDto.js.map