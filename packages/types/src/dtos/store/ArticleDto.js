import { z } from 'zod';
import { createArticleSchema, updateArticleSchema, articleSchema, } from '../../validators/store/article.validators.js';
export const CreateArticleDto = createArticleSchema;
export const UpdateArticleDto = updateArticleSchema;
export const ArticleResponseDto = articleSchema;
export const ArticleListItemDto = articleSchema.pick({
    id: true,
    nom: true,
    prix: true,
    image_url: true,
    categorie_id: true,
    actif: true,
});
export const ArticleListResponseDto = z.object({
    items: z.array(ArticleListItemDto),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
});
//# sourceMappingURL=ArticleDto.js.map