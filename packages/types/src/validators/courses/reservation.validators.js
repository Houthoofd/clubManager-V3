import { z } from "zod";
import { dateISOSchema, idSchema, paginationSchema, sortOrderSchema, } from "../common/common.validators.js";
export const createReservationSchema = z.object({
    utilisateur_id: idSchema,
    cours_id: idSchema,
});
export const cancelReservationSchema = z.object({
    id: idSchema,
    raison_annulation: z
        .string()
        .min(10, "La raison d'annulation doit contenir au moins 10 caractères")
        .max(500, "La raison d'annulation ne peut pas dépasser 500 caractères")
        .optional(),
});
export const searchReservationSchema = z
    .object({
    utilisateur_id: idSchema.optional(),
    cours_id: idSchema.optional(),
    date_debut: dateISOSchema.optional(),
    date_fin: dateISOSchema.optional(),
    status: z
        .enum(["active", "cancelled", "converted"], {
        errorMap: () => ({
            message: "Le statut doit être 'active', 'cancelled' ou 'converted'",
        }),
    })
        .optional(),
    sort_by: z
        .enum(["created_at", "date_cours", "utilisateur_id"], {
        errorMap: () => ({
            message: "Le tri doit être par 'created_at', 'date_cours' ou 'utilisateur_id'",
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
export const checkAvailabilitySchema = z.object({
    cours_id: idSchema,
    utilisateur_id: idSchema.optional(),
});
export const getUserReservationsSchema = z
    .object({
    utilisateur_id: idSchema,
    date_debut: dateISOSchema.optional(),
    date_fin: dateISOSchema.optional(),
    status: z
        .enum(["active", "cancelled", "converted"], {
        errorMap: () => ({
            message: "Le statut doit être 'active', 'cancelled' ou 'converted'",
        }),
    })
        .optional(),
})
    .merge(paginationSchema);
export const getCourseReservationsSchema = z
    .object({
    cours_id: idSchema,
    status: z
        .enum(["active", "cancelled", "converted"], {
        errorMap: () => ({
            message: "Le statut doit être 'active', 'cancelled' ou 'converted'",
        }),
    })
        .optional(),
})
    .merge(paginationSchema);
export const convertReservationToInscriptionSchema = z.object({
    reservation_id: idSchema,
    status_id: idSchema.optional().nullable(),
    commentaire: z
        .string()
        .min(1, "Le commentaire doit contenir au moins 1 caractère")
        .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères")
        .optional(),
});
export const checkReservationConflictSchema = z.object({
    utilisateur_id: idSchema,
    cours_id: idSchema,
    date_cours: dateISOSchema,
});
//# sourceMappingURL=reservation.validators.js.map