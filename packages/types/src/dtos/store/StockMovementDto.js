import { z } from 'zod';
import { createStockMovementSchema, stockMovementSchema, } from '../../validators/store/stock-movement.validators.js';
export const CreateStockMovementDto = createStockMovementSchema;
export const StockMovementResponseDto = stockMovementSchema;
export const StockMovementListItemDto = stockMovementSchema.pick({
    id: true,
    article_id: true,
    taille: true,
    type_mouvement: true,
    quantite_mouvement: true,
    commande_id: true,
    motif: true,
    created_at: true,
});
export const StockMovementListResponseDto = z.object({
    items: z.array(StockMovementListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=StockMovementDto.js.map