/**
 * AuthController
 * Controller pour gérer les endpoints d'authentification
 */

import type { Request, Response, NextFunction } from "express";
import type { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from "@clubmanager/types";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase.js";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase.js";
import { RefreshTokenUseCase } from "../../application/use-cases/RefreshTokenUseCase.js";
import { LogoutUseCase } from "../../application/use-cases/LogoutUseCase.js";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private logoutUseCase: LogoutUseCase;

  constructor(authRepository: IAuthRepository) {
    this.registerUseCase = new RegisterUseCase(authRepository);
    this.loginUseCase = new LoginUseCase(authRepository);
    this.refreshTokenUseCase = new RefreshTokenUseCase(authRepository);
    this.logoutUseCase = new LogoutUseCase(authRepository);
  }

  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: RegisterDto = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        nom_utilisateur: req.body.nom_utilisateur,
        email: req.body.email,
        password: req.body.password,
        date_of_birth: req.body.date_of_birth,
        genre_id: req.body.genre_id,
        abonnement_id: req.body.abonnement_id,
      };

      const result = await this.registerUseCase.execute(dto);

      // Définir le refresh token dans un cookie HTTP-only
      res.cookie("refreshToken", result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.data.user,
          accessToken: result.data.tokens.accessToken,
          expiresIn: result.data.tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/login
   * Connexion d'un utilisateur
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto: LoginDto = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await this.loginUseCase.execute(dto);

      // Définir le refresh token dans un cookie HTTP-only
      res.cookie("refreshToken", result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.data.user,
          accessToken: result.data.tokens.accessToken,
          expiresIn: result.data.tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/refresh
   * Renouvellement du token d'accès
   */
  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Récupérer le refresh token depuis le cookie ou le body
      const refreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const dto: RefreshTokenDto = {
        refreshToken,
      };

      const result = await this.refreshTokenUseCase.execute(dto);

      // Mettre à jour le refresh token dans le cookie
      res.cookie("refreshToken", result.data.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.data.user,
          accessToken: result.data.tokens.accessToken,
          expiresIn: result.data.tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/logout
   * Déconnexion d'un utilisateur
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Récupérer le refresh token depuis le cookie ou le body
      const refreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const dto: LogoutDto = {
        refreshToken,
      };

      const result = await this.logoutUseCase.execute(dto);

      // Supprimer le cookie du refresh token
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/logout-all
   * Déconnexion de tous les appareils
   */
  logoutAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.body.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const result = await this.logoutUseCase.logoutAllDevices(userId);

      // Supprimer le cookie du refresh token
      res.clearCookie("refreshToken");

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/me
   * Récupère les informations de l'utilisateur connecté
   */
  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // L'utilisateur est déjà attaché à req par le middleware d'authentification
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
