export interface CreatePricingPlanDto {
    nom: string;
    description?: string;
    prix: number;
    duree_mois: number;
    actif?: boolean;
    couleur?: string;
    ordre?: number;
    features?: string[];
}
export interface UpdatePricingPlanDto {
    id: number;
    nom?: string;
    description?: string;
    prix?: number;
    duree_mois?: number;
    actif?: boolean;
    couleur?: string;
    ordre?: number;
    features?: string[];
}
export interface PricingPlanResponseDto {
    id: number;
    nom: string;
    description?: string;
    prix: number;
    prix_formate: string;
    duree_mois: number;
    actif: boolean;
    couleur?: string;
    ordre: number;
    features?: string[];
    prix_par_mois: number;
    prix_par_mois_formate: string;
    nombre_abonnes: number;
    nombre_abonnes_actifs: number;
    revenue_mensuel: number;
    revenue_mensuel_formate: string;
    revenue_total: number;
    revenue_total_formate: string;
    est_populaire?: boolean;
    created_at: string;
    updated_at?: string;
}
export interface PricingPlanListItemDto {
    id: number;
    nom: string;
    description?: string;
    prix: number;
    prix_formate: string;
    duree_mois: number;
    prix_par_mois: number;
    prix_par_mois_formate: string;
    actif: boolean;
    couleur?: string;
    ordre: number;
    nombre_abonnes: number;
    est_populaire?: boolean;
}
export interface SearchPricingPlanDto {
    actif?: boolean;
    prix_min?: number;
    prix_max?: number;
    duree_mois?: number;
    nom?: string;
}
export interface PricingPlanStatsDto {
    total_plans: number;
    plans_actifs: number;
    plans_inactifs: number;
    total_abonnes: number;
    abonnes_actifs: number;
    plan_plus_populaire?: {
        id: number;
        nom: string;
        nombre_abonnes: number;
    };
    plans_par_popularite: {
        id: number;
        nom: string;
        nombre_abonnes: number;
        pourcentage: number;
    }[];
    revenue_total: number;
    revenue_total_formate: string;
    revenue_mois_courant: number;
    revenue_mois_courant_formate: string;
    revenue_annee_courante: number;
    revenue_annee_courante_formate: string;
    revenue_par_plan: {
        id: number;
        nom: string;
        revenue_total: number;
        revenue_formate: string;
        nombre_paiements: number;
    }[];
    prix_moyen: number;
    prix_moyen_formate: string;
    evolution_abonnes?: {
        mois: string;
        total_abonnes: number;
        nouveaux_abonnes: number;
    }[];
}
export interface ComparePricingPlansDto {
    plans: {
        id: number;
        nom: string;
        prix: number;
        prix_formate: string;
        duree_mois: number;
        prix_par_mois: number;
        prix_par_mois_formate: string;
        features?: string[];
        actif: boolean;
        nombre_abonnes: number;
        est_populaire?: boolean;
    }[];
    plan_recommande_id?: number;
    raison_recommandation?: string;
}
export interface TogglePricingPlanDto {
    id: number;
    actif: boolean;
    raison?: string;
}
//# sourceMappingURL=PricingPlanDto.d.ts.map