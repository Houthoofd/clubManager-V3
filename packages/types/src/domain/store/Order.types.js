import { OrderStatus } from '../../enums/store.enums.js';
export const ORDER_STATUS_LABELS = {
    [OrderStatus.PENDING]: 'En attente',
    [OrderStatus.PAID]: 'Payée',
    [OrderStatus.SHIPPED]: 'Expédiée',
    [OrderStatus.DELIVERED]: 'Livrée',
    [OrderStatus.CANCELLED]: 'Annulée',
};
export const ORDER_STATUS_COLORS = {
    [OrderStatus.PENDING]: 'orange',
    [OrderStatus.PAID]: 'blue',
    [OrderStatus.SHIPPED]: 'purple',
    [OrderStatus.DELIVERED]: 'green',
    [OrderStatus.CANCELLED]: 'red',
};
//# sourceMappingURL=Order.types.js.map