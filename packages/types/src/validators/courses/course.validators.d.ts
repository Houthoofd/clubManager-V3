import { z } from "zod";
export declare const createCourseSchema: z.ZodEffects<z.ZodObject<{
    date_cours: z.ZodString;
    type_cours: z.ZodString;
    heure_debut: z.ZodString;
    heure_fin: z.ZodString;
    cours_recurrent_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    annule: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    annule: boolean;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    date_cours: string;
    cours_recurrent_id?: number | null | undefined;
}, {
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    date_cours: string;
    annule?: boolean | undefined;
    cours_recurrent_id?: number | null | undefined;
}>, {
    annule: boolean;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    date_cours: string;
    cours_recurrent_id?: number | null | undefined;
}, {
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    date_cours: string;
    annule?: boolean | undefined;
    cours_recurrent_id?: number | null | undefined;
}>;
export declare const updateCourseSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodNumber;
    date_cours: z.ZodOptional<z.ZodString>;
    type_cours: z.ZodOptional<z.ZodString>;
    heure_debut: z.ZodOptional<z.ZodString>;
    heure_fin: z.ZodOptional<z.ZodString>;
    cours_recurrent_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    annule: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: number;
    annule?: boolean | undefined;
    type_cours?: string | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    date_cours?: string | undefined;
    cours_recurrent_id?: number | null | undefined;
}, {
    id: number;
    annule?: boolean | undefined;
    type_cours?: string | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    date_cours?: string | undefined;
    cours_recurrent_id?: number | null | undefined;
}>, {
    id: number;
    annule?: boolean | undefined;
    type_cours?: string | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    date_cours?: string | undefined;
    cours_recurrent_id?: number | null | undefined;
}, {
    id: number;
    annule?: boolean | undefined;
    type_cours?: string | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    date_cours?: string | undefined;
    cours_recurrent_id?: number | null | undefined;
}>;
export declare const cancelCourseSchema: z.ZodObject<{
    id: z.ZodNumber;
    annule: z.ZodBoolean;
    raison_annulation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    annule: boolean;
    id: number;
    raison_annulation?: string | undefined;
}, {
    annule: boolean;
    id: number;
    raison_annulation?: string | undefined;
}>;
export declare const searchCourseSchema: z.ZodEffects<z.ZodObject<{
    type_cours: z.ZodOptional<z.ZodString>;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
    annule: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    cours_recurrent_id: z.ZodOptional<z.ZodNumber>;
    professeur_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["date_cours", "type_cours", "heure_debut", "created_at"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    annule?: boolean | undefined;
    sort_by?: "created_at" | "type_cours" | "heure_debut" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    type_cours?: string | undefined;
    cours_recurrent_id?: number | undefined;
    professeur_id?: number | undefined;
}, {
    annule?: string | boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "type_cours" | "heure_debut" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    type_cours?: string | undefined;
    cours_recurrent_id?: number | undefined;
    professeur_id?: number | undefined;
}>, {
    page: number;
    limit: number;
    annule?: boolean | undefined;
    sort_by?: "created_at" | "type_cours" | "heure_debut" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    type_cours?: string | undefined;
    cours_recurrent_id?: number | undefined;
    professeur_id?: number | undefined;
}, {
    annule?: string | boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "type_cours" | "heure_debut" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    type_cours?: string | undefined;
    cours_recurrent_id?: number | undefined;
    professeur_id?: number | undefined;
}>;
export declare const duplicateCourseSchema: z.ZodObject<{
    id: z.ZodNumber;
    nouvelle_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    nouvelle_date: string;
}, {
    id: number;
    nouvelle_date: string;
}>;
export declare const generateCoursesFromRecurrentSchema: z.ZodObject<{
    cours_recurrent_id: z.ZodNumber;
    date_debut: z.ZodString;
    date_fin: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date_debut: string;
    date_fin: string;
    cours_recurrent_id: number;
}, {
    date_debut: string;
    date_fin: string;
    cours_recurrent_id: number;
}>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CancelCourseInput = z.infer<typeof cancelCourseSchema>;
export type SearchCourseInput = z.infer<typeof searchCourseSchema>;
export type DuplicateCourseInput = z.infer<typeof duplicateCourseSchema>;
export type GenerateCoursesFromRecurrentInput = z.infer<typeof generateCoursesFromRecurrentSchema>;
//# sourceMappingURL=course.validators.d.ts.map