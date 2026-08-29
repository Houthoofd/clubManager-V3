export interface CourseRecurrent {
    id: number;
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    active: boolean;
    created_at: Date;
    updated_at?: Date | null;
}
export interface CourseRecurrentWithRelations extends CourseRecurrent {
    professeurs: {
        id: number;
        nom: string;
        prenom: string;
        email?: string;
        specialite?: string;
        grade?: {
            id: number;
            nom: string;
            couleur?: string;
        };
    }[];
}
export interface CourseRecurrentPublic {
    id: number;
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    active: boolean;
}
export interface CourseRecurrentWithDayName extends CourseRecurrent {
    jour_semaine_nom: string;
}
export declare enum DayOfWeek {
    LUNDI = 1,
    MARDI = 2,
    MERCREDI = 3,
    JEUDI = 4,
    VENDREDI = 5,
    SAMEDI = 6,
    DIMANCHE = 7
}
export declare const DAY_OF_WEEK_NAMES: Record<number, string>;
export interface CourseRecurrentBasic {
    id: number;
    type_cours: string;
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
}
//# sourceMappingURL=CourseRecurrent.types.d.ts.map