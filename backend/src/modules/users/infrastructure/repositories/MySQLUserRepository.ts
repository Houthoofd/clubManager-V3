/**
 * MySQLUserRepository
 * Implémentation MySQL du repository users (Infrastructure Layer)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket } from "mysql2/promise";
import type { User } from "@clubmanager/types";
import { UserRole } from "@clubmanager/types";
import type {
  GetUsersQueryDto,
  PaginatedUsersResponseDto,
  UserListItemDto,
} from "@clubmanager/types";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

// ==================== ROW INTERFACES ====================

interface UserRow extends RowDataPacket {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string | null;
  email: string | null;
  password: string | null;
  date_of_birth: Date;
  telephone?: string | null;
  adresse?: string | null;
  genre_id: number;
  grade_id?: number | null;
  abonnement_id?: number | null;
  tuteur_id?: number | null;
  status_id: number;
  active: boolean;
  email_verified: boolean;
  est_mineur: boolean;
  peut_se_connecter: boolean;
  role_app: string;
  photo_url?: string | null;
  deleted_at?: Date | null;
  deleted_by?: number | null;
  deletion_reason?: string | null;
  anonymized: boolean;
  date_inscription: Date;
  derniere_connexion?: Date | null;
  created_at: Date;
  updated_at?: Date | null;
}

interface UserListRow extends RowDataPacket {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string | null;
  email: string | null;
  email_verified: boolean;
  active: boolean;
  status_id: number;
  role_app: string | null;
  date_inscription: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== REPOSITORY ====================

export class MySQLUserRepository implements IUserRepository {
  /**
   * Récupère la liste paginée des utilisateurs avec filtres dynamiques
   */
  async findAll(query: GetUsersQueryDto): Promise<PaginatedUsersResponseDto> {
    const { search, role_app, status_id, page = 1, limit = 20 } = query;

    // Construction dynamique des conditions WHERE
    const conditions: string[] = [
      "u.deleted_at IS NULL",
      "u.anonymized = FALSE",
    ];
    const params: (string | number)[] = [];

    if (search) {
      const like = `%${search}%`;
      conditions.push(
        "(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.userId LIKE ?)",
      );
      params.push(like, like, like, like);
    }

    if (role_app) {
      conditions.push("u.role_app = ?");
      params.push(role_app);
    }

    if (status_id !== undefined) {
      conditions.push("u.status_id = ?");
      params.push(status_id);
    }

    const whereClause = conditions.join(" AND ");

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM utilisateurs u
       LEFT JOIN genres g  ON g.id  = u.genre_id
       LEFT JOIN grades gr ON gr.id = u.grade_id
       LEFT JOIN status s  ON s.id  = u.status_id
       WHERE ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;

    // Requête de données avec pagination LIMIT / OFFSET
    const offset = (page - 1) * limit;
    const dataParams: (string | number)[] = [...params, limit, offset];

    const [rows] = await pool.query<UserListRow[]>(
      `SELECT
         u.id,
         u.userId,
         u.first_name,
         u.last_name,
         u.nom_utilisateur,
         u.email,
         u.email_verified,
         u.active,
         u.status_id,
         u.role_app,
         u.date_inscription
       FROM utilisateurs u
       LEFT JOIN genres g  ON g.id  = u.genre_id
       LEFT JOIN grades gr ON gr.id = u.grade_id
       LEFT JOIN status s  ON s.id  = u.status_id
       WHERE ${whereClause}
       ORDER BY u.date_inscription DESC
       LIMIT ? OFFSET ?`,
      dataParams,
    );

    const users: UserListItemDto[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      first_name: row.first_name,
      last_name: row.last_name,
      nom_utilisateur: row.nom_utilisateur ?? "",
      email: row.email ?? "",
      email_verified: Boolean(row.email_verified),
      active: Boolean(row.active),
      status_id: row.status_id,
      role_app: row.role_app ?? undefined,
      date_inscription: new Date(row.date_inscription).toISOString(),
    }));

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Trouve un utilisateur par son ID numérique (clé primaire)
   * Inclut les utilisateurs supprimés (deleted_at IS NOT NULL) pour
   * permettre les vérifications de doublon et la restauration
   */
  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT * FROM utilisateurs
       WHERE id = ? AND anonymized = FALSE
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(rows[0]!);
  }

  /**
   * Met à jour le rôle applicatif d'un utilisateur
   */
  async updateRole(id: number, role_app: string): Promise<void> {
    await pool.query(
      "UPDATE utilisateurs SET role_app = ?, updated_at = NOW() WHERE id = ?",
      [role_app, id],
    );
  }

  /**
   * Met à jour le statut d'un utilisateur
   */
  async updateStatus(id: number, status_id: number): Promise<void> {
    await pool.query(
      "UPDATE utilisateurs SET status_id = ?, updated_at = NOW() WHERE id = ?",
      [status_id, id],
    );
  }

  /**
   * Suppression logique (soft delete) d'un utilisateur
   */
  async softDelete(
    id: number,
    deletedBy: number,
    reason: string,
  ): Promise<void> {
    await pool.query(
      `UPDATE utilisateurs
       SET deleted_at = NOW(), deleted_by = ?, deletion_reason = ?, active = FALSE, updated_at = NOW()
       WHERE id = ?`,
      [deletedBy, reason, id],
    );
  }

  /**
   * Restaure un utilisateur précédemment supprimé
   */
  async restore(id: number): Promise<void> {
    await pool.query(
      `UPDATE utilisateurs
       SET deleted_at = NULL, deleted_by = NULL, deletion_reason = NULL, active = TRUE, updated_at = NOW()
       WHERE id = ?`,
      [id],
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL en objet User complet
   * Suit le même pattern que MySQLAuthRepository.mapRowToUser
   */
  private mapRowToUser(row: UserRow): User {
    return {
      id: row.id,
      userId: row.userId,
      first_name: row.first_name,
      last_name: row.last_name,
      nom_utilisateur: row.nom_utilisateur ?? "",
      email: row.email ?? "",
      password: row.password ?? "",
      date_of_birth: new Date(row.date_of_birth),
      telephone: row.telephone ?? undefined,
      adresse: row.adresse ?? undefined,
      genre_id: row.genre_id,
      grade_id: row.grade_id ?? undefined,
      abonnement_id: row.abonnement_id ?? undefined,
      tuteur_id: row.tuteur_id ?? null,
      status_id: row.status_id,
      active: Boolean(row.active),
      email_verified: Boolean(row.email_verified),
      est_mineur: Boolean(row.est_mineur),
      peut_se_connecter: Boolean(row.peut_se_connecter),
      role_app: (row.role_app as UserRole) ?? UserRole.MEMBER,
      photo_url: row.photo_url ?? undefined,
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
      deleted_by: row.deleted_by ?? null,
      deletion_reason: row.deletion_reason ?? null,
      anonymized: Boolean(row.anonymized),
      date_inscription: new Date(row.date_inscription),
      derniere_connexion: row.derniere_connexion
        ? new Date(row.derniere_connexion)
        : null,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : null,
    };
  }
}
