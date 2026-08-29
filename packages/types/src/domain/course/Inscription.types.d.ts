export interface Inscription {
    id: number;
    utilisateur_id: number;
    cours_id: number;
    status_id?: number | null;
    date_inscription: Date;
    commentaire?: string | null;
}
export interface InscriptionWithRelations extends Inscription {
    utilisateur: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        email: string;
        photo_url?: string;
        grade?: {
            id: number;
            nom: string;
            couleur?: string;
        };
    };
    cours: {
        id: number;
        date_cours: Date;
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        annule: boolean;
    };
    status?: {
        id: number;
        nom: string;
        description?: string;
    } | null;
}
export interface InscriptionPublic {
    id: number;
    utilisateur_id: number;
    cours_id: number;
    date_inscription: Date;
    status_id?: number | null;
}
export interface InscriptionWithNames extends Inscription {
    utilisateur_nom_complet: string;
    cours_type: string;
    cours_date: Date;
    status_nom?: string;
}
export interface InscriptionBasic {
    id: number;
    utilisateur_id: number;
    cours_id: number;
    status_id?: number | null;
}
export interface InscriptionListItem {
    id: number;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    cours_id: number;
    cours_type: string;
    cours_date: Date;
    date_inscription: Date;
    status_nom?: string;
    commentaire?: string;
}
export interface InscriptionAttendanceSheet {
    id: number;
    utilisateur_id: number;
    nom_complet: string;
    grade_nom?: string;
    status_id?: number | null;
    present: boolean;
    commentaire?: string;
}
export interface InscriptionStats {
    total_inscriptions: number;
    total_presents: number;
    total_absents: number;
    taux_presence: number;
}
export declare enum PresenceStatus {
    ABSENT = 0,
    PRESENT = 1,
    EXCUSE = 2,
    RETARD = 3
}
//# sourceMappingURL=Inscription.types.d.ts.map