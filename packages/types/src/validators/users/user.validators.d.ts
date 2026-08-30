import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    nom_utilisateur: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
    date_of_birth: z.ZodEffects<z.ZodString, string, string>;
    telephone: z.ZodOptional<z.ZodString>;
    adresse: z.ZodOptional<z.ZodString>;
    genre_id: z.ZodNumber;
    grade_id: z.ZodOptional<z.ZodNumber>;
    abonnement_id: z.ZodOptional<z.ZodNumber>;
    status_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    telephone?: string | undefined;
    adresse?: string | undefined;
    grade_id?: number | undefined;
    abonnement_id?: number | undefined;
    status_id?: number | undefined;
}, {
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    nom_utilisateur?: string | undefined;
    telephone?: string | undefined;
    adresse?: string | undefined;
    grade_id?: number | undefined;
    abonnement_id?: number | undefined;
    status_id?: number | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    id: z.ZodNumber;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    nom_utilisateur: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    date_of_birth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    telephone: z.ZodOptional<z.ZodString>;
    adresse: z.ZodOptional<z.ZodString>;
    genre_id: z.ZodOptional<z.ZodNumber>;
    grade_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    abonnement_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    status_id: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: number;
    password?: string | undefined;
    email?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    nom_utilisateur?: string | undefined;
    date_of_birth?: string | undefined;
    telephone?: string | undefined;
    adresse?: string | undefined;
    genre_id?: number | undefined;
    grade_id?: number | null | undefined;
    abonnement_id?: number | null | undefined;
    status_id?: number | undefined;
}, {
    id: number;
    password?: string | undefined;
    email?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    nom_utilisateur?: string | undefined;
    date_of_birth?: string | undefined;
    telephone?: string | undefined;
    adresse?: string | undefined;
    genre_id?: number | undefined;
    grade_id?: number | null | undefined;
    abonnement_id?: number | null | undefined;
    status_id?: number | undefined;
}>;
export declare const softDeleteUserSchema: z.ZodObject<{
    userId: z.ZodNumber;
    deletedBy: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: number;
    reason: string;
    deletedBy: number;
}, {
    userId: number;
    reason: string;
    deletedBy: number;
}>;
export declare const restoreUserSchema: z.ZodObject<{
    userId: z.ZodNumber;
    restoredBy: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    userId: number;
    restoredBy: number;
}, {
    userId: number;
    restoredBy: number;
}>;
export declare const updatePasswordSchema: z.ZodObject<{
    userId: z.ZodNumber;
    oldPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: number;
    newPassword: string;
    oldPassword: string;
}, {
    userId: number;
    newPassword: string;
    oldPassword: string;
}>;
export declare const updateEmailSchema: z.ZodObject<{
    userId: z.ZodNumber;
    newEmail: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: number;
    newEmail: string;
}, {
    userId: number;
    newEmail: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    userId: z.ZodNumber;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    telephone: z.ZodOptional<z.ZodString>;
    adresse: z.ZodOptional<z.ZodString>;
    photo_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: number;
    first_name?: string | undefined;
    last_name?: string | undefined;
    telephone?: string | undefined;
    adresse?: string | undefined;
    photo_url?: string | undefined;
}, {
    userId: number;
    first_name?: string | undefined;
    last_name?: string | undefined;
    telephone?: string | undefined;
    adresse?: string | undefined;
    photo_url?: string | undefined;
}>;
export declare const anonymizeUserSchema: z.ZodObject<{
    userId: z.ZodNumber;
    anonymizedBy: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: number;
    reason: string;
    anonymizedBy: number;
}, {
    userId: number;
    reason: string;
    anonymizedBy: number;
}>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SoftDeleteUserInput = z.infer<typeof softDeleteUserSchema>;
export type RestoreUserInput = z.infer<typeof restoreUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AnonymizeUserInput = z.infer<typeof anonymizeUserSchema>;
//# sourceMappingURL=user.validators.d.ts.map