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
import type {
  IUserRepository,
  DeletedUserDto,
} from "../../domain/repositories/IUserRepository.js";
import type {
  UpdateUserProfileDto,
  UserProfileDto,
} from "../../domain/repositories/IUserRepository.js";

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
  langue_preferee?: string | null;
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
  langue_preferee: string | null;
  date_inscription: Date;
}

interface DeletedUserRow extends UserListRow {
  deleted_at: Date;
  deleted_by: number | null;
  deletion_reason: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface ProfileRow extends RowDataPacket {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string | null;
  email: string | null;
  date_of_birth: Date;
  telephone: string | null;
  adresse: string | null;
  photo_url: string | null;
  email_verified: boolean;
  role_app: string;
  langue_preferee: string | null;
  status_id: number;
  date_inscription: Date;
  derniere_connexion: Date | null;
  // Joined fields:
  genre_id_val: number | null;
  genre_nom: string | null;
  grade_id_val: number | null;
  grade_nom: string | null;
  grade_couleur: string | null;
  abonnement_id_val: number | null;
  abonnement_nom: string | null;
  abonnement_prix: number | null;
  status_nom: string;
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
         u.langue_preferee,
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
      langue_preferee: row.langue_preferee ?? undefined,
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
   * Récupère le profil complet d'un utilisateur avec ses relations (genre, grade, abonnement, statut)
   */
  async findProfile(id: number): Promise<UserProfileDto | null> {
    const [rows] = await pool.query<ProfileRow[]>(
      `SELECT
         u.id, u.userId, u.first_name, u.last_name, u.nom_utilisateur, u.email,
         u.date_of_birth, u.telephone, u.adresse, u.photo_url, u.email_verified,
         u.role_app, u.langue_preferee, u.status_id, u.date_inscription, u.derniere_connexion,
         g.id  AS genre_id_val,  g.nom  AS genre_nom,
         gr.id AS grade_id_val,  gr.nom AS grade_nom, gr.couleur AS grade_couleur,
         a.id  AS abonnement_id_val, a.nom AS abonnement_nom, a.prix AS abonnement_prix,
         s.nom AS status_nom
       FROM utilisateurs u
       LEFT JOIN genres           g  ON g.id  = u.genre_id
       LEFT JOIN grades           gr ON gr.id = u.grade_id
       LEFT JOIN plans_tarifaires a  ON a.id  = u.abonnement_id
       LEFT JOIN status           s  ON s.id  = u.status_id
       WHERE u.id = ? AND u.deleted_at IS NULL AND u.anonymized = FALSE
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToProfile(rows[0]!);
  }

  /**
   * Met à jour les champs de profil d'un utilisateur de façon dynamique
   */
  async updateProfile(
    id: number,
    data: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const allowedFields: (keyof UpdateUserProfileDto)[] = [
      "first_name",
      "last_name",
      "telephone",
      "adresse",
      "date_of_birth",
      "genre_id",
      "grade_id",
      "photo_url",
    ];

    const setClauses: string[] = [];
    const params: (string | number | null)[] = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        setClauses.push(`${field} = ?`);
        params.push(
          (data[field] as string | number | null | undefined) ?? null,
        );
      }
    }

    // Always update timestamp
    setClauses.push("updated_at = NOW()");

    params.push(id);

    await pool.query(
      `UPDATE utilisateurs SET ${setClauses.join(", ")} WHERE id = ?`,
      params,
    );

    const profile = await this.findProfile(id);
    if (!profile) {
      throw new Error("Utilisateur introuvable");
    }
    return profile;
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
   * Met à jour la langue préférée d'un utilisateur
   */
  async updateLanguage(id: number, langue_preferee: string): Promise<void> {
    await pool.query(
      "UPDATE utilisateurs SET langue_preferee = ?, updated_at = NOW() WHERE id = ?",
      [langue_preferee, id],
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

  /**
   * Récupère la liste des utilisateurs supprimés (soft delete, non encore anonymisés)
   */
  async findDeleted(): Promise<DeletedUserDto[]> {
    const [rows] = await pool.query<DeletedUserRow[]>(
      `SELECT
         u.id, u.userId, u.first_name, u.last_name,
         u.nom_utilisateur, u.email, u.email_verified,
         u.active, u.status_id, u.role_app, u.langue_preferee,
         u.date_inscription, u.deleted_at, u.deleted_by, u.deletion_reason
       FROM utilisateurs u
       WHERE u.deleted_at IS NOT NULL AND u.anonymized = FALSE
       ORDER BY u.deleted_at DESC`,
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      first_name: row.first_name,
      last_name: row.last_name,
      nom_utilisateur: row.nom_utilisateur ?? null,
      email: row.email ?? "",
      email_verified: Boolean(row.email_verified),
      active: Boolean(row.active),
      status_id: row.status_id,
      role_app: row.role_app ?? undefined,
      langue_preferee: row.langue_preferee ?? undefined,
      date_inscription: new Date(row.date_inscription).toISOString(),
      deleted_at: new Date(row.deleted_at).toISOString(),
      deleted_by: row.deleted_by ?? null,
      deletion_reason: row.deletion_reason ?? null,
    }));
  }

  /**
   * Anonymise un utilisateur : efface toutes les données personnelles (RGPD)
   */
  async anonymize(id: number): Promise<void> {
    await pool.query(
      `UPDATE utilisateurs SET
         first_name = 'Anonymisé',
         last_name = 'Anonymisé',
         email = CONCAT('anon_', id, '@deleted.local'),
         telephone = NULL,
         adresse = NULL,
         date_of_birth = '1900-01-01',
         photo_url = NULL,
         nom_utilisateur = NULL,
         anonymized = TRUE,
         active = FALSE,
         updated_at = NOW()
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
      langue_preferee: row.langue_preferee ?? undefined,
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

  /**
   * Convertit une ProfileRow MySQL en UserProfileDto
   */
  private mapRowToProfile(row: ProfileRow): UserProfileDto {
    return {
      id: row.id,
      userId: row.userId,
      first_name: row.first_name,
      last_name: row.last_name,
      nom_utilisateur: row.nom_utilisateur ?? "",
      email: row.email ?? "",
      date_of_birth: new Date(row.date_of_birth).toISOString().split("T")[0]!,
      telephone: row.telephone ?? null,
      adresse: row.adresse ?? null,
      photo_url: row.photo_url ?? null,
      email_verified: Boolean(row.email_verified),
      role_app: row.role_app,
      langue_preferee: row.langue_preferee ?? null,
      date_inscription: new Date(row.date_inscription).toISOString(),
      derniere_connexion: row.derniere_connexion
        ? new Date(row.derniere_connexion).toISOString()
        : null,
      genre:
        row.genre_id_val !== null && row.genre_nom !== null
          ? { id: row.genre_id_val, nom: row.genre_nom }
          : null,
      grade:
        row.grade_id_val !== null && row.grade_nom !== null
          ? {
              id: row.grade_id_val,
              nom: row.grade_nom,
              couleur: row.grade_couleur ?? null,
            }
          : null,
      abonnement:
        row.abonnement_id_val !== null &&
        row.abonnement_nom !== null &&
        row.abonnement_prix !== null
          ? {
              id: row.abonnement_id_val,
              nom: row.abonnement_nom,
              prix: row.abonnement_prix,
            }
          : null,
      status: { id: row.status_id, nom: row.status_nom },
    };
  }
}
