export interface Professor {
    id: number;
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    specialite?: string;
    photo_url?: string;
    grade_id?: number | null;
    actif: boolean;
    created_at: Date;
    updated_at?: Date | null;
}
export interface ProfessorWithRelations extends Professor {
    grade?: {
        id: number;
        nom: string;
        ordre: number;
        couleur?: string;
    } | null;
    cours_recurrents?: {
        id: number;
        type_cours: string;
        jour_semaine: number;
        heure_debut: string;
        heure_fin: string;
        active: boolean;
    }[];
}
export interface ProfessorPublic {
    id: number;
    nom: string;
    prenom: string;
    specialite?: string;
    photo_url?: string;
    grade?: {
        nom: string;
        couleur?: string;
    };
}
export interface ProfessorWithFullName extends Professor {
    nom_complet: string;
}
export interface ProfessorBasic {
    id: number;
    nom: string;
    prenom: string;
    email?: string;
}
export interface ProfessorListItem {
    id: number;
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    specialite?: string;
    grade_nom?: string;
    actif: boolean;
}
export interface ProfessorWithStats extends Professor {
    nombre_cours_assignes: number;
    nombre_cours_actifs: number;
    prochains_cours?: {
        id: number;
        date_cours: Date;
        type_cours: string;
        heure_debut: string;
    }[];
}
//# sourceMappingURL=Professor.types.d.ts.map