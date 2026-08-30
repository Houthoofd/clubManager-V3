import { z } from "zod";
export declare const statisticBaseSchema: z.ZodObject<{
    id: z.ZodNumber;
    type: z.ZodString;
    cle: z.ZodString;
    valeur: z.ZodString;
    date_stat: z.ZodDate;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    type: string;
    created_at: Date;
    cle: string;
    valeur: string;
    date_stat: Date;
}, {
    id: number;
    type: string;
    created_at: Date;
    cle: string;
    valeur: string;
    date_stat: Date;
}>;
export type Statistic = z.infer<typeof statisticBaseSchema>;
export declare const createStatisticSchema: z.ZodObject<Pick<{
    id: z.ZodNumber;
    type: z.ZodString;
    cle: z.ZodString;
    valeur: z.ZodString;
    date_stat: z.ZodDate;
    created_at: z.ZodDate;
}, "type" | "cle" | "valeur" | "date_stat">, "strip", z.ZodTypeAny, {
    type: string;
    cle: string;
    valeur: string;
    date_stat: Date;
}, {
    type: string;
    cle: string;
    valeur: string;
    date_stat: Date;
}>;
export type CreateStatistic = z.infer<typeof createStatisticSchema>;
export declare const createStatisticWithJsonSchema: z.ZodObject<{
    type: z.ZodString;
    cle: z.ZodString;
    valeur: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    date_stat: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    type: string;
    cle: string;
    valeur: Record<string, unknown>;
    date_stat: Date;
}, {
    type: string;
    cle: string;
    valeur: Record<string, unknown>;
    date_stat: Date;
}>;
export type CreateStatisticWithJson = z.infer<typeof createStatisticWithJsonSchema>;
export declare const updateStatisticSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    cle: z.ZodOptional<z.ZodString>;
    valeur: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    cle?: string | undefined;
    valeur?: string | undefined;
}, {
    type?: string | undefined;
    cle?: string | undefined;
    valeur?: string | undefined;
}>;
export type UpdateStatistic = z.infer<typeof updateStatisticSchema>;
export declare const listStatisticsSchema: z.ZodEffects<z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    type: z.ZodOptional<z.ZodString>;
    cle: z.ZodOptional<z.ZodString>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_stat", "type", "cle", "created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by: "type" | "created_at" | "cle" | "date_stat";
    sort_order: "asc" | "desc";
    type?: string | undefined;
    cle?: string | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    type?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    cle?: string | undefined;
    sort_by?: "type" | "created_at" | "cle" | "date_stat" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>, {
    page: number;
    limit: number;
    sort_by: "type" | "created_at" | "cle" | "date_stat";
    sort_order: "asc" | "desc";
    type?: string | undefined;
    cle?: string | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    type?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    cle?: string | undefined;
    sort_by?: "type" | "created_at" | "cle" | "date_stat" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export type ListStatisticsQuery = z.infer<typeof listStatisticsSchema>;
export declare const statisticsByTypeSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    type: z.ZodString;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    sort_by: z.ZodDefault<z.ZodEnum<["date_stat", "cle"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    page: number;
    limit: number;
    sort_by: "cle" | "date_stat";
    sort_order: "asc" | "desc";
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    type: string;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "cle" | "date_stat" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}>;
export type StatisticsByTypeQuery = z.infer<typeof statisticsByTypeSchema>;
export declare const statisticsByDateRangeSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    date_debut: z.ZodDate;
    date_fin: z.ZodDate;
    type: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date_debut: Date;
    date_fin: Date;
    type?: string | undefined;
}, {
    date_debut: Date;
    date_fin: Date;
    type?: string | undefined;
}>, {
    date_debut: Date;
    date_fin: Date;
    type?: string | undefined;
}, {
    date_debut: Date;
    date_fin: Date;
    type?: string | undefined;
}>, {
    date_debut: Date;
    date_fin: Date;
    type?: string | undefined;
}, {
    date_debut: Date;
    date_fin: Date;
    type?: string | undefined;
}>;
export type StatisticsByDateRangeQuery = z.infer<typeof statisticsByDateRangeSchema>;
export declare const statisticIdSchema: z.ZodNumber;
export declare const statisticIdStringSchema: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
export declare const statisticIdParamSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: string;
}>;
export type StatisticIdParam = z.infer<typeof statisticIdParamSchema>;
export declare const bulkCreateStatisticsSchema: z.ZodObject<{
    statistics: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        type: z.ZodString;
        cle: z.ZodString;
        valeur: z.ZodString;
        date_stat: z.ZodDate;
        created_at: z.ZodDate;
    }, "type" | "cle" | "valeur" | "date_stat">, "strip", z.ZodTypeAny, {
        type: string;
        cle: string;
        valeur: string;
        date_stat: Date;
    }, {
        type: string;
        cle: string;
        valeur: string;
        date_stat: Date;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    statistics: {
        type: string;
        cle: string;
        valeur: string;
        date_stat: Date;
    }[];
}, {
    statistics: {
        type: string;
        cle: string;
        valeur: string;
        date_stat: Date;
    }[];
}>;
export type BulkCreateStatistics = z.infer<typeof bulkCreateStatisticsSchema>;
export declare const bulkDeleteStatisticsSchema: z.ZodObject<{
    statistic_ids: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    statistic_ids: number[];
}, {
    statistic_ids: number[];
}>;
export type BulkDeleteStatistics = z.infer<typeof bulkDeleteStatisticsSchema>;
export declare const statisticResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    type: z.ZodString;
    cle: z.ZodString;
    valeur: z.ZodString;
    date_stat: z.ZodDate;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    type: string;
    created_at: Date;
    cle: string;
    valeur: string;
    date_stat: Date;
}, {
    id: number;
    type: string;
    created_at: Date;
    cle: string;
    valeur: string;
    date_stat: Date;
}>;
export type StatisticResponse = z.infer<typeof statisticResponseSchema>;
export declare const statisticsListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        type: z.ZodString;
        cle: z.ZodString;
        valeur: z.ZodString;
        date_stat: z.ZodDate;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
    }, {
        id: number;
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
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
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
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
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
    }[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}>;
export type StatisticsListResponse = z.infer<typeof statisticsListResponseSchema>;
export declare const statisticsSummarySchema: z.ZodObject<{
    type: z.ZodString;
    count: z.ZodNumber;
    date_debut: z.ZodDate;
    date_fin: z.ZodDate;
    statistics: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        type: z.ZodString;
        cle: z.ZodString;
        valeur: z.ZodString;
        date_stat: z.ZodDate;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: number;
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
    }, {
        id: number;
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: string;
    date_debut: Date;
    date_fin: Date;
    count: number;
    statistics?: {
        id: number;
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
    }[] | undefined;
}, {
    type: string;
    date_debut: Date;
    date_fin: Date;
    count: number;
    statistics?: {
        id: number;
        type: string;
        created_at: Date;
        cle: string;
        valeur: string;
        date_stat: Date;
    }[] | undefined;
}>;
export type StatisticsSummary = z.infer<typeof statisticsSummarySchema>;
export declare const aggregatedStatisticsSchema: z.ZodObject<{
    total_records: z.ZodNumber;
    types: z.ZodRecord<z.ZodString, z.ZodNumber>;
    date_range: z.ZodObject<{
        earliest: z.ZodDate;
        latest: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        earliest: Date;
        latest: Date;
    }, {
        earliest: Date;
        latest: Date;
    }>;
}, "strip", z.ZodTypeAny, {
    date_range: {
        earliest: Date;
        latest: Date;
    };
    total_records: number;
    types: Record<string, number>;
}, {
    date_range: {
        earliest: Date;
        latest: Date;
    };
    total_records: number;
    types: Record<string, number>;
}>;
export type AggregatedStatistics = z.infer<typeof aggregatedStatisticsSchema>;
//# sourceMappingURL=statistic.validators.d.ts.map