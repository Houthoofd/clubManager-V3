import { z } from 'zod';
export declare const articleSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    prix: z.ZodEffects<z.ZodNumber, number, number>;
    image_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categorie_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    actif: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    prix: number;
    actif: boolean;
    created_at: Date;
    description?: string | null | undefined;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    updated_at?: Date | null | undefined;
}, {
    id: number;
    nom: string;
    prix: number;
    created_at: Date;
    description?: string | null | undefined;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    actif?: string | boolean | undefined;
    updated_at?: Date | null | undefined;
}>;
export declare const createArticleSchema: z.ZodObject<{
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    prix: z.ZodEffects<z.ZodNumber, number, number>;
    image_url: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    categorie_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    actif: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    prix: number;
    description?: string | null | undefined;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    actif?: boolean | undefined;
}, {
    nom: string;
    prix: number;
    description?: string | null | undefined;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    actif?: string | boolean | undefined;
}>;
export declare const updateArticleSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    prix: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    image_url: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    categorie_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    actif: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    description?: string | null | undefined;
    prix?: number | undefined;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    actif?: boolean | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
    prix?: number | undefined;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    actif?: string | boolean | undefined;
}>;
export declare const articleIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const articleQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    categorie_id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    actif: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false", "1", "0"]>, boolean, "1" | "0" | "true" | "false">>;
    prix_min: z.ZodOptional<z.ZodNumber>;
    prix_max: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodEnum<["nom", "prix", "created_at", "updated_at"]>>;
    sort_order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    categorie_id?: number | undefined;
    actif?: boolean | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "prix" | "created_at" | "updated_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
}, {
    categorie_id?: string | undefined;
    actif?: "1" | "0" | "true" | "false" | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "prix" | "created_at" | "updated_at" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
}>;
export declare const bulkArticleSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const toggleArticleActiveSchema: z.ZodObject<{
    actif: z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>;
}, "strip", z.ZodTypeAny, {
    actif: boolean;
}, {
    actif: string | boolean;
}>;
export declare const bulkUpdateArticlePricesSchema: z.ZodObject<{
    articles: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        prix: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        prix: number;
    }, {
        id: number;
        prix: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    articles: {
        id: number;
        prix: number;
    }[];
}, {
    articles: {
        id: number;
        prix: number;
    }[];
}>;
export declare const bulkUpdateArticleCategoriesSchema: z.ZodObject<{
    article_ids: z.ZodArray<z.ZodNumber, "many">;
    categorie_id: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    categorie_id: number | null;
    article_ids: number[];
}, {
    categorie_id: number | null;
    article_ids: number[];
}>;
export type Article = z.infer<typeof articleSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleIdParam = z.infer<typeof articleIdParamSchema>;
export type ArticleQuery = z.infer<typeof articleQuerySchema>;
export type BulkArticleInput = z.infer<typeof bulkArticleSchema>;
export type ToggleArticleActiveInput = z.infer<typeof toggleArticleActiveSchema>;
export type BulkUpdateArticlePricesInput = z.infer<typeof bulkUpdateArticlePricesSchema>;
export type BulkUpdateArticleCategoriesInput = z.infer<typeof bulkUpdateArticleCategoriesSchema>;
//# sourceMappingURL=article.validators.d.ts.map