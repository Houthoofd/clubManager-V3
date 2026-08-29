export interface CreateInscriptionDto {
    utilisateur_id: number;
    cours_id: number;
    status_id?: number | null;
    commentaire?: string;
}
export interface UpdateInscriptionDto {
    id: number;
    status_id?: number | null;
    commentaire?: string;
}
export interface InscriptionResponseDto {
    id: number;
    date_inscription: string;
    utilisateur: {
        id: number;
        userId: string;
        nom: string;
        prenom: string;
        nom_complet: string;
        email?: string;
        telephone?: string;
        photo_url?: string;
        grade?: {
            id: number;
            nom: string;
            couleur?: string;
        };
    };
    cours: {
        id: number;
        date_cours: string;
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        annule: boolean;
        professeurs?: {
            id: number;
            nom: string;
            prenom: string;
            nom_complet: string;
        }[];
    };
    status?: {
        id: number;
        nom: string;
    } | null;
    commentaire?: string;
}
export interface InscriptionListItemDto {
    id: number;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_nom_complet: string;
    grade_nom?: string;
    grade_couleur?: string;
    status_id?: number | null;
    status_nom?: string;
    date_inscription: string;
    commentaire?: string;
}
export interface BulkCreateInscriptionDto {
    cours_id: number;
    utilisateur_ids: number[];
    status_id?: number | null;
    commentaire?: string;
}
export interface BulkCreateInscriptionResponseDto {
    success: boolean;
    inscriptions_created: number;
    inscriptions: InscriptionResponseDto[];
    errors?: {
        utilisateur_id: number;
        error: string;
    }[];
}
export interface UpdatePresenceDto {
    inscription_id: number;
    status_id: number | null;
}
export interface BulkUpdatePresenceDto {
    updates: {
        inscription_id: number;
        status_id: number | null;
    }[];
}
export interface SearchInscriptionDto {
    utilisateur_id?: number;
    cours_id?: number;
    date_debut?: string;
    date_fin?: string;
    status_id?: number | null;
    type_cours?: string;
    limit?: number;
    offset?: number;
}
export interface AttendanceSheetDto {
    cours: {
        id: number;
        date_cours: string;
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        jour_semaine_nom: string;
    };
    professeurs: {
        id: number;
        nom: string;
        prenom: string;
        nom_complet: string;
    }[];
    inscriptions: {
        id: number;
        utilisateur_id: number;
        nom: string;
        prenom: string;
        nom_complet: string;
        grade?: {
            nom: string;
            couleur?: string;
        };
        status_id?: number | null;
        status_nom?: string;
        commentaire?: string;
    }[];
    statistiques: {
        total_inscrits: number;
        nombre_presents: number;
        nombre_absents: number;
        taux_presence: number;
    };
    generated_at: string;
}
export interface UserAttendanceStatsDto {
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    periode: {
        date_debut: string;
        date_fin: string;
    };
    total_cours: number;
    nombre_presents: number;
    nombre_absents: number;
    taux_presence: number;
    derniere_presence?: string;
}
export interface CourseAttendanceStatsDto {
    cours_id: number;
    type_cours: string;
    date_cours: string;
    total_inscrits: number;
    nombre_presents: number;
    nombre_absents: number;
    taux_presence: number;
}
export interface UserInscriptionHistoryDto {
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    inscriptions: {
        id: number;
        cours_id: number;
        type_cours: string;
        date_cours: string;
        heure_debut: string;
        heure_fin: string;
        date_inscription: string;
        status_id?: number | null;
        status_nom?: string;
        commentaire?: string;
    }[];
    total: number;
}
export interface CancelInscriptionDto {
    id: number;
    raison?: string;
}
//# sourceMappingURL=InscriptionDto.d.ts.map