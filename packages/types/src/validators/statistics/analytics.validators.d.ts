import { z } from 'zod';
export declare const analyticsDateRangeSchema: z.ZodEffects<z.ZodObject<{
    date_debut: z.ZodDate;
    date_fin: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    date_debut: Date;
    date_fin: Date;
}, {
    date_debut: Date;
    date_fin: Date;
}>, {
    date_debut: Date;
    date_fin: Date;
}, {
    date_debut: Date;
    date_fin: Date;
}>;
export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>;
export declare const periodTypeSchema: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
export type PeriodType = z.infer<typeof periodTypeSchema>;
export declare const memberStatisticsSchema: z.ZodObject<{
    total_membres: z.ZodNumber;
    membres_actifs: z.ZodNumber;
    membres_inactifs: z.ZodNumber;
    nouveaux_membres_mois: z.ZodNumber;
    nouveaux_membres_semaine: z.ZodNumber;
    taux_croissance: z.ZodNumber;
    date_calcul: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    total_membres: number;
    membres_actifs: number;
    membres_inactifs: number;
    nouveaux_membres_mois: number;
    nouveaux_membres_semaine: number;
    taux_croissance: number;
    date_calcul: Date;
}, {
    total_membres: number;
    membres_actifs: number;
    membres_inactifs: number;
    nouveaux_membres_mois: number;
    nouveaux_membres_semaine: number;
    taux_croissance: number;
    date_calcul: Date;
}>;
export type MemberStatistics = z.infer<typeof memberStatisticsSchema>;
export declare const membersByGradeSchema: z.ZodObject<{
    grade_id: z.ZodNumber;
    grade_nom: z.ZodString;
    count: z.ZodNumber;
    pourcentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    grade_id: number;
    grade_nom: string;
    count: number;
    pourcentage: number;
}, {
    grade_id: number;
    grade_nom: string;
    count: number;
    pourcentage: number;
}>;
export type MembersByGrade = z.infer<typeof membersByGradeSchema>;
export declare const membersByGenderSchema: z.ZodObject<{
    genre_id: z.ZodNumber;
    genre_nom: z.ZodString;
    count: z.ZodNumber;
    pourcentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    genre_id: number;
    genre_nom: string;
    count: number;
    pourcentage: number;
}, {
    genre_id: number;
    genre_nom: string;
    count: number;
    pourcentage: number;
}>;
export type MembersByGender = z.infer<typeof membersByGenderSchema>;
export declare const membersByAgeGroupSchema: z.ZodObject<{
    groupe_age: z.ZodString;
    count: z.ZodNumber;
    pourcentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
    pourcentage: number;
    groupe_age: string;
}, {
    count: number;
    pourcentage: number;
    groupe_age: string;
}>;
export type MembersByAgeGroup = z.infer<typeof membersByAgeGroupSchema>;
export declare const memberAnalyticsResponseSchema: z.ZodObject<{
    overview: z.ZodObject<{
        total_membres: z.ZodNumber;
        membres_actifs: z.ZodNumber;
        membres_inactifs: z.ZodNumber;
        nouveaux_membres_mois: z.ZodNumber;
        nouveaux_membres_semaine: z.ZodNumber;
        taux_croissance: z.ZodNumber;
        date_calcul: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        total_membres: number;
        membres_actifs: number;
        membres_inactifs: number;
        nouveaux_membres_mois: number;
        nouveaux_membres_semaine: number;
        taux_croissance: number;
        date_calcul: Date;
    }, {
        total_membres: number;
        membres_actifs: number;
        membres_inactifs: number;
        nouveaux_membres_mois: number;
        nouveaux_membres_semaine: number;
        taux_croissance: number;
        date_calcul: Date;
    }>;
    by_grade: z.ZodArray<z.ZodObject<{
        grade_id: z.ZodNumber;
        grade_nom: z.ZodString;
        count: z.ZodNumber;
        pourcentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        grade_id: number;
        grade_nom: string;
        count: number;
        pourcentage: number;
    }, {
        grade_id: number;
        grade_nom: string;
        count: number;
        pourcentage: number;
    }>, "many">;
    by_gender: z.ZodArray<z.ZodObject<{
        genre_id: z.ZodNumber;
        genre_nom: z.ZodString;
        count: z.ZodNumber;
        pourcentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        genre_id: number;
        genre_nom: string;
        count: number;
        pourcentage: number;
    }, {
        genre_id: number;
        genre_nom: string;
        count: number;
        pourcentage: number;
    }>, "many">;
    by_age_group: z.ZodArray<z.ZodObject<{
        groupe_age: z.ZodString;
        count: z.ZodNumber;
        pourcentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        pourcentage: number;
        groupe_age: string;
    }, {
        count: number;
        pourcentage: number;
        groupe_age: string;
    }>, "many">;
    date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    overview: {
        total_membres: number;
        membres_actifs: number;
        membres_inactifs: number;
        nouveaux_membres_mois: number;
        nouveaux_membres_semaine: number;
        taux_croissance: number;
        date_calcul: Date;
    };
    by_grade: {
        grade_id: number;
        grade_nom: string;
        count: number;
        pourcentage: number;
    }[];
    by_gender: {
        genre_id: number;
        genre_nom: string;
        count: number;
        pourcentage: number;
    }[];
    by_age_group: {
        count: number;
        pourcentage: number;
        groupe_age: string;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}, {
    overview: {
        total_membres: number;
        membres_actifs: number;
        membres_inactifs: number;
        nouveaux_membres_mois: number;
        nouveaux_membres_semaine: number;
        taux_croissance: number;
        date_calcul: Date;
    };
    by_grade: {
        grade_id: number;
        grade_nom: string;
        count: number;
        pourcentage: number;
    }[];
    by_gender: {
        genre_id: number;
        genre_nom: string;
        count: number;
        pourcentage: number;
    }[];
    by_age_group: {
        count: number;
        pourcentage: number;
        groupe_age: string;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}>;
export type MemberAnalyticsResponse = z.infer<typeof memberAnalyticsResponseSchema>;
export declare const courseAttendanceStatisticsSchema: z.ZodObject<{
    total_cours: z.ZodNumber;
    total_inscriptions: z.ZodNumber;
    total_presences: z.ZodNumber;
    taux_presence: z.ZodNumber;
    moyenne_participants_par_cours: z.ZodNumber;
    date_calcul: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    date_calcul: Date;
    total_cours: number;
    total_inscriptions: number;
    total_presences: number;
    taux_presence: number;
    moyenne_participants_par_cours: number;
}, {
    date_calcul: Date;
    total_cours: number;
    total_inscriptions: number;
    total_presences: number;
    taux_presence: number;
    moyenne_participants_par_cours: number;
}>;
export type CourseAttendanceStatistics = z.infer<typeof courseAttendanceStatisticsSchema>;
export declare const coursesByTypeSchema: z.ZodObject<{
    type_cours: z.ZodString;
    total_cours: z.ZodNumber;
    total_inscriptions: z.ZodNumber;
    total_presences: z.ZodNumber;
    taux_presence: z.ZodNumber;
    moyenne_participants: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type_cours: string;
    total_cours: number;
    total_inscriptions: number;
    total_presences: number;
    taux_presence: number;
    moyenne_participants: number;
}, {
    type_cours: string;
    total_cours: number;
    total_inscriptions: number;
    total_presences: number;
    taux_presence: number;
    moyenne_participants: number;
}>;
export type CoursesByType = z.infer<typeof coursesByTypeSchema>;
export declare const popularCourseSchema: z.ZodObject<{
    cours_id: z.ZodNumber;
    type_cours: z.ZodString;
    date_cours: z.ZodDate;
    heure_debut: z.ZodString;
    heure_fin: z.ZodString;
    total_inscriptions: z.ZodNumber;
    total_presences: z.ZodNumber;
    taux_remplissage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    date_cours: Date;
    cours_id: number;
    total_inscriptions: number;
    total_presences: number;
    taux_remplissage: number;
}, {
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    date_cours: Date;
    cours_id: number;
    total_inscriptions: number;
    total_presences: number;
    taux_remplissage: number;
}>;
export type PopularCourse = z.infer<typeof popularCourseSchema>;
export declare const attendanceByDaySchema: z.ZodObject<{
    jour_semaine: z.ZodNumber;
    jour_nom: z.ZodString;
    total_cours: z.ZodNumber;
    total_presences: z.ZodNumber;
    moyenne_presences: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    jour_semaine: number;
    total_cours: number;
    total_presences: number;
    jour_nom: string;
    moyenne_presences: number;
}, {
    jour_semaine: number;
    total_cours: number;
    total_presences: number;
    jour_nom: string;
    moyenne_presences: number;
}>;
export type AttendanceByDay = z.infer<typeof attendanceByDaySchema>;
export declare const courseAnalyticsResponseSchema: z.ZodObject<{
    overview: z.ZodObject<{
        total_cours: z.ZodNumber;
        total_inscriptions: z.ZodNumber;
        total_presences: z.ZodNumber;
        taux_presence: z.ZodNumber;
        moyenne_participants_par_cours: z.ZodNumber;
        date_calcul: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_calcul: Date;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants_par_cours: number;
    }, {
        date_calcul: Date;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants_par_cours: number;
    }>;
    by_type: z.ZodArray<z.ZodObject<{
        type_cours: z.ZodString;
        total_cours: z.ZodNumber;
        total_inscriptions: z.ZodNumber;
        total_presences: z.ZodNumber;
        taux_presence: z.ZodNumber;
        moyenne_participants: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type_cours: string;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants: number;
    }, {
        type_cours: string;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants: number;
    }>, "many">;
    popular_courses: z.ZodArray<z.ZodObject<{
        cours_id: z.ZodNumber;
        type_cours: z.ZodString;
        date_cours: z.ZodDate;
        heure_debut: z.ZodString;
        heure_fin: z.ZodString;
        total_inscriptions: z.ZodNumber;
        total_presences: z.ZodNumber;
        taux_remplissage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        date_cours: Date;
        cours_id: number;
        total_inscriptions: number;
        total_presences: number;
        taux_remplissage: number;
    }, {
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        date_cours: Date;
        cours_id: number;
        total_inscriptions: number;
        total_presences: number;
        taux_remplissage: number;
    }>, "many">;
    by_day_of_week: z.ZodArray<z.ZodObject<{
        jour_semaine: z.ZodNumber;
        jour_nom: z.ZodString;
        total_cours: z.ZodNumber;
        total_presences: z.ZodNumber;
        moyenne_presences: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        jour_semaine: number;
        total_cours: number;
        total_presences: number;
        jour_nom: string;
        moyenne_presences: number;
    }, {
        jour_semaine: number;
        total_cours: number;
        total_presences: number;
        jour_nom: string;
        moyenne_presences: number;
    }>, "many">;
    date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    overview: {
        date_calcul: Date;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants_par_cours: number;
    };
    by_type: {
        type_cours: string;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants: number;
    }[];
    popular_courses: {
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        date_cours: Date;
        cours_id: number;
        total_inscriptions: number;
        total_presences: number;
        taux_remplissage: number;
    }[];
    by_day_of_week: {
        jour_semaine: number;
        total_cours: number;
        total_presences: number;
        jour_nom: string;
        moyenne_presences: number;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}, {
    overview: {
        date_calcul: Date;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants_par_cours: number;
    };
    by_type: {
        type_cours: string;
        total_cours: number;
        total_inscriptions: number;
        total_presences: number;
        taux_presence: number;
        moyenne_participants: number;
    }[];
    popular_courses: {
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        date_cours: Date;
        cours_id: number;
        total_inscriptions: number;
        total_presences: number;
        taux_remplissage: number;
    }[];
    by_day_of_week: {
        jour_semaine: number;
        total_cours: number;
        total_presences: number;
        jour_nom: string;
        moyenne_presences: number;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}>;
export type CourseAnalyticsResponse = z.infer<typeof courseAnalyticsResponseSchema>;
export declare const financialStatisticsSchema: z.ZodObject<{
    total_revenus: z.ZodNumber;
    total_paiements_valides: z.ZodNumber;
    total_paiements_en_attente: z.ZodNumber;
    total_paiements_echoues: z.ZodNumber;
    montant_en_attente: z.ZodNumber;
    montant_echeances_retard: z.ZodNumber;
    nombre_echeances_retard: z.ZodNumber;
    taux_paiement: z.ZodNumber;
    date_calcul: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    date_calcul: Date;
    total_revenus: number;
    total_paiements_valides: number;
    total_paiements_en_attente: number;
    total_paiements_echoues: number;
    montant_en_attente: number;
    montant_echeances_retard: number;
    nombre_echeances_retard: number;
    taux_paiement: number;
}, {
    date_calcul: Date;
    total_revenus: number;
    total_paiements_valides: number;
    total_paiements_en_attente: number;
    total_paiements_echoues: number;
    montant_en_attente: number;
    montant_echeances_retard: number;
    nombre_echeances_retard: number;
    taux_paiement: number;
}>;
export type FinancialStatistics = z.infer<typeof financialStatisticsSchema>;
export declare const revenueByPaymentMethodSchema: z.ZodObject<{
    methode_paiement: z.ZodString;
    total_paiements: z.ZodNumber;
    montant_total: z.ZodNumber;
    pourcentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    pourcentage: number;
    methode_paiement: string;
    total_paiements: number;
    montant_total: number;
}, {
    pourcentage: number;
    methode_paiement: string;
    total_paiements: number;
    montant_total: number;
}>;
export type RevenueByPaymentMethod = z.infer<typeof revenueByPaymentMethodSchema>;
export declare const revenueByPlanSchema: z.ZodObject<{
    plan_id: z.ZodNumber;
    plan_nom: z.ZodString;
    total_abonnes: z.ZodNumber;
    montant_total: z.ZodNumber;
    pourcentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    plan_nom: string;
    pourcentage: number;
    montant_total: number;
    plan_id: number;
    total_abonnes: number;
}, {
    plan_nom: string;
    pourcentage: number;
    montant_total: number;
    plan_id: number;
    total_abonnes: number;
}>;
export type RevenueByPlan = z.infer<typeof revenueByPlanSchema>;
export declare const latePaymentSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    utilisateur_nom: z.ZodString;
    utilisateur_prenom: z.ZodString;
    echeance_id: z.ZodNumber;
    montant: z.ZodNumber;
    date_echeance: z.ZodDate;
    jours_retard: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    montant: number;
    date_echeance: Date;
    jours_retard: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    echeance_id: number;
}, {
    utilisateur_id: number;
    montant: number;
    date_echeance: Date;
    jours_retard: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    echeance_id: number;
}>;
export type LatePayment = z.infer<typeof latePaymentSchema>;
export declare const financialAnalyticsResponseSchema: z.ZodObject<{
    overview: z.ZodObject<{
        total_revenus: z.ZodNumber;
        total_paiements_valides: z.ZodNumber;
        total_paiements_en_attente: z.ZodNumber;
        total_paiements_echoues: z.ZodNumber;
        montant_en_attente: z.ZodNumber;
        montant_echeances_retard: z.ZodNumber;
        nombre_echeances_retard: z.ZodNumber;
        taux_paiement: z.ZodNumber;
        date_calcul: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_calcul: Date;
        total_revenus: number;
        total_paiements_valides: number;
        total_paiements_en_attente: number;
        total_paiements_echoues: number;
        montant_en_attente: number;
        montant_echeances_retard: number;
        nombre_echeances_retard: number;
        taux_paiement: number;
    }, {
        date_calcul: Date;
        total_revenus: number;
        total_paiements_valides: number;
        total_paiements_en_attente: number;
        total_paiements_echoues: number;
        montant_en_attente: number;
        montant_echeances_retard: number;
        nombre_echeances_retard: number;
        taux_paiement: number;
    }>;
    by_payment_method: z.ZodArray<z.ZodObject<{
        methode_paiement: z.ZodString;
        total_paiements: z.ZodNumber;
        montant_total: z.ZodNumber;
        pourcentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        pourcentage: number;
        methode_paiement: string;
        total_paiements: number;
        montant_total: number;
    }, {
        pourcentage: number;
        methode_paiement: string;
        total_paiements: number;
        montant_total: number;
    }>, "many">;
    by_subscription_plan: z.ZodArray<z.ZodObject<{
        plan_id: z.ZodNumber;
        plan_nom: z.ZodString;
        total_abonnes: z.ZodNumber;
        montant_total: z.ZodNumber;
        pourcentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        plan_nom: string;
        pourcentage: number;
        montant_total: number;
        plan_id: number;
        total_abonnes: number;
    }, {
        plan_nom: string;
        pourcentage: number;
        montant_total: number;
        plan_id: number;
        total_abonnes: number;
    }>, "many">;
    late_payments: z.ZodArray<z.ZodObject<{
        utilisateur_id: z.ZodNumber;
        utilisateur_nom: z.ZodString;
        utilisateur_prenom: z.ZodString;
        echeance_id: z.ZodNumber;
        montant: z.ZodNumber;
        date_echeance: z.ZodDate;
        jours_retard: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        utilisateur_id: number;
        montant: number;
        date_echeance: Date;
        jours_retard: number;
        utilisateur_nom: string;
        utilisateur_prenom: string;
        echeance_id: number;
    }, {
        utilisateur_id: number;
        montant: number;
        date_echeance: Date;
        jours_retard: number;
        utilisateur_nom: string;
        utilisateur_prenom: string;
        echeance_id: number;
    }>, "many">;
    date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    overview: {
        date_calcul: Date;
        total_revenus: number;
        total_paiements_valides: number;
        total_paiements_en_attente: number;
        total_paiements_echoues: number;
        montant_en_attente: number;
        montant_echeances_retard: number;
        nombre_echeances_retard: number;
        taux_paiement: number;
    };
    by_payment_method: {
        pourcentage: number;
        methode_paiement: string;
        total_paiements: number;
        montant_total: number;
    }[];
    by_subscription_plan: {
        plan_nom: string;
        pourcentage: number;
        montant_total: number;
        plan_id: number;
        total_abonnes: number;
    }[];
    late_payments: {
        utilisateur_id: number;
        montant: number;
        date_echeance: Date;
        jours_retard: number;
        utilisateur_nom: string;
        utilisateur_prenom: string;
        echeance_id: number;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}, {
    overview: {
        date_calcul: Date;
        total_revenus: number;
        total_paiements_valides: number;
        total_paiements_en_attente: number;
        total_paiements_echoues: number;
        montant_en_attente: number;
        montant_echeances_retard: number;
        nombre_echeances_retard: number;
        taux_paiement: number;
    };
    by_payment_method: {
        pourcentage: number;
        methode_paiement: string;
        total_paiements: number;
        montant_total: number;
    }[];
    by_subscription_plan: {
        plan_nom: string;
        pourcentage: number;
        montant_total: number;
        plan_id: number;
        total_abonnes: number;
    }[];
    late_payments: {
        utilisateur_id: number;
        montant: number;
        date_echeance: Date;
        jours_retard: number;
        utilisateur_nom: string;
        utilisateur_prenom: string;
        echeance_id: number;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}>;
export type FinancialAnalyticsResponse = z.infer<typeof financialAnalyticsResponseSchema>;
export declare const storeStatisticsSchema: z.ZodObject<{
    total_commandes: z.ZodNumber;
    commandes_payees: z.ZodNumber;
    commandes_en_attente: z.ZodNumber;
    commandes_annulees: z.ZodNumber;
    total_revenus: z.ZodNumber;
    panier_moyen: z.ZodNumber;
    total_articles_vendus: z.ZodNumber;
    taux_conversion: z.ZodNumber;
    date_calcul: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    date_calcul: Date;
    total_revenus: number;
    total_commandes: number;
    commandes_payees: number;
    commandes_en_attente: number;
    commandes_annulees: number;
    panier_moyen: number;
    total_articles_vendus: number;
    taux_conversion: number;
}, {
    date_calcul: Date;
    total_revenus: number;
    total_commandes: number;
    commandes_payees: number;
    commandes_en_attente: number;
    commandes_annulees: number;
    panier_moyen: number;
    total_articles_vendus: number;
    taux_conversion: number;
}>;
export type StoreStatistics = z.infer<typeof storeStatisticsSchema>;
export declare const popularProductSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    article_nom: z.ZodString;
    categorie: z.ZodString;
    quantite_vendue: z.ZodNumber;
    revenus_total: z.ZodNumber;
    nombre_commandes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    article_nom: string;
    categorie: string;
    quantite_vendue: number;
    revenus_total: number;
    nombre_commandes: number;
}, {
    article_id: number;
    article_nom: string;
    categorie: string;
    quantite_vendue: number;
    revenus_total: number;
    nombre_commandes: number;
}>;
export type PopularProduct = z.infer<typeof popularProductSchema>;
export declare const salesByCategorySchema: z.ZodObject<{
    categorie_id: z.ZodNumber;
    categorie_nom: z.ZodString;
    total_articles_vendus: z.ZodNumber;
    revenus_total: z.ZodNumber;
    nombre_commandes: z.ZodNumber;
    pourcentage_revenus: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    categorie_id: number;
    total_articles_vendus: number;
    revenus_total: number;
    nombre_commandes: number;
    categorie_nom: string;
    pourcentage_revenus: number;
}, {
    categorie_id: number;
    total_articles_vendus: number;
    revenus_total: number;
    nombre_commandes: number;
    categorie_nom: string;
    pourcentage_revenus: number;
}>;
export type SalesByCategory = z.infer<typeof salesByCategorySchema>;
export declare const lowStockAlertSchema: z.ZodObject<{
    article_id: z.ZodNumber;
    article_nom: z.ZodString;
    taille: z.ZodString;
    quantite_disponible: z.ZodNumber;
    quantite_minimum: z.ZodNumber;
    statut: z.ZodEnum<["bas", "critique", "rupture"]>;
}, "strip", z.ZodTypeAny, {
    article_id: number;
    quantite_minimum: number;
    statut: "bas" | "rupture" | "critique";
    taille: string;
    article_nom: string;
    quantite_disponible: number;
}, {
    article_id: number;
    quantite_minimum: number;
    statut: "bas" | "rupture" | "critique";
    taille: string;
    article_nom: string;
    quantite_disponible: number;
}>;
export type LowStockAlert = z.infer<typeof lowStockAlertSchema>;
export declare const storeAnalyticsResponseSchema: z.ZodObject<{
    overview: z.ZodObject<{
        total_commandes: z.ZodNumber;
        commandes_payees: z.ZodNumber;
        commandes_en_attente: z.ZodNumber;
        commandes_annulees: z.ZodNumber;
        total_revenus: z.ZodNumber;
        panier_moyen: z.ZodNumber;
        total_articles_vendus: z.ZodNumber;
        taux_conversion: z.ZodNumber;
        date_calcul: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_calcul: Date;
        total_revenus: number;
        total_commandes: number;
        commandes_payees: number;
        commandes_en_attente: number;
        commandes_annulees: number;
        panier_moyen: number;
        total_articles_vendus: number;
        taux_conversion: number;
    }, {
        date_calcul: Date;
        total_revenus: number;
        total_commandes: number;
        commandes_payees: number;
        commandes_en_attente: number;
        commandes_annulees: number;
        panier_moyen: number;
        total_articles_vendus: number;
        taux_conversion: number;
    }>;
    popular_products: z.ZodArray<z.ZodObject<{
        article_id: z.ZodNumber;
        article_nom: z.ZodString;
        categorie: z.ZodString;
        quantite_vendue: z.ZodNumber;
        revenus_total: z.ZodNumber;
        nombre_commandes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        article_id: number;
        article_nom: string;
        categorie: string;
        quantite_vendue: number;
        revenus_total: number;
        nombre_commandes: number;
    }, {
        article_id: number;
        article_nom: string;
        categorie: string;
        quantite_vendue: number;
        revenus_total: number;
        nombre_commandes: number;
    }>, "many">;
    by_category: z.ZodArray<z.ZodObject<{
        categorie_id: z.ZodNumber;
        categorie_nom: z.ZodString;
        total_articles_vendus: z.ZodNumber;
        revenus_total: z.ZodNumber;
        nombre_commandes: z.ZodNumber;
        pourcentage_revenus: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        categorie_id: number;
        total_articles_vendus: number;
        revenus_total: number;
        nombre_commandes: number;
        categorie_nom: string;
        pourcentage_revenus: number;
    }, {
        categorie_id: number;
        total_articles_vendus: number;
        revenus_total: number;
        nombre_commandes: number;
        categorie_nom: string;
        pourcentage_revenus: number;
    }>, "many">;
    low_stock: z.ZodArray<z.ZodObject<{
        article_id: z.ZodNumber;
        article_nom: z.ZodString;
        taille: z.ZodString;
        quantite_disponible: z.ZodNumber;
        quantite_minimum: z.ZodNumber;
        statut: z.ZodEnum<["bas", "critique", "rupture"]>;
    }, "strip", z.ZodTypeAny, {
        article_id: number;
        quantite_minimum: number;
        statut: "bas" | "rupture" | "critique";
        taille: string;
        article_nom: string;
        quantite_disponible: number;
    }, {
        article_id: number;
        quantite_minimum: number;
        statut: "bas" | "rupture" | "critique";
        taille: string;
        article_nom: string;
        quantite_disponible: number;
    }>, "many">;
    date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    overview: {
        date_calcul: Date;
        total_revenus: number;
        total_commandes: number;
        commandes_payees: number;
        commandes_en_attente: number;
        commandes_annulees: number;
        panier_moyen: number;
        total_articles_vendus: number;
        taux_conversion: number;
    };
    popular_products: {
        article_id: number;
        article_nom: string;
        categorie: string;
        quantite_vendue: number;
        revenus_total: number;
        nombre_commandes: number;
    }[];
    by_category: {
        categorie_id: number;
        total_articles_vendus: number;
        revenus_total: number;
        nombre_commandes: number;
        categorie_nom: string;
        pourcentage_revenus: number;
    }[];
    low_stock: {
        article_id: number;
        quantite_minimum: number;
        statut: "bas" | "rupture" | "critique";
        taille: string;
        article_nom: string;
        quantite_disponible: number;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}, {
    overview: {
        date_calcul: Date;
        total_revenus: number;
        total_commandes: number;
        commandes_payees: number;
        commandes_en_attente: number;
        commandes_annulees: number;
        panier_moyen: number;
        total_articles_vendus: number;
        taux_conversion: number;
    };
    popular_products: {
        article_id: number;
        article_nom: string;
        categorie: string;
        quantite_vendue: number;
        revenus_total: number;
        nombre_commandes: number;
    }[];
    by_category: {
        categorie_id: number;
        total_articles_vendus: number;
        revenus_total: number;
        nombre_commandes: number;
        categorie_nom: string;
        pourcentage_revenus: number;
    }[];
    low_stock: {
        article_id: number;
        quantite_minimum: number;
        statut: "bas" | "rupture" | "critique";
        taille: string;
        article_nom: string;
        quantite_disponible: number;
    }[];
    date_range?: {
        date_debut: Date;
        date_fin: Date;
    } | undefined;
}>;
export type StoreAnalyticsResponse = z.infer<typeof storeAnalyticsResponseSchema>;
export declare const trendDataPointSchema: z.ZodObject<{
    periode: z.ZodString;
    date_debut: z.ZodDate;
    date_fin: z.ZodDate;
    valeur: z.ZodNumber;
    variation: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    valeur: number;
    date_debut: Date;
    date_fin: Date;
    periode: string;
    variation?: number | undefined;
}, {
    valeur: number;
    date_debut: Date;
    date_fin: Date;
    periode: string;
    variation?: number | undefined;
}>;
export type TrendDataPoint = z.infer<typeof trendDataPointSchema>;
export declare const memberGrowthTrendSchema: z.ZodObject<{
    type: z.ZodLiteral<"member_growth">;
    period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
    data: z.ZodArray<z.ZodObject<{
        periode: z.ZodString;
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
        valeur: z.ZodNumber;
        variation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }, {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }>, "many">;
    total_variation: z.ZodNumber;
    moyenne: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "member_growth";
    moyenne: number;
    data: {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }[];
    period_type: "day" | "month" | "year" | "week" | "quarter";
    total_variation: number;
}, {
    type: "member_growth";
    moyenne: number;
    data: {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }[];
    period_type: "day" | "month" | "year" | "week" | "quarter";
    total_variation: number;
}>;
export type MemberGrowthTrend = z.infer<typeof memberGrowthTrendSchema>;
export declare const attendanceTrendSchema: z.ZodObject<{
    type: z.ZodLiteral<"attendance">;
    period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
    data: z.ZodArray<z.ZodObject<{
        periode: z.ZodString;
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
        valeur: z.ZodNumber;
        variation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }, {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }>, "many">;
    total_variation: z.ZodNumber;
    moyenne: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "attendance";
    moyenne: number;
    data: {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }[];
    period_type: "day" | "month" | "year" | "week" | "quarter";
    total_variation: number;
}, {
    type: "attendance";
    moyenne: number;
    data: {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }[];
    period_type: "day" | "month" | "year" | "week" | "quarter";
    total_variation: number;
}>;
export type AttendanceTrend = z.infer<typeof attendanceTrendSchema>;
export declare const revenueTrendSchema: z.ZodObject<{
    type: z.ZodLiteral<"revenue">;
    period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
    data: z.ZodArray<z.ZodObject<{
        periode: z.ZodString;
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
        valeur: z.ZodNumber;
        variation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }, {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }>, "many">;
    total_variation: z.ZodNumber;
    moyenne: z.ZodNumber;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "revenue";
    moyenne: number;
    total: number;
    data: {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }[];
    period_type: "day" | "month" | "year" | "week" | "quarter";
    total_variation: number;
}, {
    type: "revenue";
    moyenne: number;
    total: number;
    data: {
        valeur: number;
        date_debut: Date;
        date_fin: Date;
        periode: string;
        variation?: number | undefined;
    }[];
    period_type: "day" | "month" | "year" | "week" | "quarter";
    total_variation: number;
}>;
export type RevenueTrend = z.infer<typeof revenueTrendSchema>;
export declare const trendAnalyticsResponseSchema: z.ZodObject<{
    member_growth: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"member_growth">;
        period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
        data: z.ZodArray<z.ZodObject<{
            periode: z.ZodString;
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
            valeur: z.ZodNumber;
            variation: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }, {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }>, "many">;
        total_variation: z.ZodNumber;
        moyenne: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "member_growth";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    }, {
        type: "member_growth";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    }>>;
    attendance: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"attendance">;
        period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
        data: z.ZodArray<z.ZodObject<{
            periode: z.ZodString;
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
            valeur: z.ZodNumber;
            variation: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }, {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }>, "many">;
        total_variation: z.ZodNumber;
        moyenne: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "attendance";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    }, {
        type: "attendance";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    }>>;
    revenue: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"revenue">;
        period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
        data: z.ZodArray<z.ZodObject<{
            periode: z.ZodString;
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
            valeur: z.ZodNumber;
            variation: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }, {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }>, "many">;
        total_variation: z.ZodNumber;
        moyenne: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "revenue";
        moyenne: number;
        total: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    }, {
        type: "revenue";
        moyenne: number;
        total: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    }>>;
    date_range: z.ZodEffects<z.ZodObject<{
        date_debut: z.ZodDate;
        date_fin: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>, {
        date_debut: Date;
        date_fin: Date;
    }, {
        date_debut: Date;
        date_fin: Date;
    }>;
}, "strip", z.ZodTypeAny, {
    date_range: {
        date_debut: Date;
        date_fin: Date;
    };
    revenue?: {
        type: "revenue";
        moyenne: number;
        total: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    } | undefined;
    member_growth?: {
        type: "member_growth";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    } | undefined;
    attendance?: {
        type: "attendance";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    } | undefined;
}, {
    date_range: {
        date_debut: Date;
        date_fin: Date;
    };
    revenue?: {
        type: "revenue";
        moyenne: number;
        total: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    } | undefined;
    member_growth?: {
        type: "member_growth";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    } | undefined;
    attendance?: {
        type: "attendance";
        moyenne: number;
        data: {
            valeur: number;
            date_debut: Date;
            date_fin: Date;
            periode: string;
            variation?: number | undefined;
        }[];
        period_type: "day" | "month" | "year" | "week" | "quarter";
        total_variation: number;
    } | undefined;
}>;
export type TrendAnalyticsResponse = z.infer<typeof trendAnalyticsResponseSchema>;
export declare const dashboardAnalyticsSchema: z.ZodObject<{
    members: z.ZodObject<{
        overview: z.ZodObject<{
            total_membres: z.ZodNumber;
            membres_actifs: z.ZodNumber;
            membres_inactifs: z.ZodNumber;
            nouveaux_membres_mois: z.ZodNumber;
            nouveaux_membres_semaine: z.ZodNumber;
            taux_croissance: z.ZodNumber;
            date_calcul: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            total_membres: number;
            membres_actifs: number;
            membres_inactifs: number;
            nouveaux_membres_mois: number;
            nouveaux_membres_semaine: number;
            taux_croissance: number;
            date_calcul: Date;
        }, {
            total_membres: number;
            membres_actifs: number;
            membres_inactifs: number;
            nouveaux_membres_mois: number;
            nouveaux_membres_semaine: number;
            taux_croissance: number;
            date_calcul: Date;
        }>;
        by_grade: z.ZodArray<z.ZodObject<{
            grade_id: z.ZodNumber;
            grade_nom: z.ZodString;
            count: z.ZodNumber;
            pourcentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            grade_id: number;
            grade_nom: string;
            count: number;
            pourcentage: number;
        }, {
            grade_id: number;
            grade_nom: string;
            count: number;
            pourcentage: number;
        }>, "many">;
        by_gender: z.ZodArray<z.ZodObject<{
            genre_id: z.ZodNumber;
            genre_nom: z.ZodString;
            count: z.ZodNumber;
            pourcentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            genre_id: number;
            genre_nom: string;
            count: number;
            pourcentage: number;
        }, {
            genre_id: number;
            genre_nom: string;
            count: number;
            pourcentage: number;
        }>, "many">;
        by_age_group: z.ZodArray<z.ZodObject<{
            groupe_age: z.ZodString;
            count: z.ZodNumber;
            pourcentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            count: number;
            pourcentage: number;
            groupe_age: string;
        }, {
            count: number;
            pourcentage: number;
            groupe_age: string;
        }>, "many">;
        date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        overview: {
            total_membres: number;
            membres_actifs: number;
            membres_inactifs: number;
            nouveaux_membres_mois: number;
            nouveaux_membres_semaine: number;
            taux_croissance: number;
            date_calcul: Date;
        };
        by_grade: {
            grade_id: number;
            grade_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_gender: {
            genre_id: number;
            genre_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_age_group: {
            count: number;
            pourcentage: number;
            groupe_age: string;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }, {
        overview: {
            total_membres: number;
            membres_actifs: number;
            membres_inactifs: number;
            nouveaux_membres_mois: number;
            nouveaux_membres_semaine: number;
            taux_croissance: number;
            date_calcul: Date;
        };
        by_grade: {
            grade_id: number;
            grade_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_gender: {
            genre_id: number;
            genre_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_age_group: {
            count: number;
            pourcentage: number;
            groupe_age: string;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }>;
    courses: z.ZodObject<{
        overview: z.ZodObject<{
            total_cours: z.ZodNumber;
            total_inscriptions: z.ZodNumber;
            total_presences: z.ZodNumber;
            taux_presence: z.ZodNumber;
            moyenne_participants_par_cours: z.ZodNumber;
            date_calcul: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_calcul: Date;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants_par_cours: number;
        }, {
            date_calcul: Date;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants_par_cours: number;
        }>;
        by_type: z.ZodArray<z.ZodObject<{
            type_cours: z.ZodString;
            total_cours: z.ZodNumber;
            total_inscriptions: z.ZodNumber;
            total_presences: z.ZodNumber;
            taux_presence: z.ZodNumber;
            moyenne_participants: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type_cours: string;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants: number;
        }, {
            type_cours: string;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants: number;
        }>, "many">;
        popular_courses: z.ZodArray<z.ZodObject<{
            cours_id: z.ZodNumber;
            type_cours: z.ZodString;
            date_cours: z.ZodDate;
            heure_debut: z.ZodString;
            heure_fin: z.ZodString;
            total_inscriptions: z.ZodNumber;
            total_presences: z.ZodNumber;
            taux_remplissage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type_cours: string;
            heure_debut: string;
            heure_fin: string;
            date_cours: Date;
            cours_id: number;
            total_inscriptions: number;
            total_presences: number;
            taux_remplissage: number;
        }, {
            type_cours: string;
            heure_debut: string;
            heure_fin: string;
            date_cours: Date;
            cours_id: number;
            total_inscriptions: number;
            total_presences: number;
            taux_remplissage: number;
        }>, "many">;
        by_day_of_week: z.ZodArray<z.ZodObject<{
            jour_semaine: z.ZodNumber;
            jour_nom: z.ZodString;
            total_cours: z.ZodNumber;
            total_presences: z.ZodNumber;
            moyenne_presences: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            jour_semaine: number;
            total_cours: number;
            total_presences: number;
            jour_nom: string;
            moyenne_presences: number;
        }, {
            jour_semaine: number;
            total_cours: number;
            total_presences: number;
            jour_nom: string;
            moyenne_presences: number;
        }>, "many">;
        date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        overview: {
            date_calcul: Date;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants_par_cours: number;
        };
        by_type: {
            type_cours: string;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants: number;
        }[];
        popular_courses: {
            type_cours: string;
            heure_debut: string;
            heure_fin: string;
            date_cours: Date;
            cours_id: number;
            total_inscriptions: number;
            total_presences: number;
            taux_remplissage: number;
        }[];
        by_day_of_week: {
            jour_semaine: number;
            total_cours: number;
            total_presences: number;
            jour_nom: string;
            moyenne_presences: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }, {
        overview: {
            date_calcul: Date;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants_par_cours: number;
        };
        by_type: {
            type_cours: string;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants: number;
        }[];
        popular_courses: {
            type_cours: string;
            heure_debut: string;
            heure_fin: string;
            date_cours: Date;
            cours_id: number;
            total_inscriptions: number;
            total_presences: number;
            taux_remplissage: number;
        }[];
        by_day_of_week: {
            jour_semaine: number;
            total_cours: number;
            total_presences: number;
            jour_nom: string;
            moyenne_presences: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }>;
    finance: z.ZodObject<{
        overview: z.ZodObject<{
            total_revenus: z.ZodNumber;
            total_paiements_valides: z.ZodNumber;
            total_paiements_en_attente: z.ZodNumber;
            total_paiements_echoues: z.ZodNumber;
            montant_en_attente: z.ZodNumber;
            montant_echeances_retard: z.ZodNumber;
            nombre_echeances_retard: z.ZodNumber;
            taux_paiement: z.ZodNumber;
            date_calcul: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_calcul: Date;
            total_revenus: number;
            total_paiements_valides: number;
            total_paiements_en_attente: number;
            total_paiements_echoues: number;
            montant_en_attente: number;
            montant_echeances_retard: number;
            nombre_echeances_retard: number;
            taux_paiement: number;
        }, {
            date_calcul: Date;
            total_revenus: number;
            total_paiements_valides: number;
            total_paiements_en_attente: number;
            total_paiements_echoues: number;
            montant_en_attente: number;
            montant_echeances_retard: number;
            nombre_echeances_retard: number;
            taux_paiement: number;
        }>;
        by_payment_method: z.ZodArray<z.ZodObject<{
            methode_paiement: z.ZodString;
            total_paiements: z.ZodNumber;
            montant_total: z.ZodNumber;
            pourcentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            pourcentage: number;
            methode_paiement: string;
            total_paiements: number;
            montant_total: number;
        }, {
            pourcentage: number;
            methode_paiement: string;
            total_paiements: number;
            montant_total: number;
        }>, "many">;
        by_subscription_plan: z.ZodArray<z.ZodObject<{
            plan_id: z.ZodNumber;
            plan_nom: z.ZodString;
            total_abonnes: z.ZodNumber;
            montant_total: z.ZodNumber;
            pourcentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            plan_nom: string;
            pourcentage: number;
            montant_total: number;
            plan_id: number;
            total_abonnes: number;
        }, {
            plan_nom: string;
            pourcentage: number;
            montant_total: number;
            plan_id: number;
            total_abonnes: number;
        }>, "many">;
        late_payments: z.ZodArray<z.ZodObject<{
            utilisateur_id: z.ZodNumber;
            utilisateur_nom: z.ZodString;
            utilisateur_prenom: z.ZodString;
            echeance_id: z.ZodNumber;
            montant: z.ZodNumber;
            date_echeance: z.ZodDate;
            jours_retard: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            utilisateur_id: number;
            montant: number;
            date_echeance: Date;
            jours_retard: number;
            utilisateur_nom: string;
            utilisateur_prenom: string;
            echeance_id: number;
        }, {
            utilisateur_id: number;
            montant: number;
            date_echeance: Date;
            jours_retard: number;
            utilisateur_nom: string;
            utilisateur_prenom: string;
            echeance_id: number;
        }>, "many">;
        date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_paiements_valides: number;
            total_paiements_en_attente: number;
            total_paiements_echoues: number;
            montant_en_attente: number;
            montant_echeances_retard: number;
            nombre_echeances_retard: number;
            taux_paiement: number;
        };
        by_payment_method: {
            pourcentage: number;
            methode_paiement: string;
            total_paiements: number;
            montant_total: number;
        }[];
        by_subscription_plan: {
            plan_nom: string;
            pourcentage: number;
            montant_total: number;
            plan_id: number;
            total_abonnes: number;
        }[];
        late_payments: {
            utilisateur_id: number;
            montant: number;
            date_echeance: Date;
            jours_retard: number;
            utilisateur_nom: string;
            utilisateur_prenom: string;
            echeance_id: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }, {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_paiements_valides: number;
            total_paiements_en_attente: number;
            total_paiements_echoues: number;
            montant_en_attente: number;
            montant_echeances_retard: number;
            nombre_echeances_retard: number;
            taux_paiement: number;
        };
        by_payment_method: {
            pourcentage: number;
            methode_paiement: string;
            total_paiements: number;
            montant_total: number;
        }[];
        by_subscription_plan: {
            plan_nom: string;
            pourcentage: number;
            montant_total: number;
            plan_id: number;
            total_abonnes: number;
        }[];
        late_payments: {
            utilisateur_id: number;
            montant: number;
            date_echeance: Date;
            jours_retard: number;
            utilisateur_nom: string;
            utilisateur_prenom: string;
            echeance_id: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }>;
    store: z.ZodObject<{
        overview: z.ZodObject<{
            total_commandes: z.ZodNumber;
            commandes_payees: z.ZodNumber;
            commandes_en_attente: z.ZodNumber;
            commandes_annulees: z.ZodNumber;
            total_revenus: z.ZodNumber;
            panier_moyen: z.ZodNumber;
            total_articles_vendus: z.ZodNumber;
            taux_conversion: z.ZodNumber;
            date_calcul: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_calcul: Date;
            total_revenus: number;
            total_commandes: number;
            commandes_payees: number;
            commandes_en_attente: number;
            commandes_annulees: number;
            panier_moyen: number;
            total_articles_vendus: number;
            taux_conversion: number;
        }, {
            date_calcul: Date;
            total_revenus: number;
            total_commandes: number;
            commandes_payees: number;
            commandes_en_attente: number;
            commandes_annulees: number;
            panier_moyen: number;
            total_articles_vendus: number;
            taux_conversion: number;
        }>;
        popular_products: z.ZodArray<z.ZodObject<{
            article_id: z.ZodNumber;
            article_nom: z.ZodString;
            categorie: z.ZodString;
            quantite_vendue: z.ZodNumber;
            revenus_total: z.ZodNumber;
            nombre_commandes: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            article_id: number;
            article_nom: string;
            categorie: string;
            quantite_vendue: number;
            revenus_total: number;
            nombre_commandes: number;
        }, {
            article_id: number;
            article_nom: string;
            categorie: string;
            quantite_vendue: number;
            revenus_total: number;
            nombre_commandes: number;
        }>, "many">;
        by_category: z.ZodArray<z.ZodObject<{
            categorie_id: z.ZodNumber;
            categorie_nom: z.ZodString;
            total_articles_vendus: z.ZodNumber;
            revenus_total: z.ZodNumber;
            nombre_commandes: z.ZodNumber;
            pourcentage_revenus: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            categorie_id: number;
            total_articles_vendus: number;
            revenus_total: number;
            nombre_commandes: number;
            categorie_nom: string;
            pourcentage_revenus: number;
        }, {
            categorie_id: number;
            total_articles_vendus: number;
            revenus_total: number;
            nombre_commandes: number;
            categorie_nom: string;
            pourcentage_revenus: number;
        }>, "many">;
        low_stock: z.ZodArray<z.ZodObject<{
            article_id: z.ZodNumber;
            article_nom: z.ZodString;
            taille: z.ZodString;
            quantite_disponible: z.ZodNumber;
            quantite_minimum: z.ZodNumber;
            statut: z.ZodEnum<["bas", "critique", "rupture"]>;
        }, "strip", z.ZodTypeAny, {
            article_id: number;
            quantite_minimum: number;
            statut: "bas" | "rupture" | "critique";
            taille: string;
            article_nom: string;
            quantite_disponible: number;
        }, {
            article_id: number;
            quantite_minimum: number;
            statut: "bas" | "rupture" | "critique";
            taille: string;
            article_nom: string;
            quantite_disponible: number;
        }>, "many">;
        date_range: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>>;
    }, "strip", z.ZodTypeAny, {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_commandes: number;
            commandes_payees: number;
            commandes_en_attente: number;
            commandes_annulees: number;
            panier_moyen: number;
            total_articles_vendus: number;
            taux_conversion: number;
        };
        popular_products: {
            article_id: number;
            article_nom: string;
            categorie: string;
            quantite_vendue: number;
            revenus_total: number;
            nombre_commandes: number;
        }[];
        by_category: {
            categorie_id: number;
            total_articles_vendus: number;
            revenus_total: number;
            nombre_commandes: number;
            categorie_nom: string;
            pourcentage_revenus: number;
        }[];
        low_stock: {
            article_id: number;
            quantite_minimum: number;
            statut: "bas" | "rupture" | "critique";
            taille: string;
            article_nom: string;
            quantite_disponible: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }, {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_commandes: number;
            commandes_payees: number;
            commandes_en_attente: number;
            commandes_annulees: number;
            panier_moyen: number;
            total_articles_vendus: number;
            taux_conversion: number;
        };
        popular_products: {
            article_id: number;
            article_nom: string;
            categorie: string;
            quantite_vendue: number;
            revenus_total: number;
            nombre_commandes: number;
        }[];
        by_category: {
            categorie_id: number;
            total_articles_vendus: number;
            revenus_total: number;
            nombre_commandes: number;
            categorie_nom: string;
            pourcentage_revenus: number;
        }[];
        low_stock: {
            article_id: number;
            quantite_minimum: number;
            statut: "bas" | "rupture" | "critique";
            taille: string;
            article_nom: string;
            quantite_disponible: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    }>;
    trends: z.ZodObject<{
        member_growth: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"member_growth">;
            period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
            data: z.ZodArray<z.ZodObject<{
                periode: z.ZodString;
                date_debut: z.ZodDate;
                date_fin: z.ZodDate;
                valeur: z.ZodNumber;
                variation: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }, {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }>, "many">;
            total_variation: z.ZodNumber;
            moyenne: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "member_growth";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        }, {
            type: "member_growth";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        }>>;
        attendance: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"attendance">;
            period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
            data: z.ZodArray<z.ZodObject<{
                periode: z.ZodString;
                date_debut: z.ZodDate;
                date_fin: z.ZodDate;
                valeur: z.ZodNumber;
                variation: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }, {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }>, "many">;
            total_variation: z.ZodNumber;
            moyenne: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "attendance";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        }, {
            type: "attendance";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        }>>;
        revenue: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"revenue">;
            period_type: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
            data: z.ZodArray<z.ZodObject<{
                periode: z.ZodString;
                date_debut: z.ZodDate;
                date_fin: z.ZodDate;
                valeur: z.ZodNumber;
                variation: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }, {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }>, "many">;
            total_variation: z.ZodNumber;
            moyenne: z.ZodNumber;
            total: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "revenue";
            moyenne: number;
            total: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        }, {
            type: "revenue";
            moyenne: number;
            total: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        }>>;
        date_range: z.ZodEffects<z.ZodObject<{
            date_debut: z.ZodDate;
            date_fin: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>, {
            date_debut: Date;
            date_fin: Date;
        }, {
            date_debut: Date;
            date_fin: Date;
        }>;
    }, "strip", z.ZodTypeAny, {
        date_range: {
            date_debut: Date;
            date_fin: Date;
        };
        revenue?: {
            type: "revenue";
            moyenne: number;
            total: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        member_growth?: {
            type: "member_growth";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        attendance?: {
            type: "attendance";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
    }, {
        date_range: {
            date_debut: Date;
            date_fin: Date;
        };
        revenue?: {
            type: "revenue";
            moyenne: number;
            total: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        member_growth?: {
            type: "member_growth";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        attendance?: {
            type: "attendance";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
    }>;
    generated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    generated_at: Date;
    members: {
        overview: {
            total_membres: number;
            membres_actifs: number;
            membres_inactifs: number;
            nouveaux_membres_mois: number;
            nouveaux_membres_semaine: number;
            taux_croissance: number;
            date_calcul: Date;
        };
        by_grade: {
            grade_id: number;
            grade_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_gender: {
            genre_id: number;
            genre_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_age_group: {
            count: number;
            pourcentage: number;
            groupe_age: string;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    courses: {
        overview: {
            date_calcul: Date;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants_par_cours: number;
        };
        by_type: {
            type_cours: string;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants: number;
        }[];
        popular_courses: {
            type_cours: string;
            heure_debut: string;
            heure_fin: string;
            date_cours: Date;
            cours_id: number;
            total_inscriptions: number;
            total_presences: number;
            taux_remplissage: number;
        }[];
        by_day_of_week: {
            jour_semaine: number;
            total_cours: number;
            total_presences: number;
            jour_nom: string;
            moyenne_presences: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    finance: {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_paiements_valides: number;
            total_paiements_en_attente: number;
            total_paiements_echoues: number;
            montant_en_attente: number;
            montant_echeances_retard: number;
            nombre_echeances_retard: number;
            taux_paiement: number;
        };
        by_payment_method: {
            pourcentage: number;
            methode_paiement: string;
            total_paiements: number;
            montant_total: number;
        }[];
        by_subscription_plan: {
            plan_nom: string;
            pourcentage: number;
            montant_total: number;
            plan_id: number;
            total_abonnes: number;
        }[];
        late_payments: {
            utilisateur_id: number;
            montant: number;
            date_echeance: Date;
            jours_retard: number;
            utilisateur_nom: string;
            utilisateur_prenom: string;
            echeance_id: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    store: {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_commandes: number;
            commandes_payees: number;
            commandes_en_attente: number;
            commandes_annulees: number;
            panier_moyen: number;
            total_articles_vendus: number;
            taux_conversion: number;
        };
        popular_products: {
            article_id: number;
            article_nom: string;
            categorie: string;
            quantite_vendue: number;
            revenus_total: number;
            nombre_commandes: number;
        }[];
        by_category: {
            categorie_id: number;
            total_articles_vendus: number;
            revenus_total: number;
            nombre_commandes: number;
            categorie_nom: string;
            pourcentage_revenus: number;
        }[];
        low_stock: {
            article_id: number;
            quantite_minimum: number;
            statut: "bas" | "rupture" | "critique";
            taille: string;
            article_nom: string;
            quantite_disponible: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    trends: {
        date_range: {
            date_debut: Date;
            date_fin: Date;
        };
        revenue?: {
            type: "revenue";
            moyenne: number;
            total: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        member_growth?: {
            type: "member_growth";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        attendance?: {
            type: "attendance";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
    };
}, {
    generated_at: Date;
    members: {
        overview: {
            total_membres: number;
            membres_actifs: number;
            membres_inactifs: number;
            nouveaux_membres_mois: number;
            nouveaux_membres_semaine: number;
            taux_croissance: number;
            date_calcul: Date;
        };
        by_grade: {
            grade_id: number;
            grade_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_gender: {
            genre_id: number;
            genre_nom: string;
            count: number;
            pourcentage: number;
        }[];
        by_age_group: {
            count: number;
            pourcentage: number;
            groupe_age: string;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    courses: {
        overview: {
            date_calcul: Date;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants_par_cours: number;
        };
        by_type: {
            type_cours: string;
            total_cours: number;
            total_inscriptions: number;
            total_presences: number;
            taux_presence: number;
            moyenne_participants: number;
        }[];
        popular_courses: {
            type_cours: string;
            heure_debut: string;
            heure_fin: string;
            date_cours: Date;
            cours_id: number;
            total_inscriptions: number;
            total_presences: number;
            taux_remplissage: number;
        }[];
        by_day_of_week: {
            jour_semaine: number;
            total_cours: number;
            total_presences: number;
            jour_nom: string;
            moyenne_presences: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    finance: {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_paiements_valides: number;
            total_paiements_en_attente: number;
            total_paiements_echoues: number;
            montant_en_attente: number;
            montant_echeances_retard: number;
            nombre_echeances_retard: number;
            taux_paiement: number;
        };
        by_payment_method: {
            pourcentage: number;
            methode_paiement: string;
            total_paiements: number;
            montant_total: number;
        }[];
        by_subscription_plan: {
            plan_nom: string;
            pourcentage: number;
            montant_total: number;
            plan_id: number;
            total_abonnes: number;
        }[];
        late_payments: {
            utilisateur_id: number;
            montant: number;
            date_echeance: Date;
            jours_retard: number;
            utilisateur_nom: string;
            utilisateur_prenom: string;
            echeance_id: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    store: {
        overview: {
            date_calcul: Date;
            total_revenus: number;
            total_commandes: number;
            commandes_payees: number;
            commandes_en_attente: number;
            commandes_annulees: number;
            panier_moyen: number;
            total_articles_vendus: number;
            taux_conversion: number;
        };
        popular_products: {
            article_id: number;
            article_nom: string;
            categorie: string;
            quantite_vendue: number;
            revenus_total: number;
            nombre_commandes: number;
        }[];
        by_category: {
            categorie_id: number;
            total_articles_vendus: number;
            revenus_total: number;
            nombre_commandes: number;
            categorie_nom: string;
            pourcentage_revenus: number;
        }[];
        low_stock: {
            article_id: number;
            quantite_minimum: number;
            statut: "bas" | "rupture" | "critique";
            taille: string;
            article_nom: string;
            quantite_disponible: number;
        }[];
        date_range?: {
            date_debut: Date;
            date_fin: Date;
        } | undefined;
    };
    trends: {
        date_range: {
            date_debut: Date;
            date_fin: Date;
        };
        revenue?: {
            type: "revenue";
            moyenne: number;
            total: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        member_growth?: {
            type: "member_growth";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
        attendance?: {
            type: "attendance";
            moyenne: number;
            data: {
                valeur: number;
                date_debut: Date;
                date_fin: Date;
                periode: string;
                variation?: number | undefined;
            }[];
            period_type: "day" | "month" | "year" | "week" | "quarter";
            total_variation: number;
        } | undefined;
    };
}>;
export type DashboardAnalytics = z.infer<typeof dashboardAnalyticsSchema>;
export declare const analyticsQuerySchema: z.ZodEffects<z.ZodObject<{
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    period_type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["day", "week", "month", "quarter", "year"]>>>;
    include_trends: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    period_type: "day" | "month" | "year" | "week" | "quarter";
    include_trends: boolean;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    period_type?: "day" | "month" | "year" | "week" | "quarter" | undefined;
    include_trends?: boolean | undefined;
}>, {
    period_type: "day" | "month" | "year" | "week" | "quarter";
    include_trends: boolean;
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
}, {
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    period_type?: "day" | "month" | "year" | "week" | "quarter" | undefined;
    include_trends?: boolean | undefined;
}>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export declare const analyticsModuleQuerySchema: z.ZodObject<{
    module: z.ZodEnum<["members", "courses", "finance", "store", "trends", "dashboard"]>;
    date_debut: z.ZodOptional<z.ZodDate>;
    date_fin: z.ZodOptional<z.ZodDate>;
    period_type: z.ZodOptional<z.ZodEnum<["day", "week", "month", "quarter", "year"]>>;
}, "strip", z.ZodTypeAny, {
    module: "members" | "courses" | "finance" | "store" | "trends" | "dashboard";
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    period_type?: "day" | "month" | "year" | "week" | "quarter" | undefined;
}, {
    module: "members" | "courses" | "finance" | "store" | "trends" | "dashboard";
    date_debut?: Date | undefined;
    date_fin?: Date | undefined;
    period_type?: "day" | "month" | "year" | "week" | "quarter" | undefined;
}>;
export type AnalyticsModuleQuery = z.infer<typeof analyticsModuleQuerySchema>;
//# sourceMappingURL=analytics.validators.d.ts.map