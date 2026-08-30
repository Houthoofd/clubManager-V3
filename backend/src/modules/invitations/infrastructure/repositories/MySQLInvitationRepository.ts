/**
 * MySQLInvitationRepository
 * Implémentation MySQL du repository d'invitations (Infrastructure Layer)
 * Gère les opérations sur la table invitations
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { IInvitationRepository } from "../../domain/repositories/IInvitationRepository.js";
import type {
  Invitation,
  CreateInvitationDto,
  InvitationStatus,
} from "../../domain/types.js";

// ==================== DB ROW INTERFACE ====================

interface InvitationRow extends RowDataPacket {
  id: number;
  email: string;
  invited_by: number;
  invited_by_name: string | null;
  status: InvitationStatus;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== REPOSITORY ====================

export class MySQLInvitationRepository implements IInvitationRepository {
  /**
   * Crée une nouvelle invitation et retourne la ligne insérée avec JOIN utilisateurs
   */
  async create(
    dto: CreateInvitationDto & { token_hash: string; expires_at: Date },
  ): Promise<Invitation> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO invitations (email, invited_by, token_hash, expires_at, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [dto.email, dto.invited_by, dto.token_hash, dto.expires_at],
    );

    const [rows] = await pool.execute<InvitationRow[]>(
      `SELECT i.id, i.email, i.invited_by,
              CONCAT(u.first_name, ' ', u.last_name) AS invited_by_name,
              i.status, i.expires_at, i.used_at, i.created_at
       FROM invitations i
       LEFT JOIN utilisateurs u ON u.id = i.invited_by
       WHERE i.id = ?
       LIMIT 1`,
      [result.insertId],
    );

    const row = rows[0];
    if (!row) throw new Error("Failed to retrieve created invitation");
    return this.mapRow(row);
  }

  /**
   * Retourne une invitation par son token hashé (toutes statuts confondus)
   */
  async findByTokenHash(tokenHash: string): Promise<Invitation | null> {
    const [rows] = await pool.execute<InvitationRow[]>(
      `SELECT i.id, i.email, i.invited_by,
              CONCAT(u.first_name, ' ', u.last_name) AS invited_by_name,
              i.status, i.expires_at, i.used_at, i.created_at
       FROM invitations i
       LEFT JOIN utilisateurs u ON u.id = i.invited_by
       WHERE i.token_hash = ?
       LIMIT 1`,
      [tokenHash],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Retourne une invitation pending non expirée pour l'email donné
   */
  async findByEmail(email: string): Promise<Invitation | null> {
    const [rows] = await pool.execute<InvitationRow[]>(
      `SELECT i.id, i.email, i.invited_by,
              CONCAT(u.first_name, ' ', u.last_name) AS invited_by_name,
              i.status, i.expires_at, i.used_at, i.created_at
       FROM invitations i
       LEFT JOIN utilisateurs u ON u.id = i.invited_by
       WHERE i.email = ? AND i.status = 'pending' AND i.expires_at > NOW()
       LIMIT 1`,
      [email],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Retourne une invitation par son ID (toutes statuts confondus)
   */
  async findById(id: number): Promise<Invitation | null> {
    const [rows] = await pool.execute<InvitationRow[]>(
      `SELECT i.id, i.email, i.invited_by,
              CONCAT(u.first_name, ' ', u.last_name) AS invited_by_name,
              i.status, i.expires_at, i.used_at, i.created_at
       FROM invitations i
       LEFT JOIN utilisateurs u ON u.id = i.invited_by
       WHERE i.id = ?
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Retourne la liste paginée de toutes les invitations, ordonnées par date décroissante
   */
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Invitation[]; total: number }> {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) AS total FROM invitations`,
      [],
    );
    const total = countRows[0]?.total ?? 0;

    const [rows] = await pool.execute<InvitationRow[]>(
      `SELECT i.id, i.email, i.invited_by,
              CONCAT(u.first_name, ' ', u.last_name) AS invited_by_name,
              i.status, i.expires_at, i.used_at, i.created_at
       FROM invitations i
       LEFT JOIN utilisateurs u ON u.id = i.invited_by
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return {
      data: rows.map((row) => this.mapRow(row)),
      total,
    };
  }

  /**
   * Marque une invitation comme utilisée : status → accepted, used_at = now
   */
  async markAsUsed(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>(
      `UPDATE invitations SET status = 'accepted', used_at = NOW() WHERE id = ?`,
      [id],
    );
  }

  /**
   * Révoque une invitation : status → revoked
   */
  async revoke(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>(
      `UPDATE invitations SET status = 'revoked' WHERE id = ?`,
      [id],
    );
  }

  /**
   * Supprime les invitations pending expirées (nettoyage)
   */
  async deleteExpired(): Promise<void> {
    await pool.execute<ResultSetHeader>(
      `DELETE FROM invitations WHERE expires_at < NOW() AND status = 'pending'`,
      [],
    );
  }

  // ==================== HELPER METHODS ====================

  private mapRow(row: InvitationRow): Invitation {
    return {
      id: row.id,
      email: row.email,
      invited_by: row.invited_by,
      invited_by_name: row.invited_by_name ?? undefined,
      status: row.status,
      expires_at: new Date(row.expires_at),
      used_at: row.used_at ? new Date(row.used_at) : null,
      created_at: new Date(row.created_at),
    };
  }
}
