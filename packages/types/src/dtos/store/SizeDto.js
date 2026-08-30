import { z } from 'zod';
import { createSizeSchema, updateSizeSchema, sizeSchema, } from '../../validators/store/size.validators.js';
export const CreateSizeDto = createSizeSchema;
export const UpdateSizeDto = updateSizeSchema;
export const SizeResponseDto = sizeSchema;
export const SizeListItemDto = sizeSchema.pick({
    id: true,
    nom: true,
    ordre: true,
});
export const SizeListResponseDto = z.object({
    items: z.array(SizeListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=SizeDto.js.map