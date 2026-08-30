export interface CreateCourseRecurrentDto {
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    active?: boolean;
    professeur_ids?: number[];
}
export interface UpdateCourseRecurrentDto {
    id: number;
    type_cours?: string;
    jour_semaine?: number;
    heure_debut?: string;
    heure_fin?: string;
    active?: boolean;
    professeur_ids?: number[];
}
export interface CourseRecurrentResponseDto {
    id: number;
    type_cours: string;
    jour_semaine: number;
    jour_semaine_nom: string;
    heure_debut: string;
    heure_fin: string;
    duree_minutes: number;
    active: boolean;
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
    created_at: string;
    updated_at?: string;
}
export interface CourseRecurrentListItemDto {
    id: number;
    type_cours: string;
    jour_semaine: number;
    jour_semaine_nom: string;
    heure_debut: string;
    heure_fin: string;
    duree_minutes: number;
    active: boolean;
    nombre_professeurs: number;
    professeurs_noms: string[];
}
export interface AssignProfessorDto {
    cours_recurrent_id: number;
    professeur_id: number;
}
export interface UnassignProfessorDto {
    cours_recurrent_id: number;
    professeur_id: number;
}
export interface DuplicateCourseRecurrentDto {
    id: number;
    nouveau_jour_semaine?: number;
    nouvelle_heure_debut?: string;
    nouvelle_heure_fin?: string;
}
export interface SearchCourseRecurrentDto {
    type_cours?: string;
    jour_semaine?: number;
    professeur_id?: number;
    active?: boolean;
}
export interface WeeklyScheduleDto {
    jour: number;
    jour_nom: string;
    cours: CourseRecurrentListItemDto[];
}
//# sourceMappingURL=CourseRecurrentDto.d.ts.map