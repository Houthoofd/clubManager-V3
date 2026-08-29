export interface CreateProfessorDto {
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    specialite?: string;
    grade_id?: number;
    photo_url?: string;
    actif?: boolean;
}
export interface UpdateProfessorDto {
    id: number;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    specialite?: string;
    grade_id?: number;
    photo_url?: string;
    actif?: boolean;
}
export interface ProfessorResponseDto {
    id: number;
    nom: string;
    prenom: string;
    nom_complet: string;
    email?: string;
    telephone?: string;
    specialite?: string;
    photo_url?: string;
    actif: boolean;
    grade?: {
        id: number;
        nom: string;
        niveau?: number;
        couleur?: string;
    };
    cours_recurrents: {
        id: number;
        type_cours: string;
        jour_semaine: number;
        jour_semaine_nom: string;
        heure_debut: string;
        heure_fin: string;
        active: boolean;
    }[];
    stats: {
        nombre_cours_total: number;
        nombre_cours_actifs: number;
        prochains_cours: {
            id: number;
            type_cours: string;
            date: string;
            heure_debut: string;
            heure_fin: string;
        }[];
    };
    created_at: string;
    updated_at?: string;
}
export interface ProfessorListItemDto {
    id: number;
    nom: string;
    prenom: string;
    nom_complet: string;
    email?: string;
    telephone?: string;
    specialite?: string;
    photo_url?: string;
    actif: boolean;
    grade_nom?: string;
    grade_couleur?: string;
    nombre_cours: number;
}
export interface SearchProfessorDto {
    nom?: string;
    prenom?: string;
    specialite?: string;
    grade_id?: number;
    actif?: boolean;
}
export interface ProfessorStatsDto {
    professeur_id: number;
    nom_complet: string;
    nombre_cours_total: number;
    nombre_cours_actifs: number;
    prochains_cours: {
        id: number;
        type_cours: string;
        date: string;
        jour_semaine: number;
        jour_semaine_nom: string;
        heure_debut: string;
        heure_fin: string;
    }[];
}
export interface AssignCourseDto {
    professeur_id: number;
    cours_recurrent_id: number;
}
export interface UnassignCourseDto {
    professeur_id: number;
    cours_recurrent_id: number;
}
//# sourceMappingURL=ProfessorDto.d.ts.map