export interface PricingPlan {
    id: number;
    nom: string;
    description?: string | null;
    prix: number;
    duree_mois: number;
    actif: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface PricingPlanWithRelations extends PricingPlan {
    nombre_abonnes?: number;
    revenue_total?: number;
    nombre_echeances_actives?: number;
    nombre_paiements?: number;
}
export interface PricingPlanPublic {
    id: number;
    nom: string;
    description?: string | null;
    prix: number;
    duree_mois: number;
    actif: boolean;
}
export interface PricingPlanBasic {
    id: number;
    nom: string;
    prix: number;
    duree_mois: number;
    actif: boolean;
}
export interface PricingPlanListItem {
    id: number;
    nom: string;
    description?: string;
    prix: number;
    duree_mois: number;
    actif: boolean;
    nombre_abonnes?: number;
    revenue_total?: number;
    created_at: Date;
    updated_at: Date;
}
export interface PricingPlanDetail extends PricingPlanWithRelations {
    prix_formatted: string;
    prix_mensuel: number;
    prix_mensuel_formatted: string;
    duree_label: string;
}
export interface PricingPlanOption {
    id: number;
    nom: string;
    prix: number;
    duree_mois: number;
    description?: string;
    prix_formatted: string;
    est_populaire?: boolean;
}
export interface PricingPlanCard {
    id: number;
    nom: string;
    description?: string;
    prix: number;
    duree_mois: number;
    prix_mensuel: number;
    actif: boolean;
    caracteristiques?: string[];
    est_populaire?: boolean;
    est_recommande?: boolean;
}
export interface PricingPlanStats {
    plan_id: number;
    plan_nom: string;
    nombre_abonnes_actifs: number;
    nombre_total_abonnes: number;
    revenue_total: number;
    revenue_mois_en_cours: number;
    nombre_paiements_total: number;
    nombre_echeances_en_attente: number;
    montant_echeances_en_attente: number;
    taux_conversion?: number;
}
export interface PricingPlanComparison {
    plans: PricingPlanCard[];
    caracteristiques_communes: string[];
    meilleur_rapport_qualite_prix?: number;
}
export interface PricingPlanHistory {
    plan_id: number;
    plan_nom: string;
    changements: {
        date: Date;
        champ_modifie: string;
        ancienne_valeur: string | number | boolean;
        nouvelle_valeur: string | number | boolean;
    }[];
}
export interface CreatePricingPlanData {
    nom: string;
    description?: string;
    prix: number;
    duree_mois?: number;
    actif?: boolean;
}
export interface UpdatePricingPlanData {
    nom?: string;
    description?: string;
    prix?: number;
    duree_mois?: number;
    actif?: boolean;
}
export interface PricingPlanFilterOptions {
    actif?: boolean;
    prix_min?: number;
    prix_max?: number;
    duree_mois?: number;
    recherche?: string;
}
export declare const DUREE_LABELS: Record<number, string>;
export declare function getDureeLabel(duree_mois: number): string;
//# sourceMappingURL=PricingPlan.types.d.ts.map