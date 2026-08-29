import { z } from 'zod';
export declare const CreateSizeDto: z.ZodObject<{
    nom: z.ZodString;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    ordre?: number | undefined;
}, {
    nom: string;
    ordre?: number | undefined;
}>;
export type CreateSizeDto = z.infer<typeof CreateSizeDto>;
export declare const UpdateSizeDto: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    ordre?: number | undefined;
}, {
    nom?: string | undefined;
    ordre?: number | undefined;
}>;
export type UpdateSizeDto = z.infer<typeof UpdateSizeDto>;
export declare const SizeResponseDto: z.ZodObject<{
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
export type SizeResponseDto = z.infer<typeof SizeResponseDto>;
export declare const SizeListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
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
export type SizeListItemDto = z.infer<typeof SizeListItemDto>;
export declare const SizeListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        nom: z.ZodString;
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
export type SizeListResponseDto = z.infer<typeof SizeListResponseDto>;
//# sourceMappingURL=SizeDto.d.ts.map