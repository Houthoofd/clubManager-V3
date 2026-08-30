import { z } from "zod";
export declare const gradeBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    ordre: z.ZodDefault<z.ZodNumber>;
    couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    ordre: number;
    couleur?: string | null | undefined;
}, {
    id: number;
    nom: string;
    ordre?: number | undefined;
    couleur?: string | null | undefined;
}>;
export type Grade = z.infer<typeof gradeBaseSchema>;
export declare const createGradeSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    nom: z.ZodString;
    ordre: z.ZodDefault<z.ZodNumber>;
    couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "nom" | "ordre" | "couleur">, "strip", z.ZodTypeAny, {
    nom: string;
    ordre: number;
    couleur?: string | null | undefined;
}, {
    nom: string;
    ordre?: number | undefined;
    couleur?: string | null | undefined;
}>;
export type CreateGrade = z.infer<typeof createGradeSchema>;
export declare const updateGradeSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    ordre: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    couleur: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    nom?: string | undefined;
    ordre?: number | undefined;
    couleur?: string | null | undefined;
}, {
    nom?: string | undefined;
    ordre?: number | undefined;
    couleur?: string | null | undefined;
}>;
export type UpdateGrade = z.infer<typeof updateGradeSchema>;
export declare const listGradesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    search: z.ZodOptional<z.ZodString>;
    ordre_min: z.ZodOptional<z.ZodNumber>;
    ordre_max: z.ZodOptional<z.ZodNumber>;
    couleur: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodDefault<z.ZodEnum<["nom", "ordre", "id"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "id" | "nom" | "ordre";
    sort_order: "asc" | "desc";
    search?: string | undefined;
    couleur?: string | undefined;
    ordre_min?: number | undefined;
    ordre_max?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "id" | "nom" | "ordre" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    couleur?: string | undefined;
    ordre_min?: number | undefined;
    ordre_max?: number | undefined;
}>;
export type ListGradesQuery = z.infer<typeof listGradesSchema>;
export declare const gradesByOrderRangeSchema: z.ZodEffects<z.ZodObject<{
    ordre_min: z.ZodNumber;
    ordre_max: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ordre_min: number;
    ordre_max: number;
}, {
    ordre_min: number;
    ordre_max: number;
}>, {
    ordre_min: number;
    ordre_max: number;
}, {
    ordre_min: number;
    ordre_max: number;
}>;
export type GradesByOrderRangeQuery = z.infer<typeof gradesByOrderRangeSchema>;
export declare const gradeIdSchema: z.ZodNumber;
export declare const gradeIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const gradeIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type GradeIdParam = z.infer<typeof gradeIdParamSchema>;
export declare const gradeResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodString;
    ordre: z.ZodDefault<z.ZodNumber>;
    couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom: string;
    ordre: number;
    couleur?: string | null | undefined;
}, {
    id: number;
    nom: string;
    ordre?: number | undefined;
    couleur?: string | null | undefined;
}>;
export type GradeResponse = z.infer<typeof gradeResponseSchema>;
export declare const gradesListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        ordre: z.ZodDefault<z.ZodNumber>;
        couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
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
        ordre: number;
        couleur?: string | null | undefined;
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
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type GradesListResponse = z.infer<typeof gradesListResponseSchema>;
export declare const gradeStatsSchema: z.ZodObject<{
    total: z.ZodNumber;
    by_order: z.ZodRecord<z.ZodString, z.ZodNumber>;
    highest_order: z.ZodNumber;
    lowest_order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    by_order: Record<string, number>;
    highest_order: number;
    lowest_order: number;
}, {
    total: number;
    by_order: Record<string, number>;
    highest_order: number;
    lowest_order: number;
}>;
export type GradeStats = z.infer<typeof gradeStatsSchema>;
export declare const gradeProgressionSchema: z.ZodObject<{
    current: z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        ordre: z.ZodDefault<z.ZodNumber>;
        couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    }>;
    previous: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        ordre: z.ZodDefault<z.ZodNumber>;
        couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    }>>>;
    next: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        nom: z.ZodString;
        ordre: z.ZodDefault<z.ZodNumber>;
        couleur: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    }, {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    current: {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    };
    previous?: {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    } | null | undefined;
    next?: {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string | null | undefined;
    } | null | undefined;
}, {
    current: {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    };
    previous?: {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    } | null | undefined;
    next?: {
        id: number;
        nom: string;
        ordre?: number | undefined;
        couleur?: string | null | undefined;
    } | null | undefined;
}>;
export type GradeProgression = z.infer<typeof gradeProgressionSchema>;
//# sourceMappingURL=grade.validators.d.ts.map