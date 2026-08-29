export interface CreatePaymentScheduleDto {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    montant: number;
    date_echeance: string;
    statut?: string;
    description?: string;
}
export interface UpdatePaymentScheduleDto {
    id: number;
    statut?: string;
    paiement_id?: number;
    date_echeance?: string;
    montant?: number;
    description?: string;
}
export interface PaymentScheduleResponseDto {
    id: number;
    utilisateur_id: number;
    plan_tarifaire_id: number;
    montant: number;
    montant_formate: string;
    date_echeance: string;
    statut: string;
    description?: string;
    paiement_id?: number;
    is_overdue: boolean;
    jours_retard?: number;
    utilisateur: {
        id: number;
        nom: string;
        prenom: string;
        nom_complet: string;
        email?: string;
        telephone?: string;
        photo_url?: string;
    };
    plan_tarifaire: {
        id: number;
        nom: string;
        description?: string;
        prix: number;
        prix_formate: string;
        duree_mois: number;
    };
    paiement?: {
        id: number;
        montant: number;
        methode_paiement: string;
        date_paiement: string;
        statut: string;
    };
    created_at: string;
    updated_at?: string;
}
export interface PaymentScheduleListItemDto {
    id: number;
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    plan_tarifaire_nom: string;
    montant: number;
    montant_formate: string;
    date_echeance: string;
    statut: string;
    is_overdue: boolean;
    jours_retard?: number;
    paiement_id?: number;
    description?: string;
}
export interface BulkCreatePaymentScheduleDto {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    date_debut: string;
    nombre_echeances: number;
    montant_par_echeance: number;
    frequence?: string;
    description?: string;
}
export interface SearchPaymentScheduleDto {
    utilisateur_id?: number;
    plan_tarifaire_id?: number;
    date_debut?: string;
    date_fin?: string;
    statut?: string;
    is_overdue?: boolean;
    paye?: boolean;
    montant_min?: number;
    montant_max?: number;
}
export interface OverdueSchedulesDto {
    total_en_retard: number;
    montant_total_en_retard: number;
    montant_total_formate: string;
    schedules: {
        id: number;
        utilisateur_id: number;
        utilisateur_nom_complet: string;
        utilisateur_email?: string;
        utilisateur_telephone?: string;
        montant: number;
        montant_formate: string;
        date_echeance: string;
        jours_retard: number;
        plan_tarifaire_nom: string;
        description?: string;
    }[];
    par_utilisateur: {
        utilisateur_id: number;
        utilisateur_nom_complet: string;
        nombre_echeances: number;
        montant_total: number;
        montant_total_formate: string;
    }[];
}
export interface MarkAsPaidDto {
    id: number;
    paiement_id: number;
    date_paiement?: string;
}
export interface PaymentScheduleStatsDto {
    total_schedules: number;
    par_statut: {
        statut: string;
        count: number;
        montant_total: number;
        montant_formate: string;
    }[];
    nombre_en_retard: number;
    montant_en_retard: number;
    montant_en_retard_formate: string;
    nombre_a_venir: number;
    montant_a_venir: number;
    montant_a_venir_formate: string;
    taux_paiement: number;
    delai_moyen_jours?: number;
}
//# sourceMappingURL=PaymentScheduleDto.d.ts.map