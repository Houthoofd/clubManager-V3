/**
 * IAlertRepository
 * Interface du repository alerts (Domain Layer)
 * Contrat pour les opérations sur les alertes en base de données
 */

import type {
  AlertTypeDto,
  AlertUserDto,
  AlertActionDto,
  AlertStatut,
  AlertPriorite,
  CreateAlertTypeDto,
  UpdateAlertTypeDto,
  CreateUserAlertDto,
  CreateAlertActionDto,
} from '../types.js';

export interface IAlertRepository {
  // ─── Types d'alertes ───────────────────────────────────────────────────────

  /** Retourne tous les types d'alertes, avec filtre optionnel sur actifs uniquement */
  findAllAlertTypes(onlyActive?: boolean): Promise<AlertTypeDto[]>;

  /** Retourne un type d'alerte par son identifiant */
  findAlertTypeById(id: number): Promise<AlertTypeDto | null>;

  /** Retourne un type d'alerte par son code */
  findAlertTypeByCode(code: string): Promise<AlertTypeDto | null>;

  /** Crée un nouveau type d'alerte */
  createAlertType(data: CreateAlertTypeDto): Promise<AlertTypeDto>;

  /** Met à jour un type d'alerte existant */
  updateAlertType(id: number, data: UpdateAlertTypeDto): Promise<AlertTypeDto>;

  /** Supprime un type d'alerte, retourne true si supprimé */
  deleteAlertType(id: number): Promise<boolean>;

  // ─── Alertes utilisateurs ──────────────────────────────────────────────────

  /** Retourne les alertes d'un utilisateur, avec filtre optionnel sur le statut */
  findUserAlerts(userId: number, statut?: AlertStatut): Promise<AlertUserDto[]>;

  /** Retourne toutes les alertes avec filtres optionnels (vue admin) */
  findAllActiveAlerts(filters?: {
    priorite?: AlertPriorite;
    statut?: AlertStatut;
    userId?: number;
  }): Promise<AlertUserDto[]>;

  /** Crée une alerte pour un utilisateur */
  createUserAlert(data: CreateUserAlertDto): Promise<AlertUserDto>;

  /** Résout une alerte */
  resolveAlert(id: number, resolvedBy: number, notes?: string): Promise<AlertUserDto>;

  /** Ignore une alerte */
  ignoreAlert(id: number): Promise<AlertUserDto>;

  // ─── Actions sur alertes ───────────────────────────────────────────────────

  /** Retourne les actions d'une alerte utilisateur */
  findAlertActions(alerteUserId: number): Promise<AlertActionDto[]>;

  /** Ajoute une action à une alerte utilisateur */
  addAlertAction(data: CreateAlertActionDto): Promise<AlertActionDto>;
}
