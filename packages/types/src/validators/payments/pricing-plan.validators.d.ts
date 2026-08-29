import { z } from "zod";
export declare const createPricingPlanSchema: z.ZodObject<{
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    prix: z.ZodNumber;
    duree_mois: z.ZodNumber;
    actif: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nom: string;
    prix: number;
    duree_mois: number;
    description?: string | undefined;
    actif?: boolean | undefined;
}, {
    nom: string;
    prix: number;
    duree_mois: number;
    description?: string | undefined;
    actif?: boolean | undefined;
}>;
export declare const updatePricingPlanSchema: z.ZodObject<{
    id: z.ZodNumber;
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    prix: z.ZodOptional<z.ZodNumber>;
    duree_mois: z.ZodOptional<z.ZodNumber>;
    actif: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: number;
    nom?: string | undefined;
    description?: string | undefined;
    prix?: number | undefined;
    actif?: boolean | undefined;
    duree_mois?: number | undefined;
}, {
    id: number;
    nom?: string | undefined;
    description?: string | undefined;
    prix?: number | undefined;
    actif?: boolean | undefined;
    duree_mois?: number | undefined;
}>;
export declare const searchPricingPlanSchema: z.ZodEffects<z.ZodObject<{
    actif: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    prix_min: z.ZodOptional<z.ZodNumber>;
    prix_max: z.ZodOptional<z.ZodNumber>;
    duree_mois: z.ZodOptional<z.ZodNumber>;
    nom: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["nom", "prix", "duree_mois", "ordre", "created_at"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    nom?: string | undefined;
    actif?: boolean | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "ordre" | "prix" | "created_at" | "duree_mois" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    duree_mois?: number | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
}, {
    nom?: string | undefined;
    actif?: string | boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "ordre" | "prix" | "created_at" | "duree_mois" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    duree_mois?: number | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
}>, {
    page: number;
    limit: number;
    nom?: string | undefined;
    actif?: boolean | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "ordre" | "prix" | "created_at" | "duree_mois" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    duree_mois?: number | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
}, {
    nom?: string | undefined;
    actif?: string | boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "nom" | "ordre" | "prix" | "created_at" | "duree_mois" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    duree_mois?: number | undefined;
    prix_min?: number | undefined;
    prix_max?: number | undefined;
}>;
export declare const togglePricingPlanSchema: z.ZodObject<{
    id: z.ZodNumber;
    actif: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: number;
    actif: boolean;
}, {
    id: number;
    actif: boolean;
}>;
export type CreatePricingPlanInput = z.infer<typeof createPricingPlanSchema>;
export type UpdatePricingPlanInput = z.infer<typeof updatePricingPlanSchema>;
export type SearchPricingPlanInput = z.infer<typeof searchPricingPlanSchema>;
export type TogglePricingPlanInput = z.infer<typeof togglePricingPlanSchema>;
//# sourceMappingURL=pricing-plan.validators.d.ts.map