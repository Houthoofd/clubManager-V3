/**
 * MySQLAlertRepository
 * Implémentation MySQL du repository alerts (Infrastructure Layer)
 * Gère les opérations CRUD sur les tables alertes_types, alertes_utilisateurs, alertes_actions
 */

import { pool } from '@/core/database/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type {
  AlertTypeDto,
  AlertUserDto,
  AlertActionDto,
  AlertPriorite,
  AlertStatut,
  AlertActionType,
  CreateAlertTypeDto,
  UpdateAlertTypeDto,
  CreateUserAlertDto,
  CreateAlertActionDto,
} from '../../domain/types.js';

// ==================== DB ROW INTERFACES ====================

interface AlertTypeDbRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  priorite: AlertPriorite;
  actif: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface AlertUserDbRow extends RowDataPacket {
  id: number;
  user_id: number;
  alerte_type_id: number;
  statut: AlertStatut;
  donnees_contexte: unknown;
  date_detection: Date | string;
  date_resolution: Date | string | null;
  notes: string | null;
  resolu_par: number | null;
  // Colonnes de la jointure alertes_types (aliasées avec préfixe at_)
  at_id: number;
  at_code: string;
  at_nom: string;
  at_description: string | null;
  at_priorite: AlertPriorite;
  at_actif: number | boolean;
  at_created_at: Date | string;
  at_updated_at: Date | string;
}

interface AlertActionDbRow extends RowDataPacket {
  id: number;
  alerte_user_id: number;
  user_id: number | null;
  action_type: AlertActionType;
  description: string | null;
  created_at: Date | string;
}

// ─── SQL de sélection des alertes utilisateurs avec JOIN ─────────────────────
const SELECT_ALERT_USER = `
  SELECT
    au.id, au.user_id, au.alerte_type_id, au.statut, au.donnees_contexte,
    au.date_detection, au.date_resolution, au.notes, au.resolu_par,
    at.id AS at_id, at.code AS at_code, at.nom AS at_nom,
    at.description AS at_description, at.priorite AS at_priorite,
    at.actif AS at_actif, at.created_at AS at_created_at, at.updated_at AS at_updated_at
  FROM alertes_utilisateurs au
  JOIN alertes_types at ON au.alerte_type_id = at.id
`;

// ==================== REPOSITORY ====================

export class MySQLAlertRepository implements IAlertRepository {
  // ─── Types d'alertes ───────────────────────────────────────────────────────

  /**
   * Retourne tous les types d'alertes, triés par nom
   * Filtre optionnel sur actif = TRUE
   */
  async findAllAlertTypes(onlyActive?: boolean): Promise<AlertTypeDto[]> {
    const sql = onlyActive
      ? `SELECT * FROM alertes_types WHERE actif = TRUE ORDER BY nom ASC`
      : `SELECT * FROM alertes_types ORDER BY nom ASC`;

    const [rows] = await pool.query<AlertTypeDbRow[]>(sql);
    return rows.map((row) => this.mapAlertTypeRow(row));
  }

  /**
   * Retourne un type d'alerte par son identifiant
   * Retourne null si non trouvé
   */
  async findAlertTypeById(id: number): Promise<AlertTypeDto | null> {
    const [rows] = await pool.query<AlertTypeDbRow[]>(
      `SELECT * FROM alertes_types WHERE id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? this.mapAlertTypeRow(row) : null;
  }

  /**
   * Retourne un type d'alerte par son code
   * Retourne null si non trouvé
   */
  async findAlertTypeByCode(code: string): Promise<AlertTypeDto | null> {
    const [rows] = await pool.query<AlertTypeDbRow[]>(
      `SELECT * FROM alertes_types WHERE code = ? LIMIT 1`,
      [code],
    );
    const row = rows[0];
    return row ? this.mapAlertTypeRow(row) : null;
  }

  /**
   * Crée un nouveau type d'alerte et retourne l'objet complet créé
   */
  async createAlertType(data: CreateAlertTypeDto): Promise<AlertTypeDto> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO alertes_types (code, nom, description, priorite, actif) VALUES (?, ?, ?, ?, ?)`,
      [data.code, data.nom, data.description ?? null, data.priorite ?? 'normale', data.actif ?? true],
    );

    const created = await this.findAlertTypeById(result.insertId);
    if (!created) {
      throw new Error(
        `Échec de la récupération du type d'alerte après insertion (id: ${result.insertId})`,
      );
    }
    return created;
  }

  /**
   * Met à jour un type d'alerte et retourne l'objet mis à jour
   * Construit la requête dynamiquement selon les champs fournis
   */
  async updateAlertType(id: number, data: UpdateAlertTypeDto): Promise<AlertTypeDto> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.nom !== undefined) {
      updates.push('nom = ?');
      params.push(data.nom);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.priorite !== undefined) {
      updates.push('priorite = ?');
      params.push(data.priorite);
    }
    if (data.actif !== undefined) {
      updates.push('actif = ?');
      params.push(data.actif);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query<ResultSetHeader>(
        `UPDATE alertes_types SET ${updates.join(', ')} WHERE id = ?`,
        params,
      );
    }

    const updated = await this.findAlertTypeById(id);
    if (!updated) {
      throw new Error(`Type d'alerte introuvable après mise à jour (id: ${id})`);
    }
    return updated;
  }

  /**
   * Supprime un type d'alerte
   * Retourne true si une ligne a été supprimée
   */
  async deleteAlertType(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM alertes_types WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  // ─── Alertes utilisateurs ──────────────────────────────────────────────────

  /**
   * Retourne les alertes d'un utilisateur avec le type d'alerte joint
   * Filtre optionnel sur le statut
   */
  async findUserAlerts(userId: number, statut?: AlertStatut): Promise<AlertUserDto[]> {
    const conditions = ['au.user_id = ?'];
    const params: unknown[] = [userId];

    if (statut !== undefined) {
      conditions.push('au.statut = ?');
      params.push(statut);
    }

    const sql = `${SELECT_ALERT_USER} WHERE ${conditions.join(' AND ')} ORDER BY au.date_detection DESC`;

    const [rows] = await pool.query<AlertUserDbRow[]>(sql, params);
    return rows.map((row) => this.mapAlertUserRow(row));
  }

  /**
   * Retourne toutes les alertes avec filtres optionnels (vue admin)
   * Filtre sur priorité, statut et/ou userId
   */
  async findAllActiveAlerts(filters?: {
    priorite?: AlertPriorite;
    statut?: AlertStatut;
    userId?: number;
  }): Promise<AlertUserDto[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.priorite !== undefined) {
      conditions.push('at.priorite = ?');
      params.push(filters.priorite);
    }
    if (filters?.statut !== undefined) {
      conditions.push('au.statut = ?');
      params.push(filters.statut);
    }
    if (filters?.userId !== undefined) {
      conditions.push('au.user_id = ?');
      params.push(filters.userId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `${SELECT_ALERT_USER} ${whereClause} ORDER BY au.date_detection DESC`;

    const [rows] = await pool.query<AlertUserDbRow[]>(sql, params);
    return rows.map((row) => this.mapAlertUserRow(row));
  }

  /**
   * Crée une alerte pour un utilisateur et retourne l'objet complet créé
   * donnees_contexte est sérialisé en JSON pour le stockage
   */
  async createUserAlert(data: CreateUserAlertDto): Promise<AlertUserDto> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO alertes_utilisateurs (user_id, alerte_type_id, donnees_contexte, notes) VALUES (?, ?, ?, ?)`,
      [
        data.user_id,
        data.alerte_type_id,
        data.donnees_contexte ? JSON.stringify(data.donnees_contexte) : null,
        data.notes ?? null,
      ],
    );

    const created = await this.findAlertById(result.insertId);
    if (!created) {
      throw new Error(
        `Échec de la récupération de l'alerte après insertion (id: ${result.insertId})`,
      );
    }
    return created;
  }

  /**
   * Résout une alerte : statut → resolue, date_resolution = NOW(), resolu_par = resolvedBy
   * Retourne l'alerte mise à jour
   */
  async resolveAlert(id: number, resolvedBy: number, notes?: string): Promise<AlertUserDto> {
    await pool.query<ResultSetHeader>(
      `UPDATE alertes_utilisateurs
       SET statut = 'resolue', date_resolution = NOW(), resolu_par = ?, notes = ?
       WHERE id = ?`,
      [resolvedBy, notes ?? null, id],
    );

    const alert = await this.findAlertById(id);
    if (!alert) {
      throw new Error(`Alerte introuvable après résolution (id: ${id})`);
    }
    return alert;
  }

  /**
   * Ignore une alerte : statut → ignoree
   * Retourne l'alerte mise à jour
   */
  async ignoreAlert(id: number): Promise<AlertUserDto> {
    await pool.query<ResultSetHeader>(
      `UPDATE alertes_utilisateurs SET statut = 'ignoree' WHERE id = ?`,
      [id],
    );

    const alert = await this.findAlertById(id);
    if (!alert) {
      throw new Error(`Alerte introuvable après mise à jour (id: ${id})`);
    }
    return alert;
  }

  // ─── Actions sur alertes ───────────────────────────────────────────────────

  /**
   * Retourne les actions d'une alerte utilisateur, triées par date décroissante
   */
  async findAlertActions(alerteUserId: number): Promise<AlertActionDto[]> {
    const [rows] = await pool.query<AlertActionDbRow[]>(
      `SELECT * FROM alertes_actions WHERE alerte_user_id = ? ORDER BY created_at DESC`,
      [alerteUserId],
    );
    return rows.map((row) => this.mapAlertActionRow(row));
  }

  /**
   * Ajoute une action à une alerte et retourne l'objet complet créé
   */
  async addAlertAction(data: CreateAlertActionDto): Promise<AlertActionDto> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO alertes_actions (alerte_user_id, user_id, action_type, description) VALUES (?, ?, ?, ?)`,
      [data.alerte_user_id, data.user_id ?? null, data.action_type, data.description ?? null],
    );

    const [rows] = await pool.query<AlertActionDbRow[]>(
      `SELECT * FROM alertes_actions WHERE id = ? LIMIT 1`,
      [result.insertId],
    );
    const row = rows[0];
    if (!row) {
      throw new Error(
        `Échec de la récupération de l'action après insertion (id: ${result.insertId})`,
      );
    }
    return this.mapAlertActionRow(row);
  }

  // ==================== MÉTHODES PRIVÉES ====================

  /**
   * Récupère une alerte utilisateur par son id (méthode interne)
   * Utilisée après UPDATE pour retourner l'objet à jour
   */
  private async findAlertById(id: number): Promise<AlertUserDto | null> {
    const sql = `${SELECT_ALERT_USER} WHERE au.id = ? LIMIT 1`;
    const [rows] = await pool.query<AlertUserDbRow[]>(sql, [id]);
    const row = rows[0];
    return row ? this.mapAlertUserRow(row) : null;
  }

  /**
   * Convertit une row MySQL alertes_types en AlertTypeDto
   * - actif : MySQL BOOLEAN retourne 0/1, on force en boolean
   * - created_at / updated_at : convertis en ISO string
   */
  private mapAlertTypeRow(row: AlertTypeDbRow): AlertTypeDto {
    return {
      id: row.id,
      code: row.code,
      nom: row.nom,
      description: row.description,
      priorite: row.priorite,
      actif: Boolean(row.actif),
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at).toISOString(),
      updated_at:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date(row.updated_at).toISOString(),
    };
  }

  /**
   * Convertit une row MySQL alertes_utilisateurs (avec JOIN) en AlertUserDto
   * - donnees_contexte : JSON.parse si string, cast direct si déjà objet
   * - dates : converties en ISO string
   * - alerte_type : construit depuis les colonnes aliasées at_*
   */
  private mapAlertUserRow(row: AlertUserDbRow): AlertUserDto {
    return {
      id: row.id,
      user_id: row.user_id,
      alerte_type_id: row.alerte_type_id,
      alerte_type: {
        id: row.at_id,
        code: row.at_code,
        nom: row.at_nom,
        description: row.at_description,
        priorite: row.at_priorite,
        actif: Boolean(row.at_actif),
        created_at:
          row.at_created_at instanceof Date
            ? row.at_created_at.toISOString()
            : new Date(row.at_created_at).toISOString(),
        updated_at:
          row.at_updated_at instanceof Date
            ? row.at_updated_at.toISOString()
            : new Date(row.at_updated_at).toISOString(),
      },
      statut: row.statut,
      donnees_contexte: this.parseContexte(row.donnees_contexte),
      date_detection:
        row.date_detection instanceof Date
          ? row.date_detection.toISOString()
          : new Date(row.date_detection).toISOString(),
      date_resolution:
        row.date_resolution === null
          ? null
          : row.date_resolution instanceof Date
            ? row.date_resolution.toISOString()
            : new Date(row.date_resolution).toISOString(),
      notes: row.notes,
      resolu_par: row.resolu_par,
    };
  }

  /**
   * Convertit une row MySQL alertes_actions en AlertActionDto
   */
  private mapAlertActionRow(row: AlertActionDbRow): AlertActionDto {
    return {
      id: row.id,
      alerte_user_id: row.alerte_user_id,
      user_id: row.user_id,
      action_type: row.action_type,
      description: row.description,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at).toISOString(),
    };
  }

  /**
   * Parse le champ JSON donnees_contexte
   * MySQL2 peut retourner la valeur déjà parsée (objet) ou en string selon la version
   */
  private parseContexte(value: unknown): Record<string, unknown> | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object') return value as Record<string, unknown>;
    if (typeof value === 'string') {
      return JSON.parse(value) as Record<string, unknown>;
    }
    return null;
  }
}
