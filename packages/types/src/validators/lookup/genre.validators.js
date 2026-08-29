import { z } from "zod";
import { GENRE_NAME_MAX_LENGTH, GENRE_NAME_MIN_LENGTH, LOOKUP_DEFAULT_SORT_ORDER, } from "../../constants/lookup.constants.js";
import { idSchema, idStringSchema, paginationSchema, } from "../common/common.validators.js";
export const genreBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string()
        .trim()
        .min(GENRE_NAME_MIN_LENGTH, {
        message: `Le nom doit contenir au moins ${GENRE_NAME_MIN_LENGTH} caractère`,
    })
        .max(GENRE_NAME_MAX_LENGTH, {
        message: `Le nom ne peut pas dépasser ${GENRE_NAME_MAX_LENGTH} caractères`,
    }),
});
export const createGenreSchema = genreBaseSchema.pick({
    nom: true,
});
export const updateGenreSchema = genreBaseSchema
    .pick({
    nom: true,
})
    .partial();
export const listGenresSchema = paginationSchema.extend({
    search: z.string().trim().optional(),
    sort_by: z.enum(["nom", "id"]).default("nom"),
    sort_order: z.enum(["asc", "desc"]).default(LOOKUP_DEFAULT_SORT_ORDER),
});
export const genreIdSchema = idSchema;
export const genreIdStringSchema = idStringSchema;
export const genreIdParamSchema = z.object({
    id: genreIdStringSchema,
});
export const genreResponseSchema = genreBaseSchema;
export const genresListResponseSchema = z.object({
    data: z.array(genreResponseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const genreStatsSchema = z.object({
    total: z.number().int().nonnegative(),
    usage_count: z.record(z.number().int().nonnegative()),
});
//# sourceMappingURL=genre.validators.js.map