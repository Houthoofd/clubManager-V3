import { z } from "zod";
export declare const idSchema: z.ZodNumber;
export declare const idStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const userIdSchema: z.ZodString;
export declare const dateISOSchema: z.ZodString;
export declare const dateISOOptionalSchema: z.ZodOptional<z.ZodString>;
export declare const dateSchema: z.ZodDate;
export declare const dateOptionalSchema: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
export declare const timestampSchema: z.ZodDate;
export declare const pastDateSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const futureDateSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const ageValidationSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const booleanSchema: z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>;
export declare const idsArraySchema: z.ZodArray<z.ZodNumber, "many">;
export declare const searchQuerySchema: z.ZodOptional<z.ZodString>;
export declare const sortOrderSchema: z.ZodEnum<["asc", "desc"]>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export declare const userIdParamSchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type PaginationQueryParams = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
//# sourceMappingURL=common.validators.d.ts.map