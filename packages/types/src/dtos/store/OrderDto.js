import { z } from 'zod';
import { createOrderSchema, updateOrderSchema, orderSchema, } from '../../validators/store/order.validators.js';
export const CreateOrderDto = createOrderSchema;
export const UpdateOrderDto = updateOrderSchema;
export const OrderResponseDto = orderSchema;
export const OrderListItemDto = orderSchema.pick({
    id: true,
    unique_id: true,
    numero_commande: true,
    utilisateur_id: true,
    total: true,
    date_commande: true,
    statut: true,
});
export const OrderListResponseDto = z.object({
    items: z.array(OrderListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=OrderDto.js.map