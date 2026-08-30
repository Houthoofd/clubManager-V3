/**
 * IInvitationRepository
 * Interface du repository d'invitations (Domain Layer)
 * Contrat pour les opérations sur la table invitations
 */

import type { Invitation, CreateInvitationDto } from "../types.js";

export interface IInvitationRepository {
  /** Crée une nouvelle invitation avec token hashé et date d'expiration */
  create(
    dto: CreateInvitationDto & { token_hash: string; expires_at: Date },
  ): Promise<Invitation>;

  /** Retourne une invitation par son token hashé, ou null si inexistante */
  findByTokenHash(tokenHash: string): Promise<Invitation | null>;

  /** Retourne une invitation pending non expirée pour l'email donné, ou null */
  findByEmail(email: string): Promise<Invitation | null>;

  /** Retourne une invitation par son ID, ou null si inexistante */
  findById(id: number): Promise<Invitation | null>;

  /** Retourne la liste paginée de toutes les invitations */
  findAll(page: number, limit: number): Promise<{ data: Invitation[]; total: number }>;

  /** Marque une invitation comme utilisée (status → accepted, used_at = now) */
  markAsUsed(id: number): Promise<void>;

  /** Révoque une invitation (status → revoked) */
  revoke(id: number): Promise<void>;

  /** Supprime les invitations expirées (pending uniquement) */
  deleteExpired(): Promise<void>;
}
