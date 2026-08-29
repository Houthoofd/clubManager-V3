export interface CreateCourseDto {
    date_cours: string;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    cours_recurrent_id?: number;
    annule?: boolean;
}
export interface UpdateCourseDto {
    id: number;
    date_cours?: string;
    type_cours?: string;
    heure_debut?: string;
    heure_fin?: string;
    cours_recurrent_id?: number | null;
    annule?: boolean;
}
export interface CourseResponseDto {
    id: number;
    date_cours: string;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    duree_minutes: number;
    jour_semaine_nom: string;
    annule: boolean;
    raison_annulation?: string;
    cours_recurrent?: {
        id: number;
        type_cours: string;
        jour_semaine: number;
        jour_semaine_nom: string;
        heure_debut: string;
        heure_fin: string;
        active: boolean;
    };
    professeurs: {
        id: number;
        nom: string;
        prenom: string;
        nom_complet: string;
        email?: string;
        specialite?: string;
        photo_url?: string;
        grade?: {
            id: number;
            nom: string;
            couleur?: string;
        };
    }[];
    nombre_inscriptions: number;
    nombre_reservations: number;
    places_disponibles?: number;
    capacite_max?: number;
    created_at: string;
    updated_at?: string;
}
export interface CourseListItemDto {
    id: number;
    date_cours: string;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    duree_minutes: number;
    jour_semaine_nom: string;
    annule: boolean;
    nombre_inscriptions: number;
    nombre_reservations: number;
    nombre_professeurs: number;
    professeurs_noms: string[];
    cours_recurrent_id?: number;
}
export interface CancelCourseDto {
    id: number;
    raison_annulation?: string;
}
export interface SearchCourseDto {
    date_debut?: string;
    date_fin?: string;
    type_cours?: string;
    professeur_id?: number;
    annule?: boolean;
    cours_recurrent_id?: number;
}
export interface CourseCalendarDto {
    id: number;
    date_cours: string;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
    annule: boolean;
    couleur?: string;
    professeurs_noms: string[];
    nombre_inscriptions: number;
    cours_recurrent_id?: number;
}
export interface DuplicateCourseDto {
    id: number;
    nouvelle_date: string;
    nouvelle_heure_debut?: string;
    nouvelle_heure_fin?: string;
}
export interface GenerateCoursesDto {
    cours_recurrent_id: number;
    date_debut: string;
    date_fin: string;
    exclure_dates?: string[];
}
export interface CourseStatsDto {
    total_cours: number;
    cours_annules: number;
    cours_actifs: number;
    taux_annulation: number;
    moyenne_inscriptions: number;
    types_cours: {
        type: string;
        count: number;
    }[];
}
//# sourceMappingURL=CourseDto.d.ts.map