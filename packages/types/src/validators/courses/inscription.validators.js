import { z } from "zod";
import { booleanSchema, dateISOSchema, idSchema, idsArraySchema, paginationSchema, sortOrderSchema, } from "../common/common.validators.js";
const commentaireSchema = z
    .string()
    .min(1, "Le commentaire doit contenir au moins 1 caractère")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères")
    .optional();
export const createInscriptionSchema = z.object({
    utilisateur_id: idSchema,
    cours_id: idSchema,
    status_id: idSchema.optional().nullable(),
    commentaire: commentaireSchema,
});
export const updateInscriptionSchema = z.object({
    id: idSchema,
    status_id: idSchema.optional().nullable(),
    commentaire: commentaireSchema,
});
export const updatePresenceSchema = z.object({
    inscription_id: idSchema,
    present: z.boolean(),
    commentaire: commentaireSchema,
});
export const bulkCreateInscriptionSchema = z.object({
    cours_id: idSchema,
    utilisateur_ids: idsArraySchema,
    status_id: idSchema.optional().nullable(),
    commentaire: commentaireSchema,
});
export const searchInscriptionSchema = z
    .object({
    utilisateur_id: idSchema.optional(),
    cours_id: idSchema.optional(),
    status_id: idSchema.optional(),
    present: booleanSchema.optional(),
    date_debut: dateISOSchema.optional(),
    date_fin: dateISOSchema.optional(),
    sort_by: z
        .enum(["created_at", "date_cours", "utilisateur_id", "status_id"], {
        errorMap: () => ({
            message: "Le tri doit être par 'created_at', 'date_cours', 'utilisateur_id' ou 'status_id'",
        }),
    })
        .default("created_at")
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
});
export const cancelInscriptionSchema = z.object({
    id: idSchema,
    raison_annulation: z
        .string()
        .min(10, "La raison d'annulation doit contenir au moins 10 caractères")
        .max(500, "La raison d'annulation ne peut pas dépasser 500 caractères")
        .optional(),
});
export const getUserInscriptionsSchema = z
    .object({
    utilisateur_id: idSchema,
    date_debut: dateISOSchema.optional(),
    date_fin: dateISOSchema.optional(),
    status_id: idSchema.optional(),
})
    .merge(paginationSchema);
export const getCourseInscriptionsSchema = z
    .object({
    cours_id: idSchema,
    status_id: idSchema.optional(),
    present: booleanSchema.optional(),
})
    .merge(paginationSchema);
export const bulkUpdatePresenceSchema = z.object({
    cours_id: idSchema,
    presences: z.array(z.object({
        inscription_id: idSchema,
        present: z.boolean(),
        commentaire: commentaireSchema,
    })),
});
//# sourceMappingURL=inscription.validators.js.map