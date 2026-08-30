import { z } from 'zod';
import { SIZE_CONSTRAINTS } from '../../constants/store.constants.js';
import { idSchema, idStringSchema } from '../common/common.validators.js';
export const sizeSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .min(SIZE_CONSTRAINTS.NOM_MIN_LENGTH, 'Le nom est requis')
        .max(SIZE_CONSTRAINTS.NOM_MAX_LENGTH, `Le nom ne peut pas dépasser ${SIZE_CONSTRAINTS.NOM_MAX_LENGTH} caractères`)
        .trim(),
    ordre: z.number().int('L\'ordre doit être un nombre entier').default(0),
});
export const createSizeSchema = sizeSchema
    .pick({
    nom: true,
    ordre: true,
})
    .partial({
    ordre: true,
});
export const updateSizeSchema = sizeSchema
    .pick({
    nom: true,
    ordre: true,
})
    .partial();
export const sizeIdParamSchema = z.object({
    id: idStringSchema,
});
export const sizeQuerySchema = z.object({
    search: z.string().trim().optional(),
    ordre_min: z.coerce.number().int().nonnegative().optional(),
    ordre_max: z.coerce.number().int().nonnegative().optional(),
});
export const bulkSizeSchema = z.object({
    ids: z.array(idSchema).min(1, 'Au moins un ID est requis'),
});
export const reorderSizesSchema = z.object({
    sizes: z
        .array(z.object({
        id: idSchema,
        ordre: z.number().int().nonnegative(),
    }))
        .min(1, 'Au moins une taille est requise'),
});
//# sourceMappingURL=size.validators.js.map