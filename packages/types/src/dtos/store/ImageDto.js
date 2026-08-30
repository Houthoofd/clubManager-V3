import { z } from 'zod';
import { createImageSchema, updateImageSchema, imageSchema, } from '../../validators/store/image.validators.js';
export const CreateImageDto = createImageSchema;
export const UpdateImageDto = updateImageSchema;
export const ImageResponseDto = imageSchema;
export const ImageListItemDto = imageSchema.pick({
    id: true,
    article_id: true,
    url: true,
    ordre: true,
});
export const ImageListResponseDto = z.object({
    items: z.array(ImageListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=ImageDto.js.map