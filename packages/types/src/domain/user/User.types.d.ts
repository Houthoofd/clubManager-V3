import type { UserRole } from "../../enums/UserRole.enum.js";
export interface User {
    id: number;
    userId: string;
    first_name: string;
    last_name: string;
    nom_utilisateur: string;
    email: string;
    date_of_birth: Date;
    telephone?: string;
    adresse?: string;
    genre_id: number;
    grade_id?: number;
    abonnement_id?: number;
    status_id: number;
    password: string;
    active: boolean;
    email_verified: boolean;
    photo_url?: string;
    tuteur_id?: number | null;
    est_mineur?: boolean;
    peut_se_connecter?: boolean;
    role_app?: UserRole;
    langue_preferee?: string;
    deleted_at?: Date | null;
    deleted_by?: number | null;
    deletion_reason?: string | null;
    anonymized: boolean;
    date_inscription: Date;
    derniere_connexion?: Date | null;
    created_at: Date;
    updated_at?: Date | null;
}
export interface UserWithRelations extends User {
    genre: {
        id: number;
        nom: string;
    };
    grade?: {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string;
    };
    abonnement?: {
        id: number;
        nom: string;
        prix: number;
        duree_mois: number;
    };
    status: {
        id: number;
        nom: string;
        description?: string;
    };
}
export interface UserPublic {
    id: number;
    userId: string;
    first_name: string;
    last_name: string;
    nom_utilisateur: string;
    email: string;
    email_verified: boolean;
    photo_url?: string;
    genre_id: number;
    grade_id?: number;
    status_id: number;
    langue_preferee?: string;
    date_inscription: Date;
}
export interface UserBasic {
    id: number;
    userId: string;
    first_name: string;
    last_name: string;
    email: string;
}
//# sourceMappingURL=User.types.d.ts.map