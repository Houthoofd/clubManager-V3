import { z } from 'zod';
export declare const CreateImageDto: z.ZodObject<{
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
export type CreateImageDto = z.infer<typeof CreateImageDto>;
export declare const UpdateImageDto: z.ZodObject<{
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ordre?: number | undefined;
    url?: string | undefined;
}, {
    ordre?: number | undefined;
    url?: string | undefined;
}>;
export type UpdateImageDto = z.infer<typeof UpdateImageDto>;
export declare const ImageResponseDto: z.ZodObject<{
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
export type ImageResponseDto = z.infer<typeof ImageResponseDto>;
export declare const ImageListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    article_id: z.ZodNumber;
    url: z.ZodString;
    ordre: z.ZodDefault<z.ZodNumber>;
}, "id" | "ordre" | "article_id" | "url">, "strip", z.ZodTypeAny, {
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
export type ImageListItemDto = z.infer<typeof ImageListItemDto>;
export declare const ImageListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        article_id: z.ZodNumber;
        url: z.ZodString;
        ordre: z.ZodDefault<z.ZodNumber>;
    }, "id" | "ordre" | "article_id" | "url">, "strip", z.ZodTypeAny, {
        id: number;
        ordre: number;
        article_id: number;
        url: string;
    }, {
        id: number;
        article_id: number;
        url: string;
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
        ordre: number;
        article_id: number;
        url: string;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        article_id: number;
        url: string;
        ordre?: number | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type ImageListResponseDto = z.infer<typeof ImageListResponseDto>;
//# sourceMappingURL=ImageDto.d.ts.map