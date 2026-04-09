/**
 * IAuthRepository
 * Interface du repository d'authentification (Domain Layer)
 * Contrat pour les opérations d'authentification en base de données
 */

import type { User, UserPublic } from "@clubmanager/types";

/**
 * Interface du repository d'authentification
 */
export interface IAuthRepository {
  // ==================== USER OPERATIONS ====================

  /**
   * Crée un nouvel utilisateur
   * @param userData - Données de l'utilisateur à créer
   * @returns Promise<User> - Utilisateur créé
   */
  createUser(userData: {
    first_name: string;
    last_name: string;
    nom_utilisateur?: string;
    email: string;
    password: string; // Déjà hashé
    date_of_birth: Date;
    genre_id: number;
    abonnement_id?: number;
  }): Promise<User>;

  /**
   * Trouve un utilisateur par email
   * @param email - Email de l'utilisateur
   * @returns Promise<User | null> - Utilisateur trouvé ou null
   */
  findUserByEmail(email: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par ID
   * @param id - ID numérique de l'utilisateur
   * @returns Promise<User | null> - Utilisateur trouvé ou null
   */
  findUserById(id: number): Promise<User | null>;

  /**
   * Trouve un utilisateur par userId (format U-YYYY-XXXX)
   * @param userId - userId string de l'utilisateur
   * @returns Promise<User | null> - Utilisateur trouvé ou null
   */
  findUserByUserId(userId: string): Promise<User | null>;

  /**
   * Vérifie si un email existe déjà
   * @param email - Email à vérifier
   * @returns Promise<boolean> - true si l'email existe
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Met à jour le mot de passe d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param hashedPassword - Nouveau mot de passe hashé
   * @returns Promise<void>
   */
  updatePassword(userId: number, hashedPassword: string): Promise<void>;

  /**
   * Met à jour la dernière connexion d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Promise<void>
   */
  updateLastLogin(userId: number): Promise<void>;

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Marque l'email d'un utilisateur comme vérifié
   * @param userId - ID de l'utilisateur
   * @returns Promise<void>
   */
  markEmailAsVerified(userId: number): Promise<void>;

  /**
   * Stocke un token de vérification d'email
   * @param userId - ID de l'utilisateur
   * @param token - Token de vérification
   * @param expiresAt - Date d'expiration
   * @returns Promise<void>
   */
  storeEmailVerificationToken(
    userId: number,
    token: string,
    expiresAt: Date,
    email: string,
  ): Promise<void>;

  /**
   * Valide un token de vérification d'email
   * @param token - Token à valider
   * @returns Promise<number | null> - ID de l'utilisateur ou null
   */
  validateEmailVerificationToken(token: string): Promise<number | null>;

  /**
   * Supprime un token de vérification d'email
   * @param token - Token à supprimer
   * @returns Promise<void>
   */
  deleteEmailVerificationToken(token: string): Promise<void>;

  // ==================== PASSWORD RESET ====================

  /**
   * Stocke un token de réinitialisation de mot de passe
   * @param userId - ID de l'utilisateur
   * @param token - Token de reset
   * @param expiresAt - Date d'expiration
   * @returns Promise<void>
   */
  storePasswordResetToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void>;

  /**
   * Valide un token de réinitialisation de mot de passe
   * @param token - Token à valider
   * @returns Promise<number | null> - ID de l'utilisateur ou null
   */
  validatePasswordResetToken(token: string): Promise<number | null>;

  /**
   * Supprime un token de réinitialisation de mot de passe
   * @param token - Token à supprimer
   * @returns Promise<void>
   */
  deletePasswordResetToken(token: string): Promise<void>;

  /**
   * Supprime tous les tokens de reset d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Promise<void>
   */
  deleteAllPasswordResetTokens(userId: number): Promise<void>;

  // ==================== REFRESH TOKENS ====================

  /**
   * Stocke un refresh token
   * @param userId - ID de l'utilisateur
   * @param token - Refresh token
   * @param expiresAt - Date d'expiration
   * @returns Promise<void>
   */
  storeRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void>;

  /**
   * Valide un refresh token
   * @param token - Refresh token à valider
   * @returns Promise<number | null> - ID de l'utilisateur ou null
   */
  validateRefreshToken(token: string): Promise<number | null>;

  /**
   * Supprime un refresh token (logout)
   * @param token - Refresh token à supprimer
   * @returns Promise<void>
   */
  deleteRefreshToken(token: string): Promise<void>;

  /**
   * Supprime tous les refresh tokens d'un utilisateur (logout all devices)
   * @param userId - ID de l'utilisateur
   * @returns Promise<void>
   */
  deleteAllRefreshTokens(userId: number): Promise<void>;

  /**
   * Nettoie les tokens expirés
   * @returns Promise<void>
   */
  cleanupExpiredTokens(): Promise<void>;
}
