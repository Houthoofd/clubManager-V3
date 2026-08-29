export interface Course {
    id: number;
    date_cours: Date;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    cours_recurrent_id: number;
    annule: boolean;
    created_at: Date;
}
export interface CourseWithRelations extends Course {
    cours_recurrent: {
        id: number;
        type_cours: string;
        jour_semaine: number;
        heure_debut: string;
        heure_fin: string;
        active: boolean;
    };
    professeurs?: {
        id: number;
        nom: string;
        prenom: string;
        email?: string;
        specialite?: string;
        photo_url?: string;
        grade?: {
            id: number;
            nom: string;
            couleur?: string;
        };
    }[];
    inscriptions?: {
        id: number;
        utilisateur_id: number;
        date_inscription: Date;
        status_id?: number;
    }[];
    reservations?: {
        id: number;
        utilisateur_id: number;
        date_reservation: Date;
        annule: boolean;
    }[];
    nombre_inscrits?: number;
    nombre_reservations?: number;
}
export interface CoursePublic {
    id: number;
    date_cours: Date;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    annule: boolean;
    nombre_places_disponibles?: number;
}
export interface CourseDetail extends CourseWithRelations {
    jour_semaine_nom: string;
    duree_minutes: number;
    est_complet: boolean;
}
export interface CourseBasic {
    id: number;
    date_cours: Date;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    annule: boolean;
}
export interface CourseCalendarItem {
    id: number;
    date_cours: Date;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    annule: boolean;
    professeurs: string[];
    nombre_inscrits: number;
}
//# sourceMappingURL=Course.types.d.ts.map