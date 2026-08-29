export interface CreateReservationDto {
    utilisateur_id: number;
    cours_id: number;
}
export interface CancelReservationDto {
    id: number;
    raison_annulation?: string;
}
export interface ReservationResponseDto {
    id: number;
    date_reservation: string;
    utilisateur: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        nom_utilisateur: string;
        email: string;
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
        duree_minutes: number;
        jour_semaine_nom: string;
        annule: boolean;
        raison_annulation?: string;
        professeurs: {
            id: number;
            nom: string;
            prenom: string;
            nom_complet: string;
            photo_url?: string;
        }[];
        nombre_inscriptions: number;
        nombre_reservations: number;
        places_disponibles?: number;
        capacite_max?: number;
    };
    annule: boolean;
    raison_annulation?: string;
    created_at: string;
    updated_at?: string;
}
export interface ReservationListItemDto {
    id: number;
    date_reservation: string;
    annule: boolean;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_nom_complet: string;
    utilisateur_photo_url?: string;
    cours_id: number;
    cours_date: string;
    cours_type: string;
    cours_heure_debut: string;
    cours_heure_fin: string;
    cours_annule: boolean;
    cours_professeurs_noms: string[];
}
export interface SearchReservationDto {
    utilisateur_id?: number;
    cours_id?: number;
    date_debut?: string;
    date_fin?: string;
    annule?: boolean;
}
export interface ReservationAvailabilityDto {
    cours_id: number;
    disponible: boolean;
    places_disponibles: number;
    capacite_max?: number;
    nombre_reservations_actuelles: number;
    nombre_inscriptions_actuelles: number;
    cours_annule: boolean;
    message?: string;
}
export interface CheckUserReservationDto {
    utilisateur_id: number;
    cours_id: number;
}
export interface CheckUserReservationResponseDto {
    peut_reserver: boolean;
    raison?: string;
    reservation_existante?: {
        id: number;
        date_reservation: string;
        annule: boolean;
    };
}
export interface ReservationStatsDto {
    total_reservations: number;
    reservations_actives: number;
    reservations_annulees: number;
    taux_annulation: number;
    utilisateurs_uniques: number;
    cours_uniques: number;
    moyenne_reservations_par_cours: number;
    moyenne_reservations_par_utilisateur: number;
}
export interface UserReservationsDto {
    utilisateur_id: number;
    utilisateur_nom_complet: string;
    reservations_actives: ReservationListItemDto[];
    reservations_passees: ReservationListItemDto[];
    reservations_annulees: ReservationListItemDto[];
    total_reservations: number;
}
export interface CourseReservationsDto {
    cours_id: number;
    cours_date: string;
    cours_type: string;
    cours_heure_debut: string;
    cours_heure_fin: string;
    reservations: ReservationListItemDto[];
    nombre_reservations: number;
    places_disponibles?: number;
    capacite_max?: number;
}
export interface BulkCancelReservationsDto {
    reservation_ids: number[];
    raison_annulation?: string;
}
export interface BulkCancelReservationsResponseDto {
    success_count: number;
    failed_count: number;
    results: {
        reservation_id: number;
        success: boolean;
        error?: string;
    }[];
}
//# sourceMappingURL=ReservationDto.d.ts.map