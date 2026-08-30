import { z } from "zod";
import { STOCK_CONSTRAINTS } from "../../constants/store.constants.js";
import { idSchema, idStringSchema, timestampSchema, } from "../common/common.validators.js";
export const stockSchema = z.object({
    id: idSchema,
    article_id: idSchema,
    taille_id: idSchema,
    quantite: z
        .number()
        .int("La quantité doit être un nombre entier")
        .min(STOCK_CONSTRAINTS.QUANTITE_MIN, `La quantité doit être supérieure ou égale à ${STOCK_CONSTRAINTS.QUANTITE_MIN}`),
    quantite_minimum: z
        .number()
        .int("La quantité minimum doit être un nombre entier")
        .min(STOCK_CONSTRAINTS.QUANTITE_MINIMUM_MIN, `La quantité minimum doit être supérieure ou égale à ${STOCK_CONSTRAINTS.QUANTITE_MINIMUM_MIN}`)
        .default(STOCK_CONSTRAINTS.QUANTITE_MINIMUM_DEFAULT),
    updated_at: timestampSchema.nullable().optional(),
});
export const createStockSchema = z.object({
    article_id: idSchema,
    taille_id: idSchema,
    quantite: z
        .number()
        .int("La quantité doit être un nombre entier")
        .min(STOCK_CONSTRAINTS.QUANTITE_MIN, `La quantité doit être supérieure ou égale à ${STOCK_CONSTRAINTS.QUANTITE_MIN}`),
    quantite_minimum: z
        .number()
        .int("La quantité minimum doit être un nombre entier")
        .min(STOCK_CONSTRAINTS.QUANTITE_MINIMUM_MIN, `La quantité minimum doit être supérieure ou égale à ${STOCK_CONSTRAINTS.QUANTITE_MINIMUM_MIN}`)
        .default(STOCK_CONSTRAINTS.QUANTITE_MINIMUM_DEFAULT)
        .optional(),
});
export const updateStockSchema = stockSchema
    .pick({
    quantite: true,
    quantite_minimum: true,
})
    .partial();
export const stockIdParamSchema = z.object({
    id: idStringSchema,
});
export const stocksByArticleParamSchema = z.object({
    article_id: idStringSchema,
});
export const stocksBySizeParamSchema = z.object({
    taille_id: idStringSchema,
});
export const stockQuerySchema = z.object({
    article_id: idStringSchema.optional(),
    taille_id: idStringSchema.optional(),
    low_stock: z
        .enum(["true", "false", "1", "0"])
        .transform((val) => val === "true" || val === "1")
        .optional(),
    out_of_stock: z
        .enum(["true", "false", "1", "0"])
        .transform((val) => val === "true" || val === "1")
        .optional(),
    quantite_min: z.coerce.number().int().nonnegative().optional(),
    quantite_max: z.coerce.number().int().nonnegative().optional(),
});
export const adjustStockSchema = z.object({
    quantite: z
        .number()
        .int("La quantité doit être un nombre entier")
        .refine((val) => val !== 0, "La quantité ne peut pas être zéro"),
    motif: z.string().min(1, "Le motif est requis").max(65535).trim().optional(),
});
export const setStockQuantitySchema = z.object({
    quantite: z
        .number()
        .int("La quantité doit être un nombre entier")
        .min(STOCK_CONSTRAINTS.QUANTITE_MIN),
    motif: z.string().min(1, "Le motif est requis").max(65535).trim().optional(),
});
export const bulkStockSchema = z.object({
    ids: z.array(idSchema).min(1, "Au moins un ID est requis"),
});
export const bulkUpdateStockSchema = z.object({
    stocks: z
        .array(z.object({
        id: idSchema,
        quantite: z
            .number()
            .int()
            .min(STOCK_CONSTRAINTS.QUANTITE_MIN)
            .optional(),
        quantite_minimum: z
            .number()
            .int()
            .min(STOCK_CONSTRAINTS.QUANTITE_MINIMUM_MIN)
            .optional(),
    }))
        .min(1, "Au moins un stock est requis"),
});
export const checkStockAvailabilitySchema = z.object({
    article_id: idSchema,
    taille_id: idSchema,
    quantite_demandee: z
        .number()
        .int()
        .positive("La quantité demandée doit être positive"),
});
export const bulkAdjustStockSchema = z.object({
    adjustments: z
        .array(z.object({
        article_id: idSchema,
        taille_id: idSchema,
        quantite: z
            .number()
            .int()
            .refine((val) => val !== 0, "La quantité ne peut pas être zéro"),
    }))
        .min(1, "Au moins un ajustement est requis"),
    motif: z.string().min(1, "Le motif est requis").max(65535).trim(),
});
//# sourceMappingURL=stock.validators.js.map