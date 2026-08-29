import { z } from 'zod';
export declare const CreateCategoryDto: z.ZodObject<{
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
export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
export declare const UpdateCategoryDto: z.ZodObject<{
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
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
export declare const CategoryResponseDto: z.ZodObject<{
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
export type CategoryResponseDto = z.infer<typeof CategoryResponseDto>;
export declare const CategoryListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ordre: z.ZodDefault<z.ZodNumber>;
}, "id" | "nom" | "ordre">, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    ordre: number;
}, {
    id: number;
    nom: string;
    ordre?: number | undefined;
}>;
export type CategoryListItemDto = z.infer<typeof CategoryListItemDto>;
export declare const CategoryListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        nom: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ordre: z.ZodDefault<z.ZodNumber>;
    }, "id" | "nom" | "ordre">, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        ordre: number;
    }, {
        id: number;
        nom: string;
        ordre?: number | undefined;
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
        ordre: number;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        nom: string;
        ordre?: number | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type CategoryListResponseDto = z.infer<typeof CategoryListResponseDto>;
//# sourceMappingURL=CategoryDto.d.ts.map