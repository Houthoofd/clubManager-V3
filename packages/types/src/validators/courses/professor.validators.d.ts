import { z } from "zod";
export declare const createProfessorSchema: z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    telephone: z.ZodOptional<z.ZodString>;
    specialite: z.ZodOptional<z.ZodString>;
    grade_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    photo_url: z.ZodOptional<z.ZodString>;
    actif: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    actif: boolean;
    prenom: string;
    email?: string | undefined;
    telephone?: string | undefined;
    grade_id?: number | null | undefined;
    photo_url?: string | undefined;
    specialite?: string | undefined;
}, {
    nom: string;
    prenom: string;
    actif?: boolean | undefined;
    email?: string | undefined;
    telephone?: string | undefined;
    grade_id?: number | null | undefined;
    photo_url?: string | undefined;
    specialite?: string | undefined;
}>;
export declare const updateProfessorSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodOptional<z.ZodString>;
    prenom: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    telephone: z.ZodOptional<z.ZodString>;
    specialite: z.ZodOptional<z.ZodString>;
    grade_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    photo_url: z.ZodOptional<z.ZodString>;
    actif: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom?: string | undefined;
    actif?: boolean | undefined;
    email?: string | undefined;
    telephone?: string | undefined;
    grade_id?: number | null | undefined;
    photo_url?: string | undefined;
    prenom?: string | undefined;
    specialite?: string | undefined;
}, {
    id: number;
    nom?: string | undefined;
    actif?: boolean | undefined;
    email?: string | undefined;
    telephone?: string | undefined;
    grade_id?: number | null | undefined;
    photo_url?: string | undefined;
    prenom?: string | undefined;
    specialite?: string | undefined;
}>;
export declare const searchProfessorSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    prenom: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    specialite: z.ZodOptional<z.ZodString>;
    actif: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    grade_id: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["nom", "prenom", "email", "specialite", "created_at"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    nom?: string | undefined;
    actif?: boolean | undefined;
    email?: string | undefined;
    grade_id?: number | undefined;
    prenom?: string | undefined;
    sort_by?: "nom" | "created_at" | "email" | "prenom" | "specialite" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    specialite?: string | undefined;
}, {
    nom?: string | undefined;
    actif?: string | boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    email?: string | undefined;
    grade_id?: number | undefined;
    prenom?: string | undefined;
    sort_by?: "nom" | "created_at" | "email" | "prenom" | "specialite" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    specialite?: string | undefined;
}>;
export declare const toggleProfessorSchema: z.ZodObject<{
    id: z.ZodNumber;
    actif: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: number;
    actif: boolean;
}, {
    id: number;
    actif: boolean;
}>;
export declare const getProfessorCoursesSchema: z.ZodObject<{
    professeur_id: z.ZodNumber;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    professeur_id: number;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
}, {
    professeur_id: number;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
}>;
export type CreateProfessorInput = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorInput = z.infer<typeof updateProfessorSchema>;
export type SearchProfessorInput = z.infer<typeof searchProfessorSchema>;
export type ToggleProfessorInput = z.infer<typeof toggleProfessorSchema>;
export type GetProfessorCoursesInput = z.infer<typeof getProfessorCoursesSchema>;
//# sourceMappingURL=professor.validators.d.ts.map