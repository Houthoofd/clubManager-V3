import { z } from 'zod';
import { IMAGE_CONSTRAINTS } from '../../constants/store.constants.js';
import { idSchema, idStringSchema } from '../common/common.validators.js';
export const imageSchema = z.object({
    id: idSchema,
    article_id: idSchema,
    url: z
        .string()
        .min(IMAGE_CONSTRAINTS.URL_MIN_LENGTH, 'L\'URL est requise')
        .max(IMAGE_CONSTRAINTS.URL_MAX_LENGTH, `L'URL ne peut pas dépasser ${IMAGE_CONSTRAINTS.URL_MAX_LENGTH} caractères`)
        .url('L\'URL doit être valide')
        .trim(),
    ordre: z
        .number()
        .int('L\'ordre doit être un nombre entier')
        .min(IMAGE_CONSTRAINTS.ORDRE_MIN, `L'ordre doit être supérieur ou égal à ${IMAGE_CONSTRAINTS.ORDRE_MIN}`)
        .default(0),
});
export const createImageSchema = imageSchema
    .pick({
    article_id: true,
    url: true,
    ordre: true,
})
    .partial({
    ordre: true,
});
export const updateImageSchema = imageSchema
    .pick({
    url: true,
    ordre: true,
})
    .partial();
export const imageIdParamSchema = z.object({
    id: idStringSchema,
});
export const imagesByArticleParamSchema = z.object({
    article_id: idStringSchema,
});
export const bulkImageSchema = z.object({
    ids: z.array(idSchema).min(1, 'Au moins un ID est requis'),
});
export const reorderImagesSchema = z.object({
    images: z
        .array(z.object({
        id: idSchema,
        ordre: z.number().int().min(IMAGE_CONSTRAINTS.ORDRE_MIN),
    }))
        .min(1, 'Au moins une image est requise'),
});
export const bulkCreateImagesSchema = z.object({
    article_id: idSchema,
    images: z
        .array(z.object({
        url: z
            .string()
            .min(IMAGE_CONSTRAINTS.URL_MIN_LENGTH)
            .max(IMAGE_CONSTRAINTS.URL_MAX_LENGTH)
            .url()
            .trim(),
        ordre: z.number().int().min(IMAGE_CONSTRAINTS.ORDRE_MIN).optional(),
    }))
        .min(1, 'Au moins une image est requise')
        .max(20, 'Maximum 20 images par article'),
});
//# sourceMappingURL=image.validators.js.map