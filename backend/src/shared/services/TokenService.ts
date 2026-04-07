/**
 * TokenService
 * Service pour gérer les tokens d'email verification et password reset
 * Utilise crypto pour générer des tokens sécurisés
 */

import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export interface TokenData {
  token: string;
  expiresAt: Date;
}

export interface TokenValidationResult {
  isValid: boolean;
  error?: string;
}

export class TokenService {
  // Durées d'expiration
  private static readonly EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 heures
  private static readonly PASSWORD_RESET_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

  // Longueur des tokens générés avec crypto
  private static readonly TOKEN_BYTE_LENGTH = 32; // 32 bytes = 64 caractères hex

  /**
   * Génère un token sécurisé pour la vérification d'email
   * @returns TokenData - Objet contenant le token et sa date d'expiration
   */
  static generateEmailVerificationToken(): TokenData {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + this.EMAIL_VERIFICATION_EXPIRY_MS);

    return {
      token,
      expiresAt,
    };
  }

  /**
   * Génère un token sécurisé pour la réinitialisation de mot de passe
   * @returns TokenData - Objet contenant le token et sa date d'expiration
   */
  static generatePasswordResetToken(): TokenData {
    const token = crypto.randomBytes(this.TOKEN_BYTE_LENGTH).toString("hex");
    const expiresAt = new Date(Date.now() + this.PASSWORD_RESET_EXPIRY_MS);

    return {
      token,
      expiresAt,
    };
  }

  /**
   * Génère un token sécurisé générique avec crypto.randomBytes
   * @param length - Longueur en bytes (défaut: 32)
   * @returns string - Token en format hexadécimal
   */
  static generateSecureToken(length: number = this.TOKEN_BYTE_LENGTH): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Génère un token UUID v4
   * @returns string - UUID v4
   */
  static generateUuidToken(): string {
    return uuidv4();
  }

  /**
   * Valide un token de vérification d'email
   * @param token - Token à valider
   * @param expiresAt - Date d'expiration du token
   * @returns TokenValidationResult - Résultat de la validation
   */
  static validateEmailVerificationToken(
    token: string,
    expiresAt: Date,
  ): TokenValidationResult {
    if (!token) {
      return {
        isValid: false,
        error: "Token is required",
      };
    }

    // Vérifier que c'est un UUID valide
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return {
        isValid: false,
        error: "Invalid token format",
      };
    }

    // Vérifier l'expiration
    const now = new Date();
    if (expiresAt < now) {
      return {
        isValid: false,
        error: "Token has expired",
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Valide un token de réinitialisation de mot de passe
   * @param token - Token à valider
   * @param expiresAt - Date d'expiration du token
   * @returns TokenValidationResult - Résultat de la validation
   */
  static validatePasswordResetToken(
    token: string,
    expiresAt: Date,
  ): TokenValidationResult {
    if (!token) {
      return {
        isValid: false,
        error: "Token is required",
      };
    }

    // Vérifier que c'est un token hexadécimal de la bonne longueur
    const hexRegex = /^[0-9a-f]+$/i;
    if (!hexRegex.test(token) || token.length !== this.TOKEN_BYTE_LENGTH * 2) {
      return {
        isValid: false,
        error: "Invalid token format",
      };
    }

    // Vérifier l'expiration
    const now = new Date();
    if (expiresAt < now) {
      return {
        isValid: false,
        error: "Token has expired",
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Vérifie si un token est expiré
   * @param expiresAt - Date d'expiration du token
   * @returns boolean - true si le token est expiré
   */
  static isTokenExpired(expiresAt: Date): boolean {
    const now = new Date();
    return expiresAt < now;
  }

  /**
   * Calcule le temps restant avant l'expiration d'un token
   * @param expiresAt - Date d'expiration du token
   * @returns number - Temps restant en millisecondes (0 si expiré)
   */
  static getTimeUntilExpiration(expiresAt: Date): number {
    const now = new Date();
    const timeRemaining = expiresAt.getTime() - now.getTime();
    return Math.max(0, timeRemaining);
  }

  /**
   * Compare deux tokens de manière sécurisée (résistant aux attaques timing)
   * @param tokenA - Premier token
   * @param tokenB - Second token
   * @returns boolean - true si les tokens correspondent
   */
  static compareTokens(tokenA: string, tokenB: string): boolean {
    if (!tokenA || !tokenB) {
      return false;
    }

    // S'assurer que les tokens ont la même longueur
    if (tokenA.length !== tokenB.length) {
      return false;
    }

    try {
      // Utiliser timingSafeEqual pour éviter les attaques timing
      const bufferA = Buffer.from(tokenA);
      const bufferB = Buffer.from(tokenB);
      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash un token pour le stockage en base de données
   * @param token - Token à hasher
   * @returns string - Hash du token
   */
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
