import { z } from "zod";
declare const scheduleStatusSchema: z.ZodEnum<["en_attente", "paye", "en_retard", "annule"]>;
export declare const createPaymentScheduleSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    plan_tarifaire_id: z.ZodNumber;
    montant: z.ZodNumber;
    date_echeance: z.ZodEffects<z.ZodString, string, string>;
    statut: z.ZodOptional<z.ZodDefault<z.ZodEnum<["en_attente", "paye", "en_retard", "annule"]>>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    montant: number;
    date_echeance: string;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
}, {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    montant: number;
    date_echeance: string;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
}>;
export declare const updatePaymentScheduleSchema: z.ZodObject<{
    id: z.ZodNumber;
    statut: z.ZodOptional<z.ZodEnum<["en_attente", "paye", "en_retard", "annule"]>>;
    paiement_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    paiement_id?: number | undefined;
}, {
    id: number;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    paiement_id?: number | undefined;
}>;
export declare const bulkCreatePaymentScheduleSchema: z.ZodEffects<z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    plan_tarifaire_id: z.ZodNumber;
    nombre_echeances: z.ZodNumber;
    date_debut: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    date_debut: string;
    nombre_echeances: number;
}, {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    date_debut: string;
    nombre_echeances: number;
}>, {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    date_debut: string;
    nombre_echeances: number;
}, {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    date_debut: string;
    nombre_echeances: number;
}>;
export declare const searchPaymentScheduleSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    plan_tarifaire_id: z.ZodOptional<z.ZodNumber>;
    statut: z.ZodOptional<z.ZodEnum<["en_attente", "paye", "en_retard", "annule"]>>;
    date_echeance_debut: z.ZodOptional<z.ZodString>;
    date_echeance_fin: z.ZodOptional<z.ZodString>;
    montant_min: z.ZodOptional<z.ZodNumber>;
    montant_max: z.ZodOptional<z.ZodNumber>;
    en_retard: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["date_echeance", "montant", "statut", "utilisateur_id", "created_at"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    en_retard?: boolean | undefined;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    search?: string | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "statut" | "montant" | "date_echeance" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
    date_echeance_debut?: string | undefined;
    date_echeance_fin?: string | undefined;
}, {
    en_retard?: boolean | undefined;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "statut" | "montant" | "date_echeance" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
    date_echeance_debut?: string | undefined;
    date_echeance_fin?: string | undefined;
}>, {
    page: number;
    limit: number;
    en_retard?: boolean | undefined;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    search?: string | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "statut" | "montant" | "date_echeance" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
    date_echeance_debut?: string | undefined;
    date_echeance_fin?: string | undefined;
}, {
    en_retard?: boolean | undefined;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "statut" | "montant" | "date_echeance" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
    date_echeance_debut?: string | undefined;
    date_echeance_fin?: string | undefined;
}>, {
    page: number;
    limit: number;
    en_retard?: boolean | undefined;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    search?: string | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "statut" | "montant" | "date_echeance" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
    date_echeance_debut?: string | undefined;
    date_echeance_fin?: string | undefined;
}, {
    en_retard?: boolean | undefined;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "paye" | "en_retard" | "annule" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "statut" | "montant" | "date_echeance" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
    date_echeance_debut?: string | undefined;
    date_echeance_fin?: string | undefined;
}>;
export declare const markAsPaidSchema: z.ZodObject<{
    id: z.ZodNumber;
    paiement_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    paiement_id: number;
}, {
    id: number;
    paiement_id: number;
}>;
export type CreatePaymentScheduleInput = z.infer<typeof createPaymentScheduleSchema>;
export type UpdatePaymentScheduleInput = z.infer<typeof updatePaymentScheduleSchema>;
export type BulkCreatePaymentScheduleInput = z.infer<typeof bulkCreatePaymentScheduleSchema>;
export type SearchPaymentScheduleInput = z.infer<typeof searchPaymentScheduleSchema>;
export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>;
export type ScheduleStatus = z.infer<typeof scheduleStatusSchema>;
export {};
//# sourceMappingURL=payment-schedule.validators.d.ts.map