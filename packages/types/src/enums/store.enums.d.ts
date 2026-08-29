export declare enum OrderStatus {
    PENDING = "en_attente",
    PAID = "payee",
    SHIPPED = "expediee",
    DELIVERED = "livree",
    CANCELLED = "annulee"
}
export declare enum StockMovementType {
    ORDER = "commande",
    DELIVERY = "livraison",
    CANCELLATION = "annulation",
    RETURN = "retour",
    ADJUSTMENT = "ajustement",
    INVENTORY = "inventaire"
}
export declare const ORDER_STATUSES: [string, ...string[]];
export declare const STOCK_MOVEMENT_TYPES: [string, ...string[]];
//# sourceMappingURL=store.enums.d.ts.map