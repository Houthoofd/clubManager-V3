/**
 * authRoutes
 * Routes pour l'authentification
 */

import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { MySQLAuthRepository } from "../../infrastructure/repositories/MySQLAuthRepository.js";
import { authMiddleware } from "@/shared/middleware/authMiddleware.js";

// Créer le router
const router = Router();

// Initialiser le repository et le controller
const authRepository = new MySQLAuthRepository();
const authController = new AuthController(authRepository);

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renouvellement du token d'accès
 * @access  Public (nécessite un refresh token valide)
 */
router.post("/refresh", authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Public (nécessite un refresh token)
 */
router.post("/logout", authController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Déconnexion de tous les appareils
 * @access  Private (nécessite authentification)
 */
router.post("/logout-all", authMiddleware, authController.logoutAll);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Vérification de l'email d'un utilisateur
 * @access  Public
 */
router.post("/verify-email", authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Renvoi de l'email de vérification
 * @access  Public
 */
router.post("/resend-verification", authController.resendVerification);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demande de réinitialisation de mot de passe
 * @access  Public
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialisation du mot de passe
 * @access  Public
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Récupère les informations de l'utilisateur connecté
 * @access  Private (nécessite authentification)
 */
router.get("/me", authMiddleware, authController.me);

/**
 * @route   GET /api/auth/sessions
 * @desc    Sessions actives de l'utilisateur
 * @access  Private
 */
router.get("/sessions", authMiddleware, (req, res) =>
  authController.getSessions(req as any, res),
);

/**
 * @route   DELETE /api/auth/sessions/:id
 * @desc    Révoque une session spécifique
 * @access  Private
 */
router.delete("/sessions/:id", authMiddleware, (req, res) =>
  authController.revokeSession(req as any, res),
);

/**
 * @route   POST /api/auth/change-email
 * @desc    Demande de changement d'email (envoie un token au nouvel email)
 * @access  Private
 */
router.post("/change-email", authMiddleware, (req, res) =>
  authController.requestEmailChange(req as any, res),
);

/**
 * @route   POST /api/auth/confirm-email-change
 * @desc    Confirme le changement d'email via token
 * @access  Public
 */
router.post("/confirm-email-change", authController.confirmEmailChange);

/**
 * @route   GET /api/auth/health
 * @desc    Health check pour l'API d'authentification
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API is healthy",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/auth/audit/login-attempts
 * @desc    Liste les tentatives de connexion (admin)
 * @access  Private + Admin
 */
router.get("/audit/login-attempts", authMiddleware, (req, res) =>
  authController.getLoginAttempts(req as any, res),
);

/**
 * @route   GET /api/auth/audit/auth-attempts
 * @desc    Liste les tentatives d'authentification générales (admin)
 * @access  Private + Admin
 */
router.get("/audit/auth-attempts", authMiddleware, (req, res) =>
  authController.getAuthAttempts(req as any, res),
);

export default router;
