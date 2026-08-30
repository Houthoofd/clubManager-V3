import { z } from 'zod';
export declare const sizeSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    ordre: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    ordre: number;
}, {
    id: number;
    nom: string;
    ordre?: number | undefined;
}>;
export declare const createSizeSchema: z.ZodObject<{
    nom: z.ZodString;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    ordre?: number | undefined;
}, {
    nom: string;
    ordre?: number | undefined;
}>;
export declare const updateSizeSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    ordre?: number | undefined;
}, {
    nom?: string | undefined;
    ordre?: number | undefined;
}>;
export declare const sizeIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const sizeQuerySchema: z.ZodObject<{
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
export declare const bulkSizeSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    ids: number[];
}, {
    ids: number[];
}>;
export declare const reorderSizesSchema: z.ZodObject<{
    sizes: z.ZodArray<z.ZodObject<{
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
    sizes: {
        id: number;
        ordre: number;
    }[];
}, {
    sizes: {
        id: number;
        ordre: number;
    }[];
}>;
export type Size = z.infer<typeof sizeSchema>;
export type CreateSizeInput = z.infer<typeof createSizeSchema>;
export type UpdateSizeInput = z.infer<typeof updateSizeSchema>;
export type SizeIdParam = z.infer<typeof sizeIdParamSchema>;
export type SizeQuery = z.infer<typeof sizeQuerySchema>;
export type BulkSizeInput = z.infer<typeof bulkSizeSchema>;
export type ReorderSizesInput = z.infer<typeof reorderSizesSchema>;
//# sourceMappingURL=size.validators.d.ts.map