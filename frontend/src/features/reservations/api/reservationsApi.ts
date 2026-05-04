/**
 * Reservations API Service
 * Service pour gérer les appels API du module réservations.
 *
 * Endpoints couverts (reservationRoutes.ts) :
 *  GET    /reservations             — liste paginée (ADMIN/PROF filtres libres, MEMBER filtré sur lui-même)
 *  GET    /reservations/my          — raccourci réservations de l'utilisateur connecté
 *  POST   /reservations             — créer une réservation
 *  PATCH  /reservations/:id/cancel  — annuler une réservation
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";

// ─── Local Types ──────────────────────────────────────────────────────────────

export type ReservationStatut = "confirmee" | "annulee" | "en_attente";

/**
 * Reservation record enriched by the backend JOIN query.
 * Dates arrive as ISO-8601 strings over HTTP.
 */
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

/**
 * Optional filters / pagination params for GET /reservations
 */
export interface GetReservationsParams {
  cours_id?: number;
  user_id?: number;
  statut?: ReservationStatut | string;
  page?: number;
  limit?: number;
}

/**
 * Paginated result returned by GET /reservations
 * (matches PaginatedReservationsResponse from the domain layer)
 */
export interface PaginatedReservationsResult {
  reservations: ReservationDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Payload for POST /reservations
 */
export interface CreateReservationPayload {
  cours_id: number;
  user_id?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des réservations avec filtres optionnels.
 * Rôles : ADMIN / PROFESSOR (filtres libres), MEMBER (filtré automatiquement sur lui-même)
 */
export const getReservations = async (
  params?: GetReservationsParams,
): Promise<PaginatedReservationsResult> => {
  const response = await apiClient.get<
    ApiResponse<PaginatedReservationsResult>
  >("/reservations", { params });
  return response.data.data!;
};

/**
 * Raccourci GET /reservations/my
 * Retourne uniquement les réservations de l'utilisateur authentifié.
 * Disponible pour tous les rôles.
 */
export const getMyReservations = async (
  params?: Omit<GetReservationsParams, "user_id">,
): Promise<PaginatedReservationsResult> => {
  const response = await apiClient.get<
    ApiResponse<PaginatedReservationsResult>
  >("/reservations/my", { params });
  return response.data.data!;
};

/**
 * Crée une réservation.
 * ADMIN peut passer un user_id pour créer au nom d'un autre utilisateur.
 */
export const createReservation = async (
  payload: CreateReservationPayload,
): Promise<ReservationDto> => {
  const response = await apiClient.post<ApiResponse<ReservationDto>>(
    "/reservations",
    payload,
  );
  return response.data.data!;
};

/**
 * Annule une réservation via PATCH /reservations/:id/cancel.
 */
export const cancelReservation = async (id: number): Promise<void> => {
  await apiClient.patch(`/reservations/${id}/cancel`);
};
