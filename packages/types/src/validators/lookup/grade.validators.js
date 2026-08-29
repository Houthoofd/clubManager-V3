import { z } from "zod";
import { GRADE_NAME_MAX_LENGTH, GRADE_NAME_MIN_LENGTH, GRADE_COLOR_MAX_LENGTH, GRADE_MIN_ORDER, GRADE_MAX_ORDER, LOOKUP_DEFAULT_SORT_ORDER, } from "../../constants/lookup.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const gradeBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .trim()
        .min(GRADE_NAME_MIN_LENGTH, {
        message: `Le nom doit contenir au moins ${GRADE_NAME_MIN_LENGTH} caractère`,
    })
        .max(GRADE_NAME_MAX_LENGTH, {
        message: `Le nom ne peut pas dépasser ${GRADE_NAME_MAX_LENGTH} caractères`,
    }),
    ordre: z
        .number()
        .int({ message: "L'ordre doit être un nombre entier" })
        .min(GRADE_MIN_ORDER, {
        message: `L'ordre doit être supérieur ou égal à ${GRADE_MIN_ORDER}`,
    })
        .max(GRADE_MAX_ORDER, {
        message: `L'ordre ne peut pas dépasser ${GRADE_MAX_ORDER}`,
    })
        .default(0),
    couleur: z
        .string()
        .trim()
        .max(GRADE_COLOR_MAX_LENGTH, {
        message: `La couleur ne peut pas dépasser ${GRADE_COLOR_MAX_LENGTH} caractères`,
    })
        .nullable()
        .optional(),
});
export const createGradeSchema = gradeBaseSchema.pick({
    nom: true,
    ordre: true,
    couleur: true,
});
export const updateGradeSchema = gradeBaseSchema
    .pick({
    nom: true,
    ordre: true,
    couleur: true,
})
    .partial();
export const listGradesSchema = paginationSchema.extend({
    search: z.string().trim().optional(),
    ordre_min: z.coerce.number().int().min(GRADE_MIN_ORDER).optional(),
    ordre_max: z.coerce.number().int().max(GRADE_MAX_ORDER).optional(),
    couleur: z.string().trim().optional(),
    sort_by: z.enum(["nom", "ordre", "id"]).default("ordre"),
    sort_order: z.enum(["asc", "desc"]).default(LOOKUP_DEFAULT_SORT_ORDER),
});
export const gradesByOrderRangeSchema = z
    .object({
    ordre_min: z.number().int().min(GRADE_MIN_ORDER),
    ordre_max: z.number().int().max(GRADE_MAX_ORDER),
})
    .refine((data) => data.ordre_max >= data.ordre_min, {
    message: "L'ordre maximum doit être supérieur ou égal à l'ordre minimum",
    path: ["ordre_max"],
});
export const gradeIdSchema = idSchema;
export const gradeIdStringSchema = idStringSchema;
export const gradeIdParamSchema = z.object({
    id: gradeIdStringSchema,
});
export const gradeResponseSchema = gradeBaseSchema;
export const gradesListResponseSchema = z.object({
    data: z.array(gradeResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const gradeStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    by_order: z.record(z.number().int().nonnegative()),
    highest_order: z.number().int().nonnegative(),
    lowest_order: z.number().int().nonnegative(),
});
export const gradeProgressionSchema = z.object({
    current: gradeResponseSchema,
    previous: gradeResponseSchema.nullable().optional(),
    next: gradeResponseSchema.nullable().optional(),
});
//# sourceMappingURL=grade.validators.js.map