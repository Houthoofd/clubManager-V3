export declare enum PaymentMethod {
    STRIPE = "stripe",
    ESPECES = "especes",
    VIREMENT = "virement",
    AUTRE = "autre"
}
export declare enum PaymentStatus {
    EN_ATTENTE = "en_attente",
    VALIDE = "valide",
    ECHOUE = "echoue",
    REMBOURSE = "rembourse"
}
export interface Payment {
    id: number;
    utilisateur_id: number;
    plan_tarifaire_id?: number | null;
    montant: number;
    methode_paiement: PaymentMethod;
    statut: PaymentStatus;
    description?: string | null;
    stripe_payment_intent_id?: string | null;
    stripe_charge_id?: string | null;
    date_paiement: Date;
    created_at: Date;
    updated_at: Date;
}
export interface PaymentWithRelations extends Payment {
    utilisateur: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        email: string;
        photo_url?: string;
    };
    plan_tarifaire?: {
        id: number;
        nom: string;
        description?: string;
        prix: number;
        duree_mois: number;
        actif: boolean;
    } | null;
}
export interface PaymentPublic {
    id: number;
    utilisateur_id: number;
    montant: number;
    methode_paiement: PaymentMethod;
    statut: PaymentStatus;
    description?: string | null;
    plan_tarifaire_id?: number | null;
    date_paiement: Date;
}
export interface PaymentBasic {
    id: number;
    utilisateur_id: number;
    montant: number;
    statut: PaymentStatus;
    date_paiement: Date;
}
export interface PaymentListItem {
    id: number;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_email: string;
    montant: number;
    methode_paiement: PaymentMethod;
    statut: PaymentStatus;
    plan_tarifaire_nom?: string;
    description?: string;
    date_paiement: Date;
    created_at: Date;
}
export interface PaymentDetail extends PaymentWithRelations {
    utilisateur_nom_complet: string;
    methode_paiement_label: string;
    statut_label: string;
    montant_formatted: string;
}
export interface PaymentHistoryItem {
    id: number;
    montant: number;
    methode_paiement: PaymentMethod;
    statut: PaymentStatus;
    description?: string;
    plan_tarifaire_nom?: string;
    date_paiement: Date;
}
export interface PaymentStats {
    total_paiements: number;
    montant_total: number;
    montant_valide: number;
    montant_en_attente: number;
    montant_echoue: number;
    montant_rembourse: number;
    par_methode: {
        [key in PaymentMethod]: {
            nombre: number;
            montant: number;
        };
    };
}
export interface PaymentMonthlySummary {
    annee: number;
    mois: number;
    nombre_paiements: number;
    montant_total: number;
    montant_valide: number;
}
export interface CreatePaymentData {
    utilisateur_id: number;
    montant: number;
    methode_paiement: PaymentMethod;
    statut?: PaymentStatus;
    description?: string;
    plan_tarifaire_id?: number;
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
    date_paiement?: Date;
}
export interface UpdatePaymentData {
    montant?: number;
    methode_paiement?: PaymentMethod;
    statut?: PaymentStatus;
    description?: string;
    plan_tarifaire_id?: number;
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
    date_paiement?: Date;
}
export declare const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string>;
export declare const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string>;
//# sourceMappingURL=Payment.types.d.ts.map