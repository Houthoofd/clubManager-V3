/**
 * Reservations Domain Types
 * Types et interfaces pour le module réservations (Domain Layer)
 */

export type ReservationStatut = 'confirmee' | 'annulee' | 'en_attente';

export interface ReservationDto {
  id: number;
  user_id: number;
  cours_id: number;
  statut: ReservationStatut;
  created_at: string;
  updated_at: string;
  // Joined data
  user_nom?: string;
  user_prenom?: string;
  user_email?: string;
  cours_date?: string;
  cours_type?: string;
  cours_heure_debut?: string;
  cours_heure_fin?: string;
}

export interface CreateReservationDto {
  user_id: number;
  cours_id: number;
  statut?: ReservationStatut;
}

export interface UpdateReservationStatusDto {
  id: number;
  statut: ReservationStatut;
}

export interface GetReservationsQuery {
  cours_id?: number;
  user_id?: number;
  statut?: ReservationStatut;
  page?: number;
  limit?: number;
}

export interface PaginatedReservationsResponse {
  reservations: ReservationDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
