import { z } from "zod";
import { CATEGORY_CONSTRAINTS } from "../../constants/store.constants.js";
import { idSchema, idStringSchema } from "../common/common.validators.js";
export const categorySchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .min(CATEGORY_CONSTRAINTS.NOM_MIN_LENGTH, "Le nom est requis")
        .max(CATEGORY_CONSTRAINTS.NOM_MAX_LENGTH, `Le nom ne peut pas dépasser ${CATEGORY_CONSTRAINTS.NOM_MAX_LENGTH} caractères`)
        .trim(),
    description: z
        .string()
        .max(CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `La description ne peut pas dépasser ${CATEGORY_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} caractères`)
        .nullable()
        .optional(),
    ordre: z.number().int("L'ordre doit être un nombre entier").default(0),
});
export const createCategorySchema = categorySchema
    .pick({
    nom: true,
    description: true,
    ordre: true,
})
    .partial({
    description: true,
    ordre: true,
});
export const updateCategorySchema = categorySchema
    .pick({
    nom: true,
    description: true,
    ordre: true,
})
    .partial();
export const categoryIdParamSchema = z.object({
    id: idStringSchema,
});
export const categoryQuerySchema = z.object({
    search: z.string().trim().optional(),
    ordre_min: z.coerce.number().int().nonnegative().optional(),
    ordre_max: z.coerce.number().int().nonnegative().optional(),
});
export const bulkCategorySchema = z.object({
    ids: z.array(idSchema).min(1, "Au moins un ID est requis"),
});
export const reorderCategoriesSchema = z.object({
    categories: z
        .array(z.object({
        id: idSchema,
        ordre: z.number().int().nonnegative(),
    }))
        .min(1, "Au moins une catégorie est requise"),
});
//# sourceMappingURL=category.validators.js.map