/**
 * Alerts Domain Types
 * Définitions de types locaux pour le module alerts
 */

export type AlertPriorite = 'basse' | 'normale' | 'haute' | 'critique';
export type AlertStatut = 'active' | 'resolue' | 'ignoree';
export type AlertActionType =
  | 'message_envoye'
  | 'information_mise_a_jour'
  | 'paiement_recu'
  | 'statut_change'
  | 'autre';

// ─── DTOs de lecture ─────────────────────────────────────────────────────────

/** Représentation d'un type d'alerte */
export interface AlertTypeDto {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  priorite: AlertPriorite;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

/** Représentation d'une alerte utilisateur */
export interface AlertUserDto {
  id: number;
  user_id: number;
  alerte_type_id: number;
  alerte_type?: AlertTypeDto;
  statut: AlertStatut;
  donnees_contexte: Record<string, unknown> | null;
  date_detection: string;
  date_resolution: string | null;
  notes: string | null;
  resolu_par: number | null;
}

/** Représentation d'une action sur une alerte */
export interface AlertActionDto {
  id: number;
  alerte_user_id: number;
  user_id: number | null;
  action_type: AlertActionType;
  description: string | null;
  created_at: string;
}

// ─── DTOs de création / modification ─────────────────────────────────────────

/** DTO pour créer un type d'alerte */
export interface CreateAlertTypeDto {
  code: string;
  nom: string;
  description?: string;
  priorite?: AlertPriorite;
  actif?: boolean;
}

/** DTO pour modifier un type d'alerte */
export interface UpdateAlertTypeDto {
  nom?: string;
  description?: string;
  priorite?: AlertPriorite;
  actif?: boolean;
}

/** DTO pour créer une alerte utilisateur */
export interface CreateUserAlertDto {
  user_id: number;
  alerte_type_id: number;
  donnees_contexte?: Record<string, unknown>;
  notes?: string;
}

/** DTO pour résoudre une alerte */
export interface ResolveAlertDto {
  alerte_id: number;
  resolu_par: number;
  notes?: string;
}

/** DTO pour ajouter une action à une alerte */
export interface CreateAlertActionDto {
  alerte_user_id: number;
  user_id?: number;
  action_type: AlertActionType;
  description?: string;
}
