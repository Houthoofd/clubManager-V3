import { z } from "zod";
export declare const categorySchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ordre: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    ordre: number;
    description?: string | null | undefined;
}, {
    id: number;
    nom: string;
    description?: string | null | undefined;
    ordre?: number | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    description?: string | null | undefined;
    ordre?: number | undefined;
}, {
    nom: string;
    description?: string | null | undefined;
    ordre?: number | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    description?: string | null | undefined;
    ordre?: number | undefined;
}, {
    nom?: string | undefined;
    description?: string | null | undefined;
    ordre?: number | undefined;
}>;
export declare const categoryIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const categoryQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    ordre_min: z.ZodOptional<z.ZodNumber>;
    ordre_max: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    ordre_min?: number | undefined;
    ordre_max?: number | undefined;
}, {
    search?: string | undefined;
    ordre_min?: number | undefined;
    ordre_max?: number | undefined;
}>;
export declare const bulkCategorySchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const reorderCategoriesSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
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
    categories: {
        id: number;
        ordre: number;
    }[];
}, {
    categories: {
        id: number;
        ordre: number;
    }[];
}>;
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type BulkCategoryInput = z.infer<typeof bulkCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
//# sourceMappingURL=category.validators.d.ts.map