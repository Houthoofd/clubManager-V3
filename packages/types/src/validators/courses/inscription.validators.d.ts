import { z } from "zod";
export declare const createInscriptionSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    cours_id: z.ZodNumber;
    status_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    commentaire: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    cours_id: number;
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}, {
    utilisateur_id: number;
    cours_id: number;
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}>;
export declare const updateInscriptionSchema: z.ZodObject<{
    id: z.ZodNumber;
    status_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    commentaire: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}, {
    id: number;
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}>;
export declare const updatePresenceSchema: z.ZodObject<{
    inscription_id: z.ZodNumber;
    present: z.ZodBoolean;
    commentaire: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    inscription_id: number;
    present: boolean;
    commentaire?: string | undefined;
}, {
    inscription_id: number;
    present: boolean;
    commentaire?: string | undefined;
}>;
export declare const bulkCreateInscriptionSchema: z.ZodObject<{
    cours_id: z.ZodNumber;
    utilisateur_ids: z.ZodArray<z.ZodNumber, "many">;
    status_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    commentaire: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cours_id: number;
    utilisateur_ids: number[];
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}, {
    cours_id: number;
    utilisateur_ids: number[];
    status_id?: number | null | undefined;
    commentaire?: string | undefined;
}>;
export declare const searchInscriptionSchema: z.ZodEffects<z.ZodObject<{
    utilisateur_id: z.ZodOptional<z.ZodNumber>;
    cours_id: z.ZodOptional<z.ZodNumber>;
    status_id: z.ZodOptional<z.ZodNumber>;
    present: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
    sort_by: z.ZodOptional<z.ZodDefault<z.ZodEnum<["created_at", "date_cours", "utilisateur_id", "status_id"]>>>;
    sort_order: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    utilisateur_id?: number | undefined;
    status_id?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "status_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
    present?: boolean | undefined;
}, {
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    status_id?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "status_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
    present?: string | boolean | undefined;
}>, {
    page: number;
    limit: number;
    utilisateur_id?: number | undefined;
    status_id?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "status_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
    present?: boolean | undefined;
}, {
    utilisateur_id?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    status_id?: number | undefined;
    sort_by?: "created_at" | "utilisateur_id" | "status_id" | "date_cours" | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
    cours_id?: number | undefined;
    present?: string | boolean | undefined;
}>;
export declare const cancelInscriptionSchema: z.ZodObject<{
    id: z.ZodNumber;
    raison_annulation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    raison_annulation?: string | undefined;
}, {
    id: number;
    raison_annulation?: string | undefined;
}>;
export declare const getUserInscriptionsSchema: z.ZodObject<{
    utilisateur_id: z.ZodNumber;
    date_debut: z.ZodOptional<z.ZodString>;
    date_fin: z.ZodOptional<z.ZodString>;
    status_id: z.ZodOptional<z.ZodNumber>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    page: number;
    limit: number;
    status_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
}, {
    utilisateur_id: number;
    page?: number | undefined;
    limit?: number | undefined;
    status_id?: number | undefined;
    date_debut?: string | undefined;
    date_fin?: string | undefined;
}>;
export declare const getCourseInscriptionsSchema: z.ZodObject<{
    cours_id: z.ZodNumber;
    status_id: z.ZodOptional<z.ZodNumber>;
    present: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, boolean, string | boolean>>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    cours_id: number;
    status_id?: number | undefined;
    present?: boolean | undefined;
}, {
    cours_id: number;
    page?: number | undefined;
    limit?: number | undefined;
    status_id?: number | undefined;
    present?: string | boolean | undefined;
}>;
export declare const bulkUpdatePresenceSchema: z.ZodObject<{
    cours_id: z.ZodNumber;
    presences: z.ZodArray<z.ZodObject<{
        inscription_id: z.ZodNumber;
        present: z.ZodBoolean;
        commentaire: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        inscription_id: number;
        present: boolean;
        commentaire?: string | undefined;
    }, {
        inscription_id: number;
        present: boolean;
        commentaire?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cours_id: number;
    presences: {
        inscription_id: number;
        present: boolean;
        commentaire?: string | undefined;
    }[];
}, {
    cours_id: number;
    presences: {
        inscription_id: number;
        present: boolean;
        commentaire?: string | undefined;
    }[];
}>;
export type CreateInscriptionInput = z.infer<typeof createInscriptionSchema>;
export type UpdateInscriptionInput = z.infer<typeof updateInscriptionSchema>;
export type UpdatePresenceInput = z.infer<typeof updatePresenceSchema>;
export type BulkCreateInscriptionInput = z.infer<typeof bulkCreateInscriptionSchema>;
export type SearchInscriptionInput = z.infer<typeof searchInscriptionSchema>;
export type CancelInscriptionInput = z.infer<typeof cancelInscriptionSchema>;
export type GetUserInscriptionsInput = z.infer<typeof getUserInscriptionsSchema>;
export type GetCourseInscriptionsInput = z.infer<typeof getCourseInscriptionsSchema>;
export type BulkUpdatePresenceInput = z.infer<typeof bulkUpdatePresenceSchema>;
//# sourceMappingURL=inscription.validators.d.ts.map