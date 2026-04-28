/**
 * IRecoveryRepository
 * Interface du repository de demandes de récupération manuelle (Domain Layer)
 * Contrat pour les opérations sur la table manual_recovery_requests
 */

import type {
  RecoveryRequest,
  GetRecoveryRequestsQuery,
  PaginatedRecoveryResponse,
} from "../types.js";

export interface IRecoveryRepository {
  /** Retourne la liste paginée des demandes avec filtre optionnel sur le statut */
  findAll(query: GetRecoveryRequestsQuery): Promise<PaginatedRecoveryResponse>;

  /** Retourne une demande par son ID, ou null si inexistante */
  findById(id: number): Promise<RecoveryRequest | null>;

  /** Met à jour le statut d'une demande ('approved' ou 'rejected') */
  updateStatus(id: number, status: 'approved' | 'rejected'): Promise<void>;
}
