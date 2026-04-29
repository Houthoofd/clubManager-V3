/**
 * MySQLGroupRepository
 * Implémentation MySQL du repository groups (Infrastructure Layer)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  Group,
  GroupMember,
  CreateGroupDto,
  UpdateGroupDto,
  AddMemberDto,
  RemoveMemberDto,
  GetGroupsQuery,
  PaginatedGroupsResponse,
} from "../../domain/types.js";
import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

// ==================== ROW INTERFACES ====================

interface GroupRow extends RowDataPacket {
  id: number;
  nom: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  membre_count: number;
}

interface GroupMemberRow extends RowDataPacket {
  id: number;
  groupe_id: number;
  user_id: number;
  created_at: Date;
  first_name: string;
  last_name: string;
  email: string;
  role_app: string | null;
  photo_url: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface MemberCountRow extends RowDataPacket {
  cnt: number;
}

// ==================== REPOSITORY ====================

export class MySQLGroupRepository implements IGroupRepository {
  /**
   * Retourne la liste paginée des groupes avec leur nombre de membres.
   * Filtre optionnel sur le nom (LIKE).
   */
  async findAll(query: GetGroupsQuery): Promise<PaginatedGroupsResponse> {
    const { search, page = 1, limit = 20 } = query;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push("g.nom LIKE ?");
      params.push(`%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // COUNT query for pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM groupes g
       ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;

    const offset = (page - 1) * limit;
    const dataParams: (string | number)[] = [...params, limit, offset];

    const [rows] = await pool.query<GroupRow[]>(
      `SELECT
         g.id,
         g.nom,
         g.description,
         g.created_at,
         g.updated_at,
         COUNT(gu.id) AS membre_count
       FROM groupes g
       LEFT JOIN groupes_utilisateurs gu ON gu.groupe_id = g.id
       ${whereClause}
       GROUP BY g.id
       ORDER BY g.nom ASC
       LIMIT ? OFFSET ?`,
      dataParams,
    );

    return {
      groups: rows.map((row) => this.mapRowToGroup(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Trouve un groupe par son ID avec le nombre de membres, ou null si inexistant.
   */
  async findById(id: number): Promise<Group | null> {
    const [rows] = await pool.query<GroupRow[]>(
      `SELECT
         g.id,
         g.nom,
         g.description,
         g.created_at,
         g.updated_at,
         COUNT(gu.id) AS membre_count
       FROM groupes g
       LEFT JOIN groupes_utilisateurs gu ON gu.groupe_id = g.id
       WHERE g.id = ?
       GROUP BY g.id
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToGroup(rows[0]!);
  }

  /**
   * Crée un nouveau groupe et retourne l'entité persistée.
   */
  async create(data: CreateGroupDto): Promise<Group> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO groupes (nom, description)
       VALUES (?, ?)`,
      [data.nom, data.description ?? null],
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error("Erreur lors de la création du groupe");
    }

    return created;
  }

  /**
   * Met à jour partiellement un groupe (nom et/ou description).
   * Retourne l'entité mise à jour.
   */
  async update(data: UpdateGroupDto): Promise<Group> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }

    // description peut être null (suppression) ou une string
    // On vérifie !== undefined pour distinguer "non fourni" de "explicitement null"
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description ?? null);
    }

    if (fields.length === 0) {
      // Aucun champ à mettre à jour : on retourne l'entité existante
      const existing = await this.findById(data.id);
      if (!existing) {
        throw new Error("Groupe introuvable");
      }
      return existing;
    }

    values.push(data.id);

    await pool.query<ResultSetHeader>(
      `UPDATE groupes SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await this.findById(data.id);
    if (!updated) {
      throw new Error("Groupe introuvable");
    }

    return updated;
  }

  /**
   * Supprime un groupe par son ID.
   * Le CASCADE sur groupes_utilisateurs supprime automatiquement les membres.
   * Vérifie d'abord que le groupe existe.
   */
  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Groupe introuvable");
    }

    await pool.query<ResultSetHeader>(
      `DELETE FROM groupes WHERE id = ?`,
      [id],
    );
  }

  /**
   * Retourne la liste des membres d'un groupe avec les données utilisateur jointes.
   * Triés par nom de famille puis prénom.
   */
  async getMembers(groupeId: number): Promise<GroupMember[]> {
    const [rows] = await pool.query<GroupMemberRow[]>(
      `SELECT
         gu.id,
         gu.groupe_id,
         gu.user_id,
         gu.created_at,
         u.first_name,
         u.last_name,
         u.email,
         u.role_app,
         u.photo_url
       FROM groupes_utilisateurs gu
       JOIN utilisateurs u ON u.id = gu.user_id
       WHERE gu.groupe_id = ?
       ORDER BY u.last_name ASC, u.first_name ASC`,
      [groupeId],
    );

    return rows.map((row) => this.mapRowToGroupMember(row));
  }

  /**
   * Ajoute un utilisateur à un groupe.
   * Lance une erreur métier si la contrainte UNIQUE est violée (déjà membre).
   */
  async addMember(data: AddMemberDto): Promise<void> {
    try {
      await pool.query<ResultSetHeader>(
        `INSERT INTO groupes_utilisateurs (groupe_id, user_id)
         VALUES (?, ?)`,
        [data.groupe_id, data.user_id],
      );
    } catch (error: any) {
      // MySQL error code 1062 = Duplicate entry (UNIQUE constraint)
      if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
        throw new Error("Cet utilisateur est déjà membre de ce groupe");
      }
      throw error;
    }
  }

  /**
   * Retire un utilisateur d'un groupe.
   * Lance une erreur si aucune ligne n'est supprimée (membre introuvable).
   */
  async removeMember(data: RemoveMemberDto): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM groupes_utilisateurs
       WHERE groupe_id = ? AND user_id = ?`,
      [data.groupe_id, data.user_id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Membre introuvable dans ce groupe");
    }
  }

  /**
   * Vérifie si un utilisateur est déjà membre d'un groupe.
   */
  async isMember(groupeId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.query<MemberCountRow[]>(
      `SELECT COUNT(*) AS cnt
       FROM groupes_utilisateurs
       WHERE groupe_id = ? AND user_id = ?`,
      [groupeId, userId],
    );

    const cnt = rows[0]?.cnt ?? 0;
    return cnt > 0;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une GroupRow MySQL en objet Group
   */
  private mapRowToGroup(row: GroupRow): Group {
    return {
      id: row.id,
      nom: row.nom,
      description: row.description ?? null,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      membre_count: Number(row.membre_count),
    };
  }

  /**
   * Convertit une GroupMemberRow MySQL en objet GroupMember
   */
  private mapRowToGroupMember(row: GroupMemberRow): GroupMember {
    return {
      id: row.id,
      groupe_id: row.groupe_id,
      user_id: row.user_id,
      created_at: new Date(row.created_at).toISOString(),
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      role_app: row.role_app ?? null,
      photo_url: row.photo_url ?? null,
    };
  }
}
