export declare enum ScheduleStatus {
    EN_ATTENTE = "en_attente",
    PAYE = "paye",
    EN_RETARD = "en_retard",
    ANNULE = "annule"
}
export interface PaymentSchedule {
    id: number;
    utilisateur_id: number;
    plan_tarifaire_id: number;
    paiement_id?: number | null;
    montant: number;
    date_echeance: Date;
    statut: ScheduleStatus;
    created_at: Date;
    updated_at: Date;
}
export interface PaymentScheduleWithRelations extends PaymentSchedule {
    utilisateur: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        email: string;
        photo_url?: string;
    };
    plan_tarifaire: {
        id: number;
        nom: string;
        description?: string;
        prix: number;
        duree_mois: number;
        actif: boolean;
    };
    paiement?: {
        id: number;
        montant: number;
        methode_paiement: string;
        statut: string;
        date_paiement: Date;
        stripe_payment_intent_id?: string;
        stripe_charge_id?: string;
    } | null;
}
export interface PaymentSchedulePublic {
    id: number;
    utilisateur_id: number;
    plan_tarifaire_id: number;
    montant: number;
    date_echeance: Date;
    statut: ScheduleStatus;
    paiement_id?: number | null;
}
export interface PaymentScheduleBasic {
    id: number;
    utilisateur_id: number;
    montant: number;
    date_echeance: Date;
    statut: ScheduleStatus;
}
export interface PaymentScheduleListItem {
    id: number;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_email: string;
    plan_tarifaire_id: number;
    plan_tarifaire_nom: string;
    montant: number;
    date_echeance: Date;
    statut: ScheduleStatus;
    paiement_id?: number | null;
    jours_retard?: number;
    created_at: Date;
}
export interface PaymentScheduleDetail extends PaymentScheduleWithRelations {
    utilisateur_nom_complet: string;
    statut_label: string;
    montant_formatted: string;
    jours_retard?: number;
    est_en_retard: boolean;
}
export interface PaymentScheduleCalendarItem {
    id: number;
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    montant: number;
    date_echeance: Date;
    statut: ScheduleStatus;
    plan_tarifaire_nom: string;
}
export interface PaymentScheduleUserDashboard {
    id: number;
    montant: number;
    date_echeance: Date;
    statut: ScheduleStatus;
    plan_tarifaire_nom: string;
    est_en_retard: boolean;
    jours_retard?: number;
    paiement_effectue?: {
        id: number;
        date_paiement: Date;
        methode_paiement: string;
    };
}
export interface PaymentScheduleStats {
    total_echeances: number;
    total_montant: number;
    en_attente: {
        nombre: number;
        montant: number;
    };
    paye: {
        nombre: number;
        montant: number;
    };
    en_retard: {
        nombre: number;
        montant: number;
    };
    annule: {
        nombre: number;
        montant: number;
    };
}
export interface PaymentScheduleUserSummary {
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    utilisateur_email: string;
    total_echeances: number;
    montant_total: number;
    montant_paye: number;
    montant_en_attente: number;
    montant_en_retard: number;
    prochaine_echeance?: Date;
}
export interface CreatePaymentScheduleData {
    utilisateur_id: number;
    plan_tarifaire_id: number;
    montant: number;
    date_echeance: Date;
    statut?: ScheduleStatus;
}
export interface UpdatePaymentScheduleData {
    montant?: number;
    date_echeance?: Date;
    statut?: ScheduleStatus;
    paiement_id?: number | null;
}
export declare const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string>;
export declare const SCHEDULE_STATUS_COLORS: Record<ScheduleStatus, string>;
//# sourceMappingURL=PaymentSchedule.types.d.ts.map