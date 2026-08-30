import { z } from 'zod';
export declare const imageSchema: z.ZodObject<{
    id: z.ZodNumber;
    article_id: z.ZodNumber;
    url: z.ZodString;
    ordre: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    ordre: number;
    article_id: number;
    url: string;
}, {
    id: number;
    article_id: number;
    url: string;
    ordre?: number | undefined;
}>;
export declare const createImageSchema: z.ZodObject<{
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    article_id: z.ZodNumber;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    url: string;
    ordre?: number | undefined;
}, {
    article_id: number;
    url: string;
    ordre?: number | undefined;
}>;
export declare const updateImageSchema: z.ZodObject<{
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ordre?: number | undefined;
    url?: string | undefined;
}, {
    ordre?: number | undefined;
    url?: string | undefined;
}>;
export declare const imageIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const imagesByArticleParamSchema: z.ZodObject<{
    article_id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
}, {
    article_id: string;
}>;
export declare const bulkImageSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const reorderImagesSchema: z.ZodObject<{
    images: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        ordre: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        ordre: number;
    }, {
        id: number;
        ordre: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    images: {
        id: number;
        ordre: number;
    }[];
}, {
    images: {
        id: number;
        ordre: number;
    }[];
}>;
export declare const bulkCreateImagesSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    images: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        ordre: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        ordre?: number | undefined;
    }, {
        url: string;
        ordre?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    images: {
        url: string;
        ordre?: number | undefined;
    }[];
}, {
    article_id: number;
    images: {
        url: string;
        ordre?: number | undefined;
    }[];
}>;
export type Image = z.infer<typeof imageSchema>;
export type CreateImageInput = z.infer<typeof createImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
export type ImageIdParam = z.infer<typeof imageIdParamSchema>;
export type ImagesByArticleParam = z.infer<typeof imagesByArticleParamSchema>;
export type BulkImageInput = z.infer<typeof bulkImageSchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
export type BulkCreateImagesInput = z.infer<typeof bulkCreateImagesSchema>;
//# sourceMappingURL=image.validators.d.ts.map