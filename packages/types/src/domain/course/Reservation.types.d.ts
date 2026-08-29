export interface Reservation {
    id: number;
    utilisateur_id: number;
    cours_id: number;
    date_reservation: Date;
    annule: boolean;
}
export interface ReservationWithRelations extends Reservation {
    utilisateur: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        email: string;
        telephone?: string;
        photo_url?: string;
    };
    cours: {
        id: number;
        date_cours: Date;
        type_cours: string;
        heure_debut: string;
        heure_fin: string;
        annule: boolean;
        nombre_places_restantes?: number;
    };
}
export interface ReservationPublic {
    id: number;
    cours_id: number;
    date_reservation: Date;
    annule: boolean;
}
export interface ReservationWithNames extends Reservation {
    utilisateur_nom_complet: string;
    cours_type: string;
    cours_date: Date;
    cours_heure: string;
}
export interface ReservationBasic {
    id: number;
    utilisateur_id: number;
    cours_id: number;
    annule: boolean;
}
export interface ReservationListItem {
    id: number;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    cours_id: number;
    cours_type: string;
    cours_date: Date;
    cours_heure_debut: string;
    cours_heure_fin: string;
    date_reservation: Date;
    annule: boolean;
    cours_annule: boolean;
}
export interface ReservationUserPlanning {
    id: number;
    cours_id: number;
    cours_type: string;
    cours_date: Date;
    heure_debut: string;
    heure_fin: string;
    date_reservation: Date;
    annule: boolean;
    peut_annuler: boolean;
}
export interface ReservationStats {
    total_reservations: number;
    reservations_actives: number;
    reservations_annulees: number;
    taux_annulation: number;
}
export interface ReservationWithAvailability extends Reservation {
    cours_complet: boolean;
    position_liste_attente?: number;
}
//# sourceMappingURL=Reservation.types.d.ts.map