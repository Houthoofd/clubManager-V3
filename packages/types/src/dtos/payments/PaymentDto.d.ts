export interface CreatePaymentDto {
    utilisateur_id: number;
    montant: number;
    methode_paiement: string;
    plan_tarifaire_id?: number;
    description?: string;
}
export interface UpdatePaymentDto {
    id: number;
    statut?: string;
    description?: string;
}
export interface PaymentResponseDto {
    id: number;
    utilisateur_id: number;
    montant: number;
    montant_formate: string;
    methode_paiement: string;
    statut: string;
    description?: string;
    date_paiement: string;
    utilisateur: {
        id: number;
        nom: string;
        prenom: string;
        nom_complet: string;
        email?: string;
        telephone?: string;
        photo_url?: string;
    };
    plan_tarifaire?: {
        id: number;
        nom: string;
        description?: string;
        prix: number;
        prix_formate: string;
        duree_mois: number;
    };
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
    created_at: string;
    updated_at?: string;
}
export interface PaymentListItemDto {
    id: number;
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    montant: number;
    montant_formate: string;
    methode_paiement: string;
    statut: string;
    date_paiement: string;
    plan_tarifaire_nom?: string;
    description?: string;
}
export interface RefundPaymentDto {
    id: number;
    raison: string;
    montant_rembourse: number;
}
export interface SearchPaymentDto {
    utilisateur_id?: number;
    date_debut?: string;
    date_fin?: string;
    statut?: string;
    methode_paiement?: string;
    plan_tarifaire_id?: number;
    montant_min?: number;
    montant_max?: number;
}
export interface PaymentStatsDto {
    total_paiements: number;
    montant_total: number;
    montant_total_formate: string;
    par_methode: {
        methode: string;
        count: number;
        montant_total: number;
        montant_formate: string;
    }[];
    par_statut: {
        statut: string;
        count: number;
        montant_total: number;
        montant_formate: string;
    }[];
    revenue_mois_courant: number;
    revenue_mois_courant_formate: string;
    revenue_annee_courante: number;
    revenue_annee_courante_formate: string;
    montant_moyen: number;
    montant_moyen_formate: string;
    evolution_mensuelle?: {
        mois: string;
        count: number;
        montant_total: number;
    }[];
}
export interface StripePaymentIntentDto {
    payment_intent_id: string;
    amount: number;
    currency: string;
    client_secret: string;
    status: string;
}
//# sourceMappingURL=PaymentDto.d.ts.map