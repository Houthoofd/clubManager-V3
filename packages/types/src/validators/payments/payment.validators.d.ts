import { z } from "zod";
declare const paymentMethodSchema: z.ZodEnum<["stripe", "especes", "virement", "autre"]>;
declare const paymentStatusSchema: z.ZodEnum<["en_attente", "valide", "echoue", "rembourse"]>;
export declare const createPaymentSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    montant: z.ZodNumber;
    methode_paiement: z.ZodEnum<["stripe", "especes", "virement", "autre"]>;
    plan_tarifaire_id: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    montant: number;
    methode_paiement: "autre" | "stripe" | "especes" | "virement";
    description?: string | undefined;
    plan_tarifaire_id?: number | undefined;
}, {
    utilisateur_id: number;
    montant: number;
    methode_paiement: "autre" | "stripe" | "especes" | "virement";
    description?: string | undefined;
    plan_tarifaire_id?: number | undefined;
}>;
export declare const updatePaymentSchema: z.ZodObject<{
    id: z.ZodNumber;
    statut: z.ZodOptional<z.ZodEnum<["en_attente", "valide", "echoue", "rembourse"]>>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    description?: string | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
}, {
    id: number;
    description?: string | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
}>;
export declare const refundPaymentSchema: z.ZodObject<{
    id: z.ZodNumber;
    raison: z.ZodString;
    montant_rembourse: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    raison: string;
    montant_rembourse: number;
}, {
    id: number;
    raison: string;
    montant_rembourse: number;
}>;
export declare const searchPaymentSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
    statut: z.ZodOptional<z.ZodEnum<["en_attente", "valide", "echoue", "rembourse"]>>;
    methode_paiement: z.ZodOptional<z.ZodEnum<["stripe", "especes", "virement", "autre"]>>;
    plan_tarifaire_id: z.ZodOptional<z.ZodNumber>;
    montant_min: z.ZodOptional<z.ZodNumber>;
    montant_max: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["date_paiement", "montant", "statut", "methode_paiement"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
    search?: string | undefined;
    sort_by?: "statut" | "montant" | "date_paiement" | "methode_paiement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    methode_paiement?: "autre" | "stripe" | "especes" | "virement" | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
}, {
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "statut" | "montant" | "date_paiement" | "methode_paiement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    methode_paiement?: "autre" | "stripe" | "especes" | "virement" | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
}>, {
    page: number;
    limit: number;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
    search?: string | undefined;
    sort_by?: "statut" | "montant" | "date_paiement" | "methode_paiement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    methode_paiement?: "autre" | "stripe" | "especes" | "virement" | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
}, {
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "statut" | "montant" | "date_paiement" | "methode_paiement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    methode_paiement?: "autre" | "stripe" | "especes" | "virement" | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
}>, {
    page: number;
    limit: number;
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
    search?: string | undefined;
    sort_by?: "statut" | "montant" | "date_paiement" | "methode_paiement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    methode_paiement?: "autre" | "stripe" | "especes" | "virement" | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
}, {
    utilisateur_id?: number | undefined;
    statut?: "en_attente" | "valide" | "echoue" | "rembourse" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sort_by?: "statut" | "montant" | "date_paiement" | "methode_paiement" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    plan_tarifaire_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    methode_paiement?: "autre" | "stripe" | "especes" | "virement" | undefined;
    montant_min?: number | undefined;
    montant_max?: number | undefined;
}>;
export declare const stripePaymentIntentSchema: z.ZodObject<{
    payment_intent_id: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    payment_intent_id: string;
    amount: number;
}, {
    payment_intent_id: string;
    amount: number;
}>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type SearchPaymentInput = z.infer<typeof searchPaymentSchema>;
export type StripePaymentIntentInput = z.infer<typeof stripePaymentIntentSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export {};
//# sourceMappingURL=payment.validators.d.ts.map