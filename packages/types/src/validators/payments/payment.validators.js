import { z } from "zod";
import { dateISOSchema, idSchema, paginationSchema, searchQuerySchema, sortOrderSchema, } from "../common/common.validators.js";
const paymentMethodSchema = z.enum(["stripe", "especes", "virement", "autre"], {
    errorMap: () => ({
        message: "La méthode de paiement doit être 'stripe', 'especes', 'virement' ou 'autre'",
    }),
});
const paymentStatusSchema = z.enum(["en_attente", "valide", "echoue", "rembourse"], {
    errorMap: () => ({
        message: "Le statut doit être 'en_attente', 'valide', 'echoue' ou 'rembourse'",
    }),
});
const positiveAmountSchema = z
    .number({
    required_error: "Le montant est requis",
    invalid_type_error: "Le montant doit être un nombre",
})
    .positive("Le montant doit être strictement positif")
    .multipleOf(0.01, "Le montant ne peut avoir que 2 décimales maximum");
export const createPaymentSchema = z.object({
    utilisateur_id: idSchema,
    montant: positiveAmountSchema,
    methode_paiement: paymentMethodSchema,
    plan_tarifaire_id: idSchema.optional(),
    description: z
        .string()
        .max(1000, "La description ne peut pas dépasser 1000 caractères")
        .optional(),
});
export const updatePaymentSchema = z.object({
    id: idSchema,
    statut: paymentStatusSchema.optional(),
    description: z
        .string()
        .max(1000, "La description ne peut pas dépasser 1000 caractères")
        .optional(),
});
export const refundPaymentSchema = z.object({
    id: idSchema,
    raison: z
        .string()
        .min(10, "La raison du remboursement doit contenir au moins 10 caractères")
        .max(500, "La raison du remboursement ne peut pas dépasser 500 caractères"),
    montant_rembourse: positiveAmountSchema,
});
export const searchPaymentSchema = z
    .object({
    utilisateur_id: idSchema.optional(),
    date_debut: dateISOSchema.optional(),
    date_fin: dateISOSchema.optional(),
    statut: paymentStatusSchema.optional(),
    methode_paiement: paymentMethodSchema.optional(),
    plan_tarifaire_id: idSchema.optional(),
    montant_min: z
        .number()
        .positive("Le montant minimum doit être positif")
        .optional(),
    montant_max: z
        .number()
        .positive("Le montant maximum doit être positif")
        .optional(),
    search: searchQuerySchema,
    sort_by: z
        .enum(["date_paiement", "montant", "statut", "methode_paiement"])
        .default("date_paiement")
        .optional(),
    sort_order: sortOrderSchema.default("desc").optional(),
})
    .merge(paginationSchema)
    .refine((data) => {
    if (data.date_debut && data.date_fin) {
        return new Date(data.date_fin) >= new Date(data.date_debut);
    }
    return true;
}, {
    message: "La date de fin doit être supérieure ou égale à la date de début",
    path: ["date_fin"],
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
export const stripePaymentIntentSchema = z.object({
    payment_intent_id: z
        .string()
        .min(1, "L'ID du payment intent est requis")
        .startsWith("pi_", "L'ID du payment intent doit commencer par 'pi_'"),
    amount: positiveAmountSchema,
});
//# sourceMappingURL=payment.validators.js.map