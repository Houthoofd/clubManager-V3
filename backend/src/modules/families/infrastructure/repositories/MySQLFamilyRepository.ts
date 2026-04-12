/**
 * MySQLFamilyRepository
 * Implémentation MySQL du repository familles
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  User,
  Family,
  FamilyMember,
  FamilyMemberWithUser,
  FamilyMemberRole,
} from "@clubmanager/types";
import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";

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
  telephone: string | null;
  adresse: string | null;
  genre_id: number;
  grade_id: number | null;
  abonnement_id: number | null;
  tuteur_id: number | null;
  status_id: number;
  active: boolean;
  email_verified: boolean;
  est_mineur: boolean;
  peut_se_connecter: boolean;
  photo_url: string | null;
  deleted_at: Date | null;
  deleted_by: number | null;
  deletion_reason: string | null;
  anonymized: boolean;
  date_inscription: Date;
  derniere_connexion: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

interface FamilleRow extends RowDataPacket {
  id: number;
  nom: string | null;
  created_at: Date;
  updated_at: Date | null;
}

interface MembreRow extends RowDataPacket {
  id: number;
  famille_id: number;
  user_id: number;
  role: FamilyMemberRole;
  est_responsable: boolean | number;
  est_tuteur_legal: boolean | number;
  date_ajout: Date;
}

interface MembreWithUserRow extends RowDataPacket {
  // Champs membres_famille
  membre_id: number;
  famille_id: number;
  role: FamilyMemberRole;
  est_responsable: boolean | number;
  est_tuteur_legal: boolean | number;
  date_ajout: Date;
  // Champs utilisateurs (u.id → user_numeric_id pour éviter conflit)
  user_numeric_id: number;
  user_string_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  genre_id: number;
  grade_id: number | null;
  est_mineur: boolean | number;
  peut_se_connecter: boolean | number;
  // Champs grades (aliasés)
  grade_db_id: number | null;
  grade_nom: string | null;
  grade_couleur: string | null;
}

// ==================== REPOSITORY ====================

export class MySQLFamilyRepository implements IFamilyRepository {
  // ==================== FAMILLES ====================

  /**
   * Crée une nouvelle famille
   * @param nom - Nom optionnel de la famille
   * @returns Promise<Family> - Famille créée
   */
  async createFamille(nom?: string): Promise<Family> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO familles (nom) VALUES (?)",
      [nom ?? null],
    );

    const [rows] = await pool.query<FamilleRow[]>(
      "SELECT * FROM familles WHERE id = ? LIMIT 1",
      [result.insertId],
    );

    if (rows.length === 0) {
      throw new Error("Failed to retrieve created famille");
    }

    return this.mapRowToFamily(rows[0]!);
  }

  /**
   * Trouve la famille d'un utilisateur via la table de liaison membres_famille
   * @param userId - ID numérique de l'utilisateur
   * @returns Promise<Family | null> - Famille trouvée ou null
   */
  async findFamilleByUserId(userId: number): Promise<Family | null> {
    const [rows] = await pool.query<FamilleRow[]>(
      `SELECT f.*
       FROM familles f
       JOIN membres_famille mf ON mf.famille_id = f.id
       WHERE mf.user_id = ?
       LIMIT 1`,
      [userId],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToFamily(rows[0]!);
  }

  // ==================== MEMBRES ====================

  /**
   * Ajoute un membre à une famille
   * @param params - Paramètres du membre à ajouter
   * @returns Promise<FamilyMember> - Membre créé
   */
  async addMembre(params: {
    familleId: number;
    userId: number;
    role: FamilyMemberRole;
    estResponsable: boolean;
    estTuteurLegal: boolean;
  }): Promise<FamilyMember> {
    const { familleId, userId, role, estResponsable, estTuteurLegal } = params;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO membres_famille (famille_id, user_id, role, est_responsable, est_tuteur_legal, date_ajout)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [familleId, userId, role, estResponsable, estTuteurLegal],
    );

    const [rows] = await pool.query<MembreRow[]>(
      "SELECT * FROM membres_famille WHERE id = ? LIMIT 1",
      [result.insertId],
    );

    if (rows.length === 0) {
      throw new Error("Failed to retrieve created membre");
    }

    return this.mapRowToFamilyMember(rows[0]!);
  }

  /**
   * Récupère tous les membres d'une famille avec leurs informations utilisateur et grade
   * @param familleId - ID de la famille
   * @returns Promise<FamilyMemberWithUser[]> - Liste des membres avec données utilisateur
   */
  async getMembresByFamilleId(
    familleId: number,
  ): Promise<FamilyMemberWithUser[]> {
    const [rows] = await pool.query<MembreWithUserRow[]>(
      `SELECT
         mf.id           AS membre_id,
         mf.famille_id,
         mf.role,
         mf.est_responsable,
         mf.est_tuteur_legal,
         mf.date_ajout,
         u.id            AS user_numeric_id,
         u.userId        AS user_string_id,
         u.first_name,
         u.last_name,
         u.date_of_birth,
         u.genre_id,
         u.grade_id,
         u.est_mineur,
         u.peut_se_connecter,
         g.id            AS grade_db_id,
         g.nom           AS grade_nom,
         g.couleur       AS grade_couleur
       FROM membres_famille mf
       JOIN utilisateurs u ON u.id = mf.user_id
       LEFT JOIN grades g ON g.id = u.grade_id
       WHERE mf.famille_id = ?
         AND u.deleted_at IS NULL
       ORDER BY mf.est_responsable DESC, mf.date_ajout ASC`,
      [familleId],
    );

    return rows.map((row) => this.mapRowToFamilyMemberWithUser(row));
  }

  /**
   * Retire un membre d'une famille
   * @param familleId - ID de la famille
   * @param userId - ID numérique de l'utilisateur à retirer
   * @returns Promise<void>
   */
  async removeMembre(familleId: number, userId: number): Promise<void> {
    await pool.query(
      "DELETE FROM membres_famille WHERE famille_id = ? AND user_id = ?",
      [familleId, userId],
    );
  }

  /**
   * Vérifie si un utilisateur est membre d'une famille
   * @param familleId - ID de la famille
   * @param userId - ID numérique de l'utilisateur
   * @returns Promise<boolean> - true si l'utilisateur est membre
   */
  async isMembre(familleId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count
       FROM membres_famille
       WHERE famille_id = ? AND user_id = ?`,
      [familleId, userId],
    );

    return (rows[0] as { count: number }).count > 0;
  }

  // ==================== COMPTE ENFANT ====================

  /**
   * Crée un compte enfant sans email ni mot de passe
   * Utilise une transaction pour garantir l'atomicité
   * @param data - Données de l'enfant à créer
   * @returns Promise<User> - Utilisateur enfant créé
   */
  async createChildUser(data: {
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    genre_id: number;
    tuteur_id: number;
    est_mineur: boolean;
    peut_se_connecter: boolean;
  }): Promise<User> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Générer le userId au format U-YYYY-XXXX (même logique que MySQLAuthRepository)
      const year = new Date().getFullYear();
      const [countResult] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM utilisateurs WHERE userId LIKE ?",
        [`U-${year}-%`],
      );
      const count = (countResult[0] as { count: number }).count + 1;
      const userId = `U-${year}-${count.toString().padStart(4, "0")}`;

      // Récupérer le status_id 'actif' depuis la table status
      const [statusResult] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM status WHERE nom = 'actif' LIMIT 1",
      );
      const status_id =
        statusResult.length > 0 ? (statusResult[0] as { id: number }).id : 1;

      // Insérer le compte enfant
      // email, password et nom_utilisateur sont NULL (compte non connecté)
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO utilisateurs (
           userId,
           first_name,
           last_name,
           email,
           password,
           nom_utilisateur,
           date_of_birth,
           genre_id,
           tuteur_id,
           est_mineur,
           peut_se_connecter,
           status_id,
           active,
           email_verified
         ) VALUES (?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
        [
          userId,
          data.first_name,
          data.last_name,
          data.date_of_birth,
          data.genre_id,
          data.tuteur_id,
          data.est_mineur,
          data.peut_se_connecter,
          status_id,
        ],
      );

      await connection.commit();

      // Récupérer l'utilisateur créé
      const user = await this.findUserById(result.insertId);
      if (!user) {
        throw new Error("Failed to retrieve created child user");
      }

      return user;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Trouve un utilisateur par son ID numérique (clé primaire)
   * @param id - ID numérique de l'utilisateur
   * @returns Promise<User | null>
   */
  private async findUserById(id: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT * FROM utilisateurs
       WHERE id = ? AND deleted_at IS NULL AND anonymized = FALSE
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(rows[0]!);
  }

  /**
   * Convertit une row MySQL en objet Family
   */
  private mapRowToFamily(row: FamilleRow): Family {
    return {
      id: row.id,
      nom: row.nom ?? undefined,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
    };
  }

  /**
   * Convertit une row MySQL en objet FamilyMember
   */
  private mapRowToFamilyMember(row: MembreRow): FamilyMember {
    return {
      id: row.id,
      famille_id: row.famille_id,
      user_id: row.user_id,
      role: row.role,
      est_responsable: Boolean(row.est_responsable),
      est_tuteur_legal: Boolean(row.est_tuteur_legal),
      date_ajout: new Date(row.date_ajout),
    };
  }

  /**
   * Convertit une row MySQL (jointure membres + utilisateurs + grades) en FamilyMemberWithUser
   * Les champs grade_nom et grade_couleur sont disponibles dans la row mais ne sont
   * pas portés par le type FamilyMemberWithUser (uniquement grade_id dans user)
   */
  private mapRowToFamilyMemberWithUser(
    row: MembreWithUserRow,
  ): FamilyMemberWithUser {
    return {
      // Données FamilyMember (table membres_famille)
      id: row.membre_id,
      famille_id: row.famille_id,
      user_id: row.user_numeric_id,
      role: row.role,
      est_responsable: Boolean(row.est_responsable),
      est_tuteur_legal: Boolean(row.est_tuteur_legal),
      date_ajout: new Date(row.date_ajout),
      // Données utilisateur imbriquées
      user: {
        id: row.user_numeric_id,
        userId: row.user_string_id,
        first_name: row.first_name,
        last_name: row.last_name,
        date_of_birth: new Date(row.date_of_birth),
        genre_id: row.genre_id,
        grade_id: row.grade_id ?? undefined,
        est_mineur: Boolean(row.est_mineur),
        peut_se_connecter: Boolean(row.peut_se_connecter),
      },
    };
  }

  /**
   * Convertit une row MySQL en objet User complet
   * Les champs email, password et nom_utilisateur peuvent être NULL
   * pour les comptes enfants (peut_se_connecter = false)
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
      status_id: row.status_id,
      active: Boolean(row.active),
      email_verified: Boolean(row.email_verified),
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
