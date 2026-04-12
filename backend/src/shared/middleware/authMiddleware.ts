/**
 * authMiddleware
 * Middleware pour protéger les routes nécessitant une authentification
 */

import type { Request, Response, NextFunction } from "express";
import { JwtService } from "@/shared/services/JwtService.js";
import type { DecodedToken } from "@clubmanager/types";
import { UserRole } from "@clubmanager/types";

/**
 * Interface pour étendre Request avec les données utilisateur
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    userIdString: string;
    role_app?: UserRole;
  };
  token?: string;
}

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
        error: "NO_TOKEN",
      });
      return;
    }

    // 2. Vérifier et décoder le token
    let decoded: DecodedToken;
    try {
      decoded = JwtService.verifyAccessToken(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid token";

      if (errorMessage.includes("expired")) {
        res.status(401).json({
          success: false,
          message: "Access token has expired",
          error: "TOKEN_EXPIRED",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
        error: "INVALID_TOKEN",
      });
      return;
    }

    // 3. Attacher les données de l'utilisateur à la requête
    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      userIdString: decoded.userIdString,
      role_app: decoded.role_app,
    };

    (req as AuthRequest).token = token;

    // 4. Passer au middleware suivant
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: "INTERNAL_ERROR",
    });
  }
};

/**
 * Middleware d'authentification optionnelle
 * Attache l'utilisateur s'il est authentifié, sinon continue sans erreur
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      // Pas de token, mais on continue quand même
      next();
      return;
    }

    try {
      const decoded = JwtService.verifyAccessToken(token);

      (req as AuthRequest).user = {
        userId: decoded.userId,
        email: decoded.email,
        userIdString: decoded.userIdString,
        role_app: decoded.role_app,
      };

      (req as AuthRequest).token = token;
    } catch (error) {
      // Token invalide ou expiré, on continue sans utilisateur
      console.warn("[OptionalAuthMiddleware] Invalid token:", error);
    }

    next();
  } catch (error) {
    console.error("[OptionalAuthMiddleware] Error:", error);
    next();
  }
};

/**
 * Middleware pour vérifier un rôle spécifique
 * À utiliser après authMiddleware
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "NOT_AUTHENTICATED",
        });
        return;
      }

      if (!user.role_app || !allowedRoles.includes(user.role_app)) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          error: "FORBIDDEN",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("[RequireRole] Error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization error",
        error: "INTERNAL_ERROR",
      });
    }
  };
};

/**
 * Middleware pour vérifier que l'email est vérifié
 * À utiliser après authMiddleware
 */
export const requireEmailVerified = () => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "NOT_AUTHENTICATED",
        });
        return;
      }

      // TODO: Vérifier si l'email est vérifié dans la base de données
      // Pour l'instant, on laisse passer
      // const fullUser = await getUserById(user.userId);
      // if (!fullUser.email_verified) {
      //   res.status(403).json({
      //     success: false,
      //     message: "Email verification required",
      //     error: "EMAIL_NOT_VERIFIED",
      //   });
      //   return;
      // }

      next();
    } catch (error) {
      console.error("[RequireEmailVerified] Error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization error",
        error: "INTERNAL_ERROR",
      });
    }
  };
};
