import { z } from 'zod';
import { createCategorySchema, updateCategorySchema, categorySchema, } from '../../validators/store/category.validators.js';
export const CreateCategoryDto = createCategorySchema;
export const UpdateCategoryDto = updateCategorySchema;
export const CategoryResponseDto = categorySchema;
export const CategoryListItemDto = categorySchema.pick({
    id: true,
    nom: true,
    ordre: true,
});
export const CategoryListResponseDto = z.object({
    items: z.array(CategoryListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=CategoryDto.js.map