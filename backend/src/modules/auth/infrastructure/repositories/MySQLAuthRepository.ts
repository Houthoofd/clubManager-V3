/**
 * MySQLAuthRepository
 * Implémentation MySQL du repository d'authentification
 */

import type { User } from "@clubmanager/types";
import { UserRole } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import crypto from "crypto";

/**
 * Interface pour les résultats de requête User
 */
interface UserRow extends RowDataPacket {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string | null;
  email: string | null;
  password: string | null;
  date_of_birth: Date;
  telephone?: string;
  adresse?: string;
  genre_id: number;
  grade_id?: number;
  abonnement_id?: number;
  tuteur_id?: number | null;
  status_id: number;
  active: boolean;
  email_verified: boolean;
  est_mineur: boolean;
  peut_se_connecter: boolean;
  role_app: string;
  photo_url?: string;
  deleted_at?: Date | null;
  deleted_by?: number | null;
  deletion_reason?: string | null;
  anonymized: boolean;
  date_inscription: Date;
  derniere_connexion?: Date | null;
  created_at: Date;
  updated_at?: Date | null;
}

export class MySQLAuthRepository implements IAuthRepository {
  // ==================== USER OPERATIONS ====================

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData: {
    first_name: string;
    last_name: string;
    nom_utilisateur?: string;
    email: string;
    password: string;
    date_of_birth: Date;
    genre_id: number;
    abonnement_id?: number;
  }): Promise<User> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Générer le userId au format U-YYYY-XXXX
      const year = new Date().getFullYear();
      const countResult = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM utilisateurs WHERE userId LIKE ?",
        [`U-${year}-%`],
      );
      const count = (countResult[0][0] as { count: number }).count + 1;
      const userId = `U-${year}-${count.toString().padStart(4, "0")}`;

      // Générer nom_utilisateur si non fourni
      const nom_utilisateur =
        userData.nom_utilisateur ||
        `${userData.first_name.toLowerCase()}.${userData.last_name.toLowerCase()}${Math.floor(Math.random() * 1000)}`;

      // Récupérer le status_id par défaut (actif)
      const statusResult = await connection.query<RowDataPacket[]>(
        "SELECT id FROM status WHERE nom = 'actif' LIMIT 1",
      );
      const status_id =
        statusResult[0].length > 0
          ? (statusResult[0][0] as { id: number }).id
          : 1;

      // Insérer l'utilisateur
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO utilisateurs (
          userId, first_name, last_name, nom_utilisateur, email, password,
          date_of_birth, genre_id, abonnement_id, status_id, active, email_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
        [
          userId,
          userData.first_name,
          userData.last_name,
          nom_utilisateur,
          userData.email,
          userData.password,
          userData.date_of_birth,
          userData.genre_id,
          userData.abonnement_id || null,
          status_id,
        ],
      );

      await connection.commit();

      // Récupérer l'utilisateur créé
      const user = await this.findUserById(result.insertId);
      if (!user) {
        throw new Error("Failed to retrieve created user");
      }

      return user;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Trouve un utilisateur par email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT * FROM utilisateurs
       WHERE email = ? AND deleted_at IS NULL AND anonymized = FALSE
       LIMIT 1`,
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(rows[0]!);
  }

  /**
   * Trouve un utilisateur par ID
   */
  async findUserById(id: number): Promise<User | null> {
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
   * Trouve un utilisateur par userId (format U-YYYY-XXXX)
   */
  async findUserByUserId(userId: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT * FROM utilisateurs
       WHERE userId = ? AND deleted_at IS NULL AND anonymized = FALSE
       LIMIT 1`,
      [userId],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(rows[0]!);
  }

  /**
   * Vérifie si un email existe déjà
   */
  async emailExists(email: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM utilisateurs
       WHERE email = ? AND deleted_at IS NULL AND anonymized = FALSE`,
      [email],
    );

    return (rows[0] as { count: number }).count > 0;
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await pool.query(
      "UPDATE utilisateurs SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, userId],
    );
  }

  /**
   * Met à jour la dernière connexion d'un utilisateur
   */
  async updateLastLogin(userId: number): Promise<void> {
    await pool.query(
      "UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = ?",
      [userId],
    );
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Marque l'email d'un utilisateur comme vérifié
   */
  async markEmailAsVerified(userId: number): Promise<void> {
    await pool.query(
      "UPDATE utilisateurs SET email_verified = TRUE, email_verified_at = NOW(), updated_at = NOW() WHERE id = ?",
      [userId],
    );
  }

  /**
   * Stocke un token de vérification d'email
   */
  async storeEmailVerificationToken(
    userId: number,
    token: string,
    expiresAt: Date,
    email: string,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);

    await pool.query(
      `INSERT INTO email_validation_tokens (user_id, token_hash, expires_at, email)
       VALUES (?, ?, ?, ?)`,
      [userId, tokenHash, expiresAt, email],
    );
  }

  /**
   * Valide un token de vérification d'email
   */
  async validateEmailVerificationToken(token: string): Promise<number | null> {
    const tokenHash = this.hashToken(token);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT user_id FROM email_validation_tokens
       WHERE token_hash = ? AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

    if (rows.length === 0) {
      return null;
    }

    // Supprimer le token après usage (ne peut pas être réutilisé)
    await pool.query(
      "DELETE FROM email_validation_tokens WHERE token_hash = ?",
      [tokenHash],
    );

    return (rows[0] as { user_id: number }).user_id;
  }

  /**
   * Supprime un token de vérification d'email
   */
  async deleteEmailVerificationToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await pool.query(
      "DELETE FROM email_validation_tokens WHERE token_hash = ?",
      [tokenHash],
    );
  }

  // ==================== PASSWORD RESET ====================

  /**
   * Stocke un token de réinitialisation de mot de passe
   */
  async storePasswordResetToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt],
    );
  }

  /**
   * Valide un token de réinitialisation de mot de passe
   */
  async validatePasswordResetToken(token: string): Promise<number | null> {
    const tokenHash = this.hashToken(token);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT user_id FROM password_reset_tokens
       WHERE token_hash = ? AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

    if (rows.length === 0) {
      return null;
    }

    return (rows[0] as { user_id: number }).user_id;
  }

  /**
   * Supprime un token de réinitialisation de mot de passe
   */
  async deletePasswordResetToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    // Supprimer le token après usage (ne peut pas être réutilisé)
    await pool.query("DELETE FROM password_reset_tokens WHERE token_hash = ?", [
      tokenHash,
    ]);
  }

  /**
   * Supprime tous les tokens de reset d'un utilisateur
   */
  async deleteAllPasswordResetTokens(userId: number): Promise<void> {
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [
      userId,
    ]);
  }

  // ==================== REFRESH TOKENS ====================

  /**
   * Stocke un refresh token
   */
  async storeRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt],
    );
  }

  /**
   * Valide un refresh token
   */
  async validateRefreshToken(token: string): Promise<number | null> {
    const tokenHash = this.hashToken(token);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT user_id FROM refresh_tokens
       WHERE token_hash = ? AND expires_at > NOW() AND revoked = FALSE
       LIMIT 1`,
      [tokenHash],
    );

    if (rows.length === 0) {
      return null;
    }

    return (rows[0] as { user_id: number }).user_id;
  }

  /**
   * Supprime un refresh token (logout)
   */
  async deleteRefreshToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await pool.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?",
      [tokenHash],
    );
  }

  /**
   * Supprime tous les refresh tokens d'un utilisateur (logout all devices)
   */
  async deleteAllRefreshTokens(userId: number): Promise<void> {
    await pool.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?",
      [userId],
    );
  }

  /**
   * Nettoie les tokens expirés
   */
  async cleanupExpiredTokens(): Promise<void> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Nettoyer les tokens expirés de toutes les tables
      await connection.query(
        "DELETE FROM email_validation_tokens WHERE expires_at < NOW()",
      );

      await connection.query(
        "DELETE FROM password_reset_tokens WHERE expires_at < NOW()",
      );

      await connection.query(
        "DELETE FROM refresh_tokens WHERE expires_at < NOW()",
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Hash un token avec SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Convertit une row MySQL en objet User
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
      telephone: row.telephone,
      adresse: row.adresse,
      genre_id: row.genre_id,
      grade_id: row.grade_id,
      abonnement_id: row.abonnement_id,
      tuteur_id: row.tuteur_id ?? null,
      status_id: row.status_id,
      active: Boolean(row.active),
      email_verified: Boolean(row.email_verified),
      est_mineur: Boolean(row.est_mineur),
      peut_se_connecter: Boolean(row.peut_se_connecter),
      role_app: (row.role_app as UserRole) ?? UserRole.MEMBER,
      photo_url: row.photo_url,
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
      deleted_by: row.deleted_by,
      deletion_reason: row.deletion_reason,
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
