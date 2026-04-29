/**
 * IReservationRepository
 * Interface du repository réservations (Domain Layer)
 * Contrat pour toutes les opérations de gestion des réservations
 */

import type {
  ReservationDto,
  CreateReservationDto,
  ReservationStatut,
  GetReservationsQuery,
  PaginatedReservationsResponse,
} from "../types.js";

export interface IReservationRepository {
  /**
   * Récupère toutes les réservations avec filtres optionnels et pagination
   */
  findAll(query: GetReservationsQuery): Promise<PaginatedReservationsResponse>;

  /**
   * Récupère une réservation par son ID avec les données jointes
   * @returns null si introuvable
   */
  findById(id: number): Promise<ReservationDto | null>;

  /**
   * Récupère une réservation par utilisateur et cours
   * @returns null si introuvable
   */
  findByUserAndCours(
    userId: number,
    coursId: number,
  ): Promise<ReservationDto | null>;

  /**
   * Crée une nouvelle réservation et retourne l'entité complète avec joins
   */
  create(data: CreateReservationDto): Promise<ReservationDto>;

  /**
   * Met à jour le statut d'une réservation existante
   */
  updateStatus(id: number, statut: ReservationStatut): Promise<void>;

  /**
   * Compte les réservations actives (non annulées) pour un cours donné
   */
  countActive(coursId: number): Promise<number>;
}
