import { z } from 'zod';
export const analyticsDateRangeSchema = z.object({
    date_debut: z.coerce.date(),
    date_fin: z.coerce.date(),
}).refine((data) => data.date_fin >= data.date_debut, {
    message: 'La date de fin doit être supérieure ou égale à la date de début',
    path: ['date_fin'],
});
export const periodTypeSchema = z.enum(['day', 'week', 'month', 'quarter', 'year']);
export const memberStatisticsSchema = z.object({
    total_membres: z.number().int().nonnegative(),
    membres_actifs: z.number().int().nonnegative(),
    membres_inactifs: z.number().int().nonnegative(),
    nouveaux_membres_mois: z.number().int().nonnegative(),
    nouveaux_membres_semaine: z.number().int().nonnegative(),
    taux_croissance: z.number(),
    date_calcul: z.coerce.date(),
});
export const membersByGradeSchema = z.object({
    grade_id: z.number().int().positive(),
    grade_nom: z.string(),
    count: z.number().int().nonnegative(),
    pourcentage: z.number().min(0).max(100),
});
export const membersByGenderSchema = z.object({
    genre_id: z.number().int().positive(),
    genre_nom: z.string(),
    count: z.number().int().nonnegative(),
    pourcentage: z.number().min(0).max(100),
});
export const membersByAgeGroupSchema = z.object({
    groupe_age: z.string(),
    count: z.number().int().nonnegative(),
    pourcentage: z.number().min(0).max(100),
});
export const memberAnalyticsResponseSchema = z.object({
    overview: memberStatisticsSchema,
    by_grade: z.array(membersByGradeSchema),
    by_gender: z.array(membersByGenderSchema),
    by_age_group: z.array(membersByAgeGroupSchema),
    date_range: analyticsDateRangeSchema.optional(),
});
export const courseAttendanceStatisticsSchema = z.object({
    total_cours: z.number().int().nonnegative(),
    total_inscriptions: z.number().int().nonnegative(),
    total_presences: z.number().int().nonnegative(),
    taux_presence: z.number().min(0).max(100),
    moyenne_participants_par_cours: z.number().nonnegative(),
    date_calcul: z.coerce.date(),
});
export const coursesByTypeSchema = z.object({
    type_cours: z.string(),
    total_cours: z.number().int().nonnegative(),
    total_inscriptions: z.number().int().nonnegative(),
    total_presences: z.number().int().nonnegative(),
    taux_presence: z.number().min(0).max(100),
    moyenne_participants: z.number().nonnegative(),
});
export const popularCourseSchema = z.object({
    cours_id: z.number().int().positive(),
    type_cours: z.string(),
    date_cours: z.coerce.date(),
    heure_debut: z.string(),
    heure_fin: z.string(),
    total_inscriptions: z.number().int().nonnegative(),
    total_presences: z.number().int().nonnegative(),
    taux_remplissage: z.number().min(0).max(100),
});
export const attendanceByDaySchema = z.object({
    jour_semaine: z.number().int().min(1).max(7),
    jour_nom: z.string(),
    total_cours: z.number().int().nonnegative(),
    total_presences: z.number().int().nonnegative(),
    moyenne_presences: z.number().nonnegative(),
});
export const courseAnalyticsResponseSchema = z.object({
    overview: courseAttendanceStatisticsSchema,
    by_type: z.array(coursesByTypeSchema),
    popular_courses: z.array(popularCourseSchema),
    by_day_of_week: z.array(attendanceByDaySchema),
    date_range: analyticsDateRangeSchema.optional(),
});
export const financialStatisticsSchema = z.object({
    total_revenus: z.number().nonnegative(),
    total_paiements_valides: z.number().int().nonnegative(),
    total_paiements_en_attente: z.number().int().nonnegative(),
    total_paiements_echoues: z.number().int().nonnegative(),
    montant_en_attente: z.number().nonnegative(),
    montant_echeances_retard: z.number().nonnegative(),
    nombre_echeances_retard: z.number().int().nonnegative(),
    taux_paiement: z.number().min(0).max(100),
    date_calcul: z.coerce.date(),
});
export const revenueByPaymentMethodSchema = z.object({
    methode_paiement: z.string(),
    total_paiements: z.number().int().nonnegative(),
    montant_total: z.number().nonnegative(),
    pourcentage: z.number().min(0).max(100),
});
export const revenueByPlanSchema = z.object({
    plan_id: z.number().int().positive(),
    plan_nom: z.string(),
    total_abonnes: z.number().int().nonnegative(),
    montant_total: z.number().nonnegative(),
    pourcentage: z.number().min(0).max(100),
});
export const latePaymentSchema = z.object({
    utilisateur_id: z.number().int().positive(),
    utilisateur_nom: z.string(),
    utilisateur_prenom: z.string(),
    echeance_id: z.number().int().positive(),
    montant: z.number().positive(),
    date_echeance: z.coerce.date(),
    jours_retard: z.number().int().positive(),
});
export const financialAnalyticsResponseSchema = z.object({
    overview: financialStatisticsSchema,
    by_payment_method: z.array(revenueByPaymentMethodSchema),
    by_subscription_plan: z.array(revenueByPlanSchema),
    late_payments: z.array(latePaymentSchema),
    date_range: analyticsDateRangeSchema.optional(),
});
export const storeStatisticsSchema = z.object({
    total_commandes: z.number().int().nonnegative(),
    commandes_payees: z.number().int().nonnegative(),
    commandes_en_attente: z.number().int().nonnegative(),
    commandes_annulees: z.number().int().nonnegative(),
    total_revenus: z.number().nonnegative(),
    panier_moyen: z.number().nonnegative(),
    total_articles_vendus: z.number().int().nonnegative(),
    taux_conversion: z.number().min(0).max(100),
    date_calcul: z.coerce.date(),
});
export const popularProductSchema = z.object({
    article_id: z.number().int().positive(),
    article_nom: z.string(),
    categorie: z.string(),
    quantite_vendue: z.number().int().nonnegative(),
    revenus_total: z.number().nonnegative(),
    nombre_commandes: z.number().int().nonnegative(),
});
export const salesByCategorySchema = z.object({
    categorie_id: z.number().int().positive(),
    categorie_nom: z.string(),
    total_articles_vendus: z.number().int().nonnegative(),
    revenus_total: z.number().nonnegative(),
    nombre_commandes: z.number().int().nonnegative(),
    pourcentage_revenus: z.number().min(0).max(100),
});
export const lowStockAlertSchema = z.object({
    article_id: z.number().int().positive(),
    article_nom: z.string(),
    taille: z.string(),
    quantite_disponible: z.number().int().nonnegative(),
    quantite_minimum: z.number().int().nonnegative(),
    statut: z.enum(['bas', 'critique', 'rupture']),
});
export const storeAnalyticsResponseSchema = z.object({
    overview: storeStatisticsSchema,
    popular_products: z.array(popularProductSchema),
    by_category: z.array(salesByCategorySchema),
    low_stock: z.array(lowStockAlertSchema),
    date_range: analyticsDateRangeSchema.optional(),
});
export const trendDataPointSchema = z.object({
    periode: z.string(),
    date_debut: z.coerce.date(),
    date_fin: z.coerce.date(),
    valeur: z.number(),
    variation: z.number().optional(),
});
export const memberGrowthTrendSchema = z.object({
    type: z.literal('member_growth'),
    period_type: periodTypeSchema,
    data: z.array(trendDataPointSchema),
    total_variation: z.number(),
    moyenne: z.number(),
});
export const attendanceTrendSchema = z.object({
    type: z.literal('attendance'),
    period_type: periodTypeSchema,
    data: z.array(trendDataPointSchema),
    total_variation: z.number(),
    moyenne: z.number(),
});
export const revenueTrendSchema = z.object({
    type: z.literal('revenue'),
    period_type: periodTypeSchema,
    data: z.array(trendDataPointSchema),
    total_variation: z.number(),
    moyenne: z.number(),
    total: z.number(),
});
export const trendAnalyticsResponseSchema = z.object({
    member_growth: memberGrowthTrendSchema.optional(),
    attendance: attendanceTrendSchema.optional(),
    revenue: revenueTrendSchema.optional(),
    date_range: analyticsDateRangeSchema,
});
export const dashboardAnalyticsSchema = z.object({
    members: memberAnalyticsResponseSchema,
    courses: courseAnalyticsResponseSchema,
    finance: financialAnalyticsResponseSchema,
    store: storeAnalyticsResponseSchema,
    trends: trendAnalyticsResponseSchema,
    generated_at: z.coerce.date(),
});
export const analyticsQuerySchema = z.object({
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    period_type: periodTypeSchema.optional().default('month'),
    include_trends: z.coerce.boolean().optional().default(true),
}).refine((data) => {
    if (data.date_debut && data.date_fin) {
        return data.date_fin >= data.date_debut;
    }
    return true;
}, {
    message: 'La date de fin doit être supérieure ou égale à la date de début',
    path: ['date_fin'],
});
export const analyticsModuleQuerySchema = z.object({
    module: z.enum(['members', 'courses', 'finance', 'store', 'trends', 'dashboard']),
    date_debut: z.coerce.date().optional(),
    date_fin: z.coerce.date().optional(),
    period_type: periodTypeSchema.optional(),
});
//# sourceMappingURL=analytics.validators.js.map