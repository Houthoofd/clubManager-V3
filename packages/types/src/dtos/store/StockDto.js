import { z } from 'zod';
import { createStockSchema, updateStockSchema, stockSchema, } from '../../validators/store/stock.validators.js';
export const CreateStockDto = createStockSchema;
export const UpdateStockDto = updateStockSchema;
export const StockResponseDto = stockSchema;
export const StockListItemDto = stockSchema.pick({
    id: true,
    article_id: true,
    taille_id: true,
    quantite: true,
    quantite_minimum: true,
});
export const StockListResponseDto = z.object({
    items: z.array(StockListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=StockDto.js.map