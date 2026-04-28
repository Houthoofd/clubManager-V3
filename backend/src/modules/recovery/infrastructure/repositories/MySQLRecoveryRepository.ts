/**
 * MySQLRecoveryRepository
 * Implémentation MySQL du repository de demandes de récupération manuelle (Infrastructure Layer)
 * Gère les opérations sur la table manual_recovery_requests
 * Convertit les dates MySQL en ISO strings pour le domaine
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { IRecoveryRepository } from "../../domain/repositories/IRecoveryRepository.js";
import type {
  RecoveryRequest,
  RecoveryStatus,
  GetRecoveryRequestsQuery,
  PaginatedRecoveryResponse,
} from "../../domain/types.js";

// ==================== DB ROW INTERFACE ====================

interface RecoveryDbRow extends RowDataPacket {
  id: number;
  email: string;
  reason: string | null;
  ip_address: string;
  status: RecoveryStatus;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== REPOSITORY ====================

export class MySQLRecoveryRepository implements IRecoveryRepository {
  /**
   * Récupère la liste paginée des demandes de récupération
   * Filtre dynamiquement sur le statut si fourni
   * Ordonne par date de création décroissante
   */
  async findAll(query: GetRecoveryRequestsQuery): Promise<PaginatedRecoveryResponse> {
    const { status, page = 1, limit = 20 } = query;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status !== undefined) {
      conditions.push("status = ?");
      params.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM manual_recovery_requests ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    // Requête de données paginée
    const [rows] = await pool.query<RecoveryDbRow[]>(
      `SELECT id, email, reason, ip_address, status, created_at
       FROM manual_recovery_requests
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      requests: rows.map((row) => this.mapRow(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère une demande de récupération par son ID
   * Retourne null si la demande n'existe pas
   */
  async findById(id: number): Promise<RecoveryRequest | null> {
    const [rows] = await pool.query<RecoveryDbRow[]>(
      `SELECT id, email, reason, ip_address, status, created_at
       FROM manual_recovery_requests
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Met à jour le statut d'une demande de récupération
   * Statut possible : 'approved' ou 'rejected'
   */
  async updateStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE manual_recovery_requests
       SET status = ?
       WHERE id = ?`,
      [status, id],
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet RecoveryRequest typé
   * Cast created_at (Date MySQL) → ISO string
   */
  private mapRow(row: RecoveryDbRow): RecoveryRequest {
    return {
      id: row.id,
      email: row.email,
      reason: row.reason,
      ip_address: row.ip_address,
      status: row.status,
      created_at: new Date(row.created_at).toISOString(),
    };
  }
}
