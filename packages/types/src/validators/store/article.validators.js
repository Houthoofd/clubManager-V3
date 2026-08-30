import { z } from 'zod';
import { ARTICLE_CONSTRAINTS } from '../../constants/store.constants.js';
import { idSchema, idStringSchema, timestampSchema, booleanSchema } from '../common/common.validators.js';
export const articleSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .min(ARTICLE_CONSTRAINTS.NOM_MIN_LENGTH, 'Le nom est requis')
        .max(ARTICLE_CONSTRAINTS.NOM_MAX_LENGTH, `Le nom ne peut pas dépasser ${ARTICLE_CONSTRAINTS.NOM_MAX_LENGTH} caractères`)
        .trim(),
    description: z
        .string()
        .max(ARTICLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `La description ne peut pas dépasser ${ARTICLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} caractères`)
        .nullable()
        .optional(),
    prix: z
        .number()
        .min(ARTICLE_CONSTRAINTS.PRIX_MIN, `Le prix doit être supérieur ou égal à ${ARTICLE_CONSTRAINTS.PRIX_MIN}`)
        .max(ARTICLE_CONSTRAINTS.PRIX_MAX, `Le prix ne peut pas dépasser ${ARTICLE_CONSTRAINTS.PRIX_MAX}`)
        .refine((val) => {
        const decimalPart = val.toString().split('.')[1];
        return !decimalPart || decimalPart.length <= 2;
    }, 'Le prix ne peut avoir que 2 décimales maximum'),
    image_url: z
        .string()
        .max(ARTICLE_CONSTRAINTS.IMAGE_URL_MAX_LENGTH, `L'URL de l'image ne peut pas dépasser ${ARTICLE_CONSTRAINTS.IMAGE_URL_MAX_LENGTH} caractères`)
        .url('L\'URL de l\'image doit être valide')
        .nullable()
        .optional(),
    categorie_id: idSchema.nullable().optional(),
    actif: booleanSchema.default(true),
    created_at: timestampSchema,
    updated_at: timestampSchema.nullable().optional(),
});
export const createArticleSchema = articleSchema
    .pick({
    nom: true,
    description: true,
    prix: true,
    image_url: true,
    categorie_id: true,
    actif: true,
})
    .partial({
    description: true,
    image_url: true,
    categorie_id: true,
    actif: true,
});
export const updateArticleSchema = articleSchema
    .pick({
    nom: true,
    description: true,
    prix: true,
    image_url: true,
    categorie_id: true,
    actif: true,
})
    .partial();
export const articleIdParamSchema = z.object({
    id: idStringSchema,
});
export const articleQuerySchema = z.object({
    search: z.string().trim().optional(),
    categorie_id: idStringSchema.optional(),
    actif: z
        .enum(['true', 'false', '1', '0'])
        .transform((val) => val === 'true' || val === '1')
        .optional(),
    prix_min: z.coerce.number().nonnegative().optional(),
    prix_max: z.coerce.number().nonnegative().optional(),
    sort_by: z.enum(['nom', 'prix', 'created_at', 'updated_at']).optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
});
export const bulkArticleSchema = z.object({
    ids: z.array(idSchema).min(1, 'Au moins un ID est requis'),
});
export const toggleArticleActiveSchema = z.object({
    actif: booleanSchema,
});
export const bulkUpdateArticlePricesSchema = z.object({
    articles: z
        .array(z.object({
        id: idSchema,
        prix: z
            .number()
            .min(ARTICLE_CONSTRAINTS.PRIX_MIN)
            .max(ARTICLE_CONSTRAINTS.PRIX_MAX)
            .refine((val) => {
            const decimalPart = val.toString().split('.')[1];
            return !decimalPart || decimalPart.length <= 2;
        }, 'Le prix ne peut avoir que 2 décimales maximum'),
    }))
        .min(1, 'Au moins un article est requis'),
});
export const bulkUpdateArticleCategoriesSchema = z.object({
    article_ids: z.array(idSchema).min(1, 'Au moins un article est requis'),
    categorie_id: idSchema.nullable(),
});
//# sourceMappingURL=article.validators.js.map