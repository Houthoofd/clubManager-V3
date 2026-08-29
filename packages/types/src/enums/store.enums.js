export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "en_attente";
    OrderStatus["PAID"] = "payee";
    OrderStatus["SHIPPED"] = "expediee";
    OrderStatus["DELIVERED"] = "livree";
    OrderStatus["CANCELLED"] = "annulee";
})(OrderStatus || (OrderStatus = {}));
export var StockMovementType;
(function (StockMovementType) {
    StockMovementType["ORDER"] = "commande";
    StockMovementType["DELIVERY"] = "livraison";
    StockMovementType["CANCELLATION"] = "annulation";
    StockMovementType["RETURN"] = "retour";
    StockMovementType["ADJUSTMENT"] = "ajustement";
    StockMovementType["INVENTORY"] = "inventaire";
})(StockMovementType || (StockMovementType = {}));
export const ORDER_STATUSES = Object.values(OrderStatus);
export const STOCK_MOVEMENT_TYPES = Object.values(StockMovementType);
//# sourceMappingURL=store.enums.js.map