/**
 * MySQLReservationRepository
 * Implémentation MySQL du repository réservations (Infrastructure Layer)
 * Gère la création, la récupération et la mise à jour des réservations
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { IReservationRepository } from "../../domain/repositories/IReservationRepository.js";
import type {
  ReservationDto,
  CreateReservationDto,
  ReservationStatut,
  GetReservationsQuery,
  PaginatedReservationsResponse,
} from "../../domain/types.js";

// ==================== ROW INTERFACE ====================

interface ReservationRow extends RowDataPacket {
  id: number;
  user_id: number;
  cours_id: number;
  statut: ReservationStatut;
  created_at: Date | string;
  updated_at: Date | string;
  user_prenom: string | null;
  user_nom: string | null;
  user_email: string | null;
  date_cours: Date | string | null;
  type_cours: string | null;
  cours_heure_debut: string | null;
  cours_heure_fin: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface ActiveCountRow extends RowDataPacket {
  cnt: number;
}

// ==================== HELPERS ====================

/**
 * Convert a Date, string, or null to an ISO date string (YYYY-MM-DD)
 */
function toISODate(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  // Already a string — keep only the date part
  return String(value).split("T")[0];
}

/**
 * Convert a Date or string to a full ISO timestamp string
 */
function toISOTimestamp(value: Date | string | null | undefined): string {
  if (value == null) return new Date(0).toISOString();
  if (value instanceof Date) return value.toISOString();
  // MySQL may return a string like "2024-01-01 12:00:00"
  // Replace the space separator with T so the Date constructor parses it correctly
  return new Date(String(value).replace(" ", "T")).toISOString();
}

/**
 * Map a raw database row to a ReservationDto
 */
function mapRow(row: ReservationRow): ReservationDto {
  return {
    id: row.id,
    user_id: row.user_id,
    cours_id: row.cours_id,
    statut: row.statut,
    created_at: toISOTimestamp(row.created_at),
    updated_at: toISOTimestamp(row.updated_at),
    user_nom: row.user_nom ?? undefined,
    user_prenom: row.user_prenom ?? undefined,
    user_email: row.user_email ?? undefined,
    cours_date: toISODate(row.date_cours),
    cours_type: row.type_cours ?? undefined,
    cours_heure_debut: row.cours_heure_debut ?? undefined,
    cours_heure_fin: row.cours_heure_fin ?? undefined,
  };
}

// ==================== BASE SELECT ====================

const BASE_QUERY = `
  SELECT
    r.id,
    r.user_id,
    r.cours_id,
    r.statut,
    r.created_at,
    r.updated_at,
    u.first_name  AS user_prenom,
    u.last_name   AS user_nom,
    u.email       AS user_email,
    c.date_cours,
    c.type_cours,
    c.heure_debut AS cours_heure_debut,
    c.heure_fin   AS cours_heure_fin
  FROM reservations r
  JOIN utilisateurs u ON u.id = r.user_id
  JOIN cours c ON c.id = r.cours_id
`;

// ==================== REPOSITORY ====================

export class MySQLReservationRepository implements IReservationRepository {
  // ------------------------------------------------------------------
  // findAll
  // ------------------------------------------------------------------

  async findAll(query: GetReservationsQuery): Promise<PaginatedReservationsResponse> {
    const { cours_id, user_id, statut, page = 1, limit = 20 } = query;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (cours_id !== undefined) {
      conditions.push("r.cours_id = ?");
      params.push(cours_id);
    }
    if (user_id !== undefined) {
      conditions.push("r.user_id = ?");
      params.push(user_id);
    }
    if (statut !== undefined) {
      conditions.push("r.statut = ?");
      params.push(statut);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // --- COUNT ---
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM reservations r ${whereClause}`,
      params,
    );
    const total = countRows[0]?.total ?? 0;

    // --- DATA ---
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query<ReservationRow[]>(
      `${BASE_QUERY} ${whereClause} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset],
    );

    return {
      reservations: rows.map(mapRow),
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // ------------------------------------------------------------------
  // findById
  // ------------------------------------------------------------------

  async findById(id: number): Promise<ReservationDto | null> {
    const [rows] = await pool.query<ReservationRow[]>(
      `${BASE_QUERY} WHERE r.id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  // ------------------------------------------------------------------
  // findByUserAndCours
  // ------------------------------------------------------------------

  async findByUserAndCours(
    userId: number,
    coursId: number,
  ): Promise<ReservationDto | null> {
    const [rows] = await pool.query<ReservationRow[]>(
      `${BASE_QUERY} WHERE r.user_id = ? AND r.cours_id = ? LIMIT 1`,
      [userId, coursId],
    );
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  // ------------------------------------------------------------------
  // create
  // ------------------------------------------------------------------

  async create(data: CreateReservationDto): Promise<ReservationDto> {
    const statut: ReservationStatut = data.statut ?? "confirmee";

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO reservations (user_id, cours_id, statut) VALUES (?, ?, ?)`,
      [data.user_id, data.cours_id, statut],
    );

    const inserted = await this.findById(result.insertId);
    if (!inserted) {
      throw new Error("Erreur lors de la création de la réservation");
    }
    return inserted;
  }

  // ------------------------------------------------------------------
  // updateStatus
  // ------------------------------------------------------------------

  async updateStatus(id: number, statut: ReservationStatut): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE reservations SET statut = ?, updated_at = NOW() WHERE id = ?`,
      [statut, id],
    );
  }

  // ------------------------------------------------------------------
  // countActive
  // ------------------------------------------------------------------

  async countActive(coursId: number): Promise<number> {
    const [rows] = await pool.query<ActiveCountRow[]>(
      `SELECT COUNT(*) AS cnt FROM reservations WHERE cours_id = ? AND statut != 'annulee'`,
      [coursId],
    );
    return rows[0]?.cnt ?? 0;
  }
}
