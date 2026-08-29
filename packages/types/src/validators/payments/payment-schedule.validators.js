import { z } from "zod";
import { dateISOSchema, futureDateSchema, idSchema, paginationSchema, searchQuerySchema, sortOrderSchema, } from "../common/common.validators.js";
const scheduleStatusSchema = z.enum(["en_attente", "paye", "en_retard", "annule"], {
    errorMap: () => ({
        message: "Le statut doit être 'en_attente', 'paye', 'en_retard' ou 'annule'",
    }),
});
const positiveAmountSchema = z
    .number({
    required_error: "Le montant est requis",
    invalid_type_error: "Le montant doit être un nombre",
})
    .positive("Le montant doit être strictement positif")
    .multipleOf(0.01, "Le montant ne peut avoir que 2 décimales maximum");
export const createPaymentScheduleSchema = z.object({
    utilisateur_id: idSchema,
    plan_tarifaire_id: idSchema,
    montant: positiveAmountSchema,
    date_echeance: futureDateSchema,
    statut: scheduleStatusSchema.default("en_attente").optional(),
});
export const updatePaymentScheduleSchema = z.object({
    id: idSchema,
    statut: scheduleStatusSchema.optional(),
    paiement_id: idSchema.optional(),
});
export const bulkCreatePaymentScheduleSchema = z
    .object({
    utilisateur_id: idSchema,
    plan_tarifaire_id: idSchema,
    nombre_echeances: z
        .number()
        .int("Le nombre d'échéances doit être un entier")
        .positive("Le nombre d'échéances doit être positif")
        .min(1, "Il doit y avoir au moins 1 échéance")
        .max(24, "Le nombre d'échéances ne peut pas dépasser 24"),
    date_debut: futureDateSchema,
})
    .transform((data) => {
    return data;
});
export const searchPaymentScheduleSchema = z
    .object({
    utilisateur_id: idSchema.optional(),
    plan_tarifaire_id: idSchema.optional(),
    statut: scheduleStatusSchema.optional(),
    date_echeance_debut: dateISOSchema.optional(),
    date_echeance_fin: dateISOSchema.optional(),
    montant_min: z
        .number()
        .positive("Le montant minimum doit être positif")
        .optional(),
    montant_max: z
        .number()
        .positive("Le montant maximum doit être positif")
        .optional(),
    en_retard: z
        .boolean({
        invalid_type_error: "en_retard doit être un boolean",
    })
        .optional(),
    search: searchQuerySchema,
    sort_by: z
        .enum([
        "date_echeance",
        "montant",
        "statut",
        "utilisateur_id",
        "created_at",
    ])
        .default("date_echeance")
        .optional(),
    sort_order: sortOrderSchema.default("asc").optional(),
})
    .merge(paginationSchema)
    .refine((data) => {
    if (data.date_echeance_debut && data.date_echeance_fin) {
        return (new Date(data.date_echeance_fin) >= new Date(data.date_echeance_debut));
    }
    return true;
}, {
    message: "La date d'échéance de fin doit être supérieure ou égale à la date de début",
    path: ["date_echeance_fin"],
})
    .refine((data) => {
    if (data.montant_min !== undefined && data.montant_max !== undefined) {
        return data.montant_max >= data.montant_min;
    }
    return true;
}, {
    message: "Le montant maximum doit être supérieur ou égal au montant minimum",
    path: ["montant_max"],
});
export const markAsPaidSchema = z.object({
    id: idSchema,
    paiement_id: idSchema,
});
//# sourceMappingURL=payment-schedule.validators.js.map