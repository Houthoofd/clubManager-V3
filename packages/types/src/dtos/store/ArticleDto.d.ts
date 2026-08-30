import { z } from 'zod';
export declare const CreateArticleDto: z.ZodObject<{
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
export type CreateArticleDto = z.infer<typeof CreateArticleDto>;
export declare const UpdateArticleDto: z.ZodObject<{
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
export type UpdateArticleDto = z.infer<typeof UpdateArticleDto>;
export declare const ArticleResponseDto: z.ZodObject<{
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
export type ArticleResponseDto = z.infer<typeof ArticleResponseDto>;
export declare const ArticleListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    prix: z.ZodEffects<z.ZodNumber, number, number>;
    image_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categorie_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    actif: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "id" | "nom" | "prix" | "image_url" | "categorie_id" | "actif">, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    prix: number;
    actif: boolean;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
}, {
    id: number;
    nom: string;
    prix: number;
    image_url?: string | null | undefined;
    categorie_id?: number | null | undefined;
    actif?: string | boolean | undefined;
}>;
export type ArticleListItemDto = z.infer<typeof ArticleListItemDto>;
export declare const ArticleListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        nom: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prix: z.ZodEffects<z.ZodNumber, number, number>;
        image_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        categorie_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        actif: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
        created_at: z.ZodDate;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "id" | "nom" | "prix" | "image_url" | "categorie_id" | "actif">, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        prix: number;
        actif: boolean;
        image_url?: string | null | undefined;
        categorie_id?: number | null | undefined;
    }, {
        id: number;
        nom: string;
        prix: number;
        image_url?: string | null | undefined;
        categorie_id?: number | null | undefined;
        actif?: string | boolean | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    total: number;
    items: {
        id: number;
        nom: string;
        prix: number;
        actif: boolean;
        image_url?: string | null | undefined;
        categorie_id?: number | null | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        nom: string;
        prix: number;
        image_url?: string | null | undefined;
        categorie_id?: number | null | undefined;
        actif?: string | boolean | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type ArticleListResponseDto = z.infer<typeof ArticleListResponseDto>;
//# sourceMappingURL=ArticleDto.d.ts.map