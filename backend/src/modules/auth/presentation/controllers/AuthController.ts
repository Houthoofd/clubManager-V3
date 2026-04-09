/**
 * AuthController
 * Controller pour gérer les endpoints d'authentification
 */

import type { Request, Response, NextFunction } from "express";
import type {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  VerifyEmailInput,
  ResendVerificationEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from "@clubmanager/types";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase.js";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase.js";
import { RefreshTokenUseCase } from "../../application/use-cases/RefreshTokenUseCase.js";
import { LogoutUseCase } from "../../application/use-cases/LogoutUseCase.js";
import { VerifyEmailUseCase } from "../../application/use-cases/VerifyEmailUseCase.js";
import { ResendVerificationEmailUseCase } from "../../application/use-cases/ResendVerificationEmailUseCase.js";
import { RequestPasswordResetUseCase } from "../../application/use-cases/RequestPasswordResetUseCase.js";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase.js";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private logoutUseCase: LogoutUseCase;
  private verifyEmailUseCase: VerifyEmailUseCase;
  private resendVerificationEmailUseCase: ResendVerificationEmailUseCase;
  private requestPasswordResetUseCase: RequestPasswordResetUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;

  constructor(authRepository: IAuthRepository) {
    this.registerUseCase = new RegisterUseCase(authRepository);
    this.loginUseCase = new LoginUseCase(authRepository);
    this.refreshTokenUseCase = new RefreshTokenUseCase(authRepository);
    this.logoutUseCase = new LogoutUseCase(authRepository);
    this.verifyEmailUseCase = new VerifyEmailUseCase(authRepository);
    this.resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      authRepository,
    );
    this.requestPasswordResetUseCase = new RequestPasswordResetUseCase(
      authRepository,
    );
    this.resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
  }

  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
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

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          userId: result.data.userId,
          email: result.data.email,
          firstName: result.data.firstName,
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
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: LoginDto = {
        userId: req.body.userId,
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
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Récupérer le refresh token depuis le cookie ou le body
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

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
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Récupérer le refresh token depuis le cookie ou le body
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

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
    next: NextFunction,
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
    next: NextFunction,
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

  /**
   * POST /api/auth/verify-email
   * Vérification de l'email d'un utilisateur
   */
  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: VerifyEmailInput = {
        token: req.body.token,
      };

      const result = await this.verifyEmailUseCase.execute(input);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/resend-verification
   * Renvoi de l'email de vérification
   */
  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: ResendVerificationEmailInput = {
        email: req.body.email,
      };

      const result = await this.resendVerificationEmailUseCase.execute(input);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/forgot-password
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: RequestPasswordResetInput = {
        email: req.body.email,
      };

      // Récupérer l'IP et user agent pour audit/rate limiting
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get("user-agent");

      const result = await this.requestPasswordResetUseCase.execute(
        input,
        ipAddress,
        userAgent,
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/reset-password
   * Réinitialisation du mot de passe
   */
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: ResetPasswordInput = {
        token: req.body.token,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword,
      };

      const result = await this.resetPasswordUseCase.execute(input);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
