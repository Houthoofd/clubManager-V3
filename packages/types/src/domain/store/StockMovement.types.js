import { StockMovementType } from '../../enums/store.enums.js';
export const STOCK_MOVEMENT_TYPE_LABELS = {
    [StockMovementType.ORDER]: 'Commande',
    [StockMovementType.DELIVERY]: 'Livraison',
    [StockMovementType.CANCELLATION]: 'Annulation',
    [StockMovementType.RETURN]: 'Retour',
    [StockMovementType.ADJUSTMENT]: 'Ajustement',
    [StockMovementType.INVENTORY]: 'Inventaire',
};
export const STOCK_MOVEMENT_TYPE_COLORS = {
    [StockMovementType.ORDER]: 'red',
    [StockMovementType.DELIVERY]: 'green',
    [StockMovementType.CANCELLATION]: 'orange',
    [StockMovementType.RETURN]: 'blue',
    [StockMovementType.ADJUSTMENT]: 'purple',
    [StockMovementType.INVENTORY]: 'gray',
};
export const STOCK_MOVEMENT_TYPE_ICONS = {
    [StockMovementType.ORDER]: '🛒',
    [StockMovementType.DELIVERY]: '📦',
    [StockMovementType.CANCELLATION]: '❌',
    [StockMovementType.RETURN]: '↩️',
    [StockMovementType.ADJUSTMENT]: '🔧',
    [StockMovementType.INVENTORY]: '📋',
};
//# sourceMappingURL=StockMovement.types.js.map