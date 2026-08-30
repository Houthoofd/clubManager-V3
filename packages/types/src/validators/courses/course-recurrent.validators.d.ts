import { z } from "zod";
export declare const createCourseRecurrentSchema: z.ZodEffects<z.ZodObject<{
    type_cours: z.ZodString;
    jour_semaine: z.ZodNumber;
    heure_debut: z.ZodString;
    heure_fin: z.ZodString;
    active: z.ZodDefault<z.ZodBoolean>;
    professeur_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    professeur_ids?: number[] | undefined;
}, {
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    active?: boolean | undefined;
    professeur_ids?: number[] | undefined;
}>, {
    active: boolean;
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    professeur_ids?: number[] | undefined;
}, {
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    active?: boolean | undefined;
    professeur_ids?: number[] | undefined;
}>;
export declare const updateCourseRecurrentSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodNumber;
    type_cours: z.ZodOptional<z.ZodString>;
    jour_semaine: z.ZodOptional<z.ZodNumber>;
    heure_debut: z.ZodOptional<z.ZodString>;
    heure_fin: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
    professeur_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    active?: boolean | undefined;
    type_cours?: string | undefined;
    jour_semaine?: number | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    professeur_ids?: number[] | undefined;
}, {
    id: number;
    active?: boolean | undefined;
    type_cours?: string | undefined;
    jour_semaine?: number | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    professeur_ids?: number[] | undefined;
}>, {
    id: number;
    active?: boolean | undefined;
    type_cours?: string | undefined;
    jour_semaine?: number | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    professeur_ids?: number[] | undefined;
}, {
    id: number;
    active?: boolean | undefined;
    type_cours?: string | undefined;
    jour_semaine?: number | undefined;
    heure_debut?: string | undefined;
    heure_fin?: string | undefined;
    professeur_ids?: number[] | undefined;
}>;
export declare const assignProfessorSchema: z.ZodObject<{
    cours_recurrent_id: z.ZodNumber;
    professeur_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    cours_recurrent_id: number;
    professeur_id: number;
}, {
    cours_recurrent_id: number;
    professeur_id: number;
}>;
export declare const unassignProfessorSchema: z.ZodObject<{
    cours_recurrent_id: z.ZodNumber;
    professeur_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    cours_recurrent_id: number;
    professeur_id: number;
}, {
    cours_recurrent_id: number;
    professeur_id: number;
}>;
export declare const searchCourseRecurrentSchema: z.ZodObject<{
    type_cours: z.ZodOptional<z.ZodString>;
    jour_semaine: z.ZodOptional<z.ZodNumber>;
    active: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    professeur_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["type_cours", "jour_semaine", "heure_debut", "created_at"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    active?: boolean | undefined;
    sort_by?: "created_at" | "type_cours" | "jour_semaine" | "heure_debut" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    type_cours?: string | undefined;
    jour_semaine?: number | undefined;
    professeur_id?: number | undefined;
}, {
    active?: string | boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "type_cours" | "jour_semaine" | "heure_debut" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    type_cours?: string | undefined;
    jour_semaine?: number | undefined;
    professeur_id?: number | undefined;
}>;
export declare const toggleCourseRecurrentSchema: z.ZodObject<{
    id: z.ZodNumber;
    active: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    id: number;
}, {
    active: boolean;
    id: number;
}>;
export type CreateCourseRecurrentInput = z.infer<typeof createCourseRecurrentSchema>;
export type UpdateCourseRecurrentInput = z.infer<typeof updateCourseRecurrentSchema>;
export type AssignProfessorInput = z.infer<typeof assignProfessorSchema>;
export type UnassignProfessorInput = z.infer<typeof unassignProfessorSchema>;
export type SearchCourseRecurrentInput = z.infer<typeof searchCourseRecurrentSchema>;
export type ToggleCourseRecurrentInput = z.infer<typeof toggleCourseRecurrentSchema>;
//# sourceMappingURL=course-recurrent.validators.d.ts.map