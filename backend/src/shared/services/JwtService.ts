/**
 * JwtService
 * Service pour gérer la génération et validation des tokens JWT
 * Gère les Access Tokens et Refresh Tokens
 */

import jwt from "jsonwebtoken";
import type { JwtPayload, DecodedToken, TokenPair } from "@clubmanager/types";

// Configuration JWT depuis les variables d'environnement
const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "your-super-secret-access-key-change-this-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "your-super-secret-refresh-key-change-this-in-production";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m"; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d"; // 7 jours

export class JwtService {
  /**
   * Génère un Access Token
   * @param payload - Données à encoder dans le token
   * @returns string - JWT Access Token
   */
  static generateAccessToken(payload: Omit<JwtPayload, "type">): string {
    const tokenPayload: JwtPayload = {
      ...payload,
      type: "access",
    };

    return jwt.sign(tokenPayload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: "clubmanager",
      audience: "clubmanager-api",
    });
  }

  /**
   * Génère un Refresh Token
   * @param payload - Données à encoder dans le token
   * @returns string - JWT Refresh Token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, "type">): string {
    const tokenPayload: JwtPayload = {
      ...payload,
      type: "refresh",
    };

    return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "clubmanager",
      audience: "clubmanager-api",
    });
  }

  /**
   * Génère une paire de tokens (access + refresh)
   * @param payload - Données à encoder
   * @returns TokenPair
   */
  static generateTokenPair(payload: Omit<JwtPayload, "type">): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Calculer l'expiration en secondes
    const expiresIn = this.getExpirationInSeconds(JWT_ACCESS_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Vérifie et décode un Access Token
   * @param token - JWT Access Token
   * @returns DecodedToken - Token décodé
   * @throws Error si le token est invalide ou expiré
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
        issuer: "clubmanager",
        audience: "clubmanager-api",
      }) as DecodedToken;

      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid access token");
      }
      throw new Error("Token verification failed");
    }
  }

  /**
   * Vérifie et décode un Refresh Token
   * @param token - JWT Refresh Token
   * @returns DecodedToken - Token décodé
   * @throws Error si le token est invalide ou expiré
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: "clubmanager",
        audience: "clubmanager-api",
      }) as DecodedToken;

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      }
      throw new Error("Token verification failed");
    }
  }

  /**
   * Décode un token sans vérification (pour debug/inspection)
   * ⚠️ NE PAS UTILISER POUR L'AUTHENTIFICATION
   * @param token - JWT Token
   * @returns DecodedToken | null
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifie si un token est expiré (sans vérifier la signature)
   * @param token - JWT Token
   * @returns boolean
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtient le temps restant avant expiration (en secondes)
   * @param token - JWT Token
   * @returns number - Secondes restantes (ou 0 si expiré)
   */
  static getTimeUntilExpiration(token: string): number {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return 0;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - currentTime;

      return timeLeft > 0 ? timeLeft : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Convertit une durée string (ex: "15m", "7d") en secondes
   * @param duration - Durée au format string
   * @returns number - Durée en secondes
   */
  private static getExpirationInSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default: 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 900;
    }
  }

  /**
   * Extrait le token d'un header Authorization
   * @param authHeader - Header Authorization (format: "Bearer <token>")
   * @returns string | null - Token extrait
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }
}
