import { z } from "zod";
export declare const genreBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
}, {
    id: number;
    nom: string;
}>;
export type Genre = z.infer<typeof genreBaseSchema>;
export declare const createGenreSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
}, "nom">, "strip", z.ZodTypeAny, {
    nom: string;
}, {
    nom: string;
}>;
export type CreateGenre = z.infer<typeof createGenreSchema>;
export declare const updateGenreSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
}, {
    nom?: string | undefined;
}>;
export type UpdateGenre = z.infer<typeof updateGenreSchema>;
export declare const listGenresSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["nom", "id"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "id" | "nom";
    sort_order: "asc" | "desc";
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "id" | "nom" | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export type ListGenresQuery = z.infer<typeof listGenresSchema>;
export declare const genreIdSchema: z.ZodNumber;
export declare const genreIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const genreIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type GenreIdParam = z.infer<typeof genreIdParamSchema>;
export declare const genreResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
}, {
    id: number;
    nom: string;
}>;
export type GenreResponse = z.infer<typeof genreResponseSchema>;
export declare const genresListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
    }, {
        id: number;
        nom: string;
    }>, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        page_size: z.ZodNumber;
        total: z.ZodNumber;
        total_pages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }, {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        id: number;
        nom: string;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}, {
    data: {
        id: number;
        nom: string;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type GenresListResponse = z.infer<typeof genresListResponseSchema>;
export declare const genreStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    usage_count: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    total: number;
    usage_count: Record<string, number>;
}, {
    total: number;
    usage_count: Record<string, number>;
}>;
export type GenreStats = z.infer<typeof genreStatsSchema>;
//# sourceMappingURL=genre.validators.d.ts.map