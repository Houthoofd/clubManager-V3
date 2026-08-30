import { z } from "zod";
export declare const createReservationSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    cours_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    cours_id: number;
}, {
    utilisateur_id: number;
    cours_id: number;
}>;
export declare const cancelReservationSchema: z.ZodObject<{
    id: z.ZodNumber;
    raison_annulation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    raison_annulation?: string | undefined;
}, {
    id: number;
    raison_annulation?: string | undefined;
}>;
export declare const searchReservationSchema: z.ZodEffects<z.ZodObject<{
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    cours_id: z.ZodOptional<z.ZodNumber>;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "cancelled", "converted"]>>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["created_at", "date_cours", "utilisateur_id"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "active" | "cancelled" | "converted" | undefined;
    utilisateur_id?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
}, {
    status?: "active" | "cancelled" | "converted" | undefined;
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
}>, {
    page: number;
    limit: number;
    status?: "active" | "cancelled" | "converted" | undefined;
    utilisateur_id?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
}, {
    status?: "active" | "cancelled" | "converted" | undefined;
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
}>;
export declare const checkAvailabilitySchema: z.ZodObject<{
    cours_id: z.ZodNumber;
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    cours_id: number;
    utilisateur_id?: number | undefined;
}, {
    cours_id: number;
    utilisateur_id?: number | undefined;
}>;
export declare const getUserReservationsSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "cancelled", "converted"]>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    page: number;
    limit: number;
    status?: "active" | "cancelled" | "converted" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
}, {
    utilisateur_id: number;
    status?: "active" | "cancelled" | "converted" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
}>;
export declare const getCourseReservationsSchema: z.ZodObject<{
    cours_id: z.ZodNumber;
    status: z.ZodOptional<z.ZodEnum<["active", "cancelled", "converted"]>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    cours_id: number;
    status?: "active" | "cancelled" | "converted" | undefined;
}, {
    cours_id: number;
    status?: "active" | "cancelled" | "converted" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const convertReservationToInscriptionSchema: z.ZodObject<{
    reservation_id: z.ZodNumber;
    status_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    commentaire: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reservation_id: number;
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}, {
    reservation_id: number;
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}>;
export declare const checkReservationConflictSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    cours_id: z.ZodNumber;
    date_cours: z.ZodString;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    date_cours: string;
    cours_id: number;
}, {
    utilisateur_id: number;
    date_cours: string;
    cours_id: number;
}>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type SearchReservationInput = z.infer<typeof searchReservationSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
export type GetUserReservationsInput = z.infer<typeof getUserReservationsSchema>;
export type GetCourseReservationsInput = z.infer<typeof getCourseReservationsSchema>;
export type ConvertReservationToInscriptionInput = z.infer<typeof convertReservationToInscriptionSchema>;
export type CheckReservationConflictInput = z.infer<typeof checkReservationConflictSchema>;
//# sourceMappingURL=reservation.validators.d.ts.map