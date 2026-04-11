/**
 * MySQLPaymentScheduleRepository
 * Implémentation MySQL du repository échéances de paiement (Infrastructure Layer)
 * Gère les opérations sur la table echeances_paiements avec JOINs vers utilisateurs
 * et plans_tarifaires, et calcul SQL du nombre de jours de retard via DATEDIFF
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  IPaymentScheduleRepository,
  ScheduleRow,
  CreateScheduleInput,
  ScheduleQuery,
  PaginatedSchedules,
} from "../../domain/repositories/IPaymentScheduleRepository.js";

// ==================== DB ROW INTERFACE ====================

interface ScheduleDbRow extends RowDataPacket {
  id: number;
  user_id: number;
  plan_tarifaire_id: number | null;
  montant: string; // DECIMAL retourné en string par MySQL
  date_echeance: Date;
  statut: "en_attente" | "paye" | "en_retard" | "annule";
  paiement_id: number | null;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs
  user_first_name: string | null;
  user_last_name: string | null;
  user_email: string | null;
  plan_nom: string | null;
  // Calculé par DATEDIFF côté SQL, null si pas en retard
  jours_retard: number | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== BASE SELECT ====================

const BASE_SELECT = `
  SELECT
    e.id,
    e.user_id,
    e.plan_tarifaire_id,
    e.montant,
    e.date_echeance,
    e.statut,
    e.paiement_id,
    e.created_at,
    e.updated_at,
    u.first_name  AS user_first_name,
    u.last_name   AS user_last_name,
    u.email       AS user_email,
    pt.nom        AS plan_nom,
    CASE
      WHEN e.statut IN ('en_attente', 'en_retard') AND e.date_echeance < CURDATE()
        THEN DATEDIFF(CURDATE(), e.date_echeance)
      ELSE NULL
    END AS jours_retard
  FROM echeances_paiements e
  LEFT JOIN utilisateurs     u  ON u.id  = e.user_id
  LEFT JOIN plans_tarifaires pt ON pt.id = e.plan_tarifaire_id
`;

// ==================== REPOSITORY ====================

export class MySQLPaymentScheduleRepository
  implements IPaymentScheduleRepository
{
  /**
   * Récupère la liste paginée des échéances avec filtres dynamiques
   * Supporte les filtres par user_id, statut, et le mode overdue (échéances en retard)
   */
  async findAll(query: ScheduleQuery): Promise<PaginatedSchedules> {
    const { user_id, statut, overdue, page = 1, limit = 20 } = query;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (user_id !== undefined) {
      conditions.push("e.user_id = ?");
      params.push(user_id);
    }
    if (statut) {
      conditions.push("e.statut = ?");
      params.push(statut);
    }
    if (overdue) {
      // Filtre les échéances dont la date est dépassée et le statut non terminal
      conditions.push(
        "e.date_echeance < CURDATE() AND e.statut IN ('en_attente', 'en_retard')",
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM echeances_paiements e ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    // Requête de données avec JOINs, calcul jours_retard et pagination
    const [rows] = await pool.query<ScheduleDbRow[]>(
      `${BASE_SELECT} ${whereClause} ORDER BY e.date_echeance ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      schedules: rows.map((row) => this.mapRow(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère une échéance par son ID avec les informations enrichies via JOINs
   */
  async findById(id: number): Promise<ScheduleRow | null> {
    const [rows] = await pool.query<ScheduleDbRow[]>(
      `${BASE_SELECT} WHERE e.id = ? LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Récupère toutes les échéances d'un utilisateur, triées par date d'échéance croissante
   */
  async findByUserId(userId: number): Promise<ScheduleRow[]> {
    const [rows] = await pool.query<ScheduleDbRow[]>(
      `${BASE_SELECT} WHERE e.user_id = ? ORDER BY e.date_echeance ASC`,
      [userId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Récupère toutes les échéances en retard (date dépassée, statut 'en_attente')
   * Triées par date d'échéance croissante pour traiter les plus anciennes en premier
   */
  async findOverdue(): Promise<ScheduleRow[]> {
    const [rows] = await pool.query<ScheduleDbRow[]>(
      `${BASE_SELECT}
       WHERE e.date_echeance < CURDATE()
         AND e.statut IN ('en_attente')
       ORDER BY e.date_echeance ASC`,
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Marque une échéance comme payée et lui associe l'ID du paiement
   */
  async markAsPaid(id: number, paiementId: number): Promise<void> {
    await pool.query(
      `UPDATE echeances_paiements
       SET statut = 'paye', paiement_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [paiementId, id],
    );
  }

  /**
   * Met à jour le statut d'une échéance
   */
  async updateStatut(id: number, statut: string): Promise<void> {
    await pool.query(
      "UPDATE echeances_paiements SET statut = ?, updated_at = NOW() WHERE id = ?",
      [statut, id],
    );
  }

  /**
   * Crée une nouvelle échéance et retourne l'ID généré
   */
  async create(data: CreateScheduleInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO echeances_paiements
         (user_id, plan_tarifaire_id, montant, date_echeance, statut, paiement_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.plan_tarifaire_id ?? null,
        data.montant,
        data.date_echeance,
        data.statut ?? "en_attente",
        data.paiement_id ?? null,
      ],
    );

    return result.insertId;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet ScheduleRow typé
   * Cast DECIMAL (string) → number pour le montant
   * Cast DATEDIFF résultat → number | undefined pour jours_retard
   */
  private mapRow(row: ScheduleDbRow): ScheduleRow {
    return {
      id: row.id,
      user_id: row.user_id,
      plan_tarifaire_id: row.plan_tarifaire_id,
      montant: Number(row.montant),
      date_echeance: new Date(row.date_echeance),
      statut: row.statut,
      paiement_id: row.paiement_id,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      user_first_name: row.user_first_name ?? undefined,
      user_last_name: row.user_last_name ?? undefined,
      user_email: row.user_email ?? undefined,
      plan_nom: row.plan_nom ?? undefined,
      jours_retard: row.jours_retard ?? undefined,
    };
  }
}
