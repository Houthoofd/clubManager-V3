/**
 * reservationRoutes.ts
 * Routes Express pour le module réservations
 *
 * ORDERING NOTE: Express matches routes in definition order.
 * Fixed-path routes (/my, /course/:coursId) MUST be declared before
 * wildcard routes (/:id/cancel) to prevent shadowing.
 */

import { Router } from "express";
import { ReservationController } from "../controllers/ReservationController.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";

const router = Router();
const ctrl = new ReservationController();

// All reservation routes require authentication
router.use(authMiddleware);

// ==================== FIXED PATHS ====================
// Declared before wildcard paths to avoid Express route shadowing.

/**
 * GET /api/reservations
 * Récupère les réservations avec filtres optionnels.
 * - Admin / Professor : filtres libres (cours_id, user_id, statut, page, limit)
 * - Member            : restreint à ses propres réservations
 */
router.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.getReservations(req as AuthRequest, res),
);

/**
 * GET /api/reservations/my
 * Raccourci : retourne les réservations de l'utilisateur connecté,
 * quel que soit son rôle.
 * Implémenté via un handler inline qui force user_id dans les query params
 * avant de déléguer à getReservations.
 */
router.get(
  "/my",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => {
    const authReq = req as AuthRequest;
    // Force user_id to the current authenticated user so that getReservations
    // always returns only their own reservations on this route, regardless of role.
    (authReq.query as Record<string, unknown>).user_id = String(
      authReq.user!.userId,
    );
    ctrl.getReservations(authReq, res);
  },
);

/**
 * GET /api/reservations/course/:coursId
 * Récupère toutes les réservations d'un cours donné.
 * Réservé aux admins et professeurs.
 */
router.get(
  "/course/:coursId",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getCourseReservations(req as AuthRequest, res),
);

// ==================== ACTION ROUTES ====================

/**
 * POST /api/reservations
 * Crée une réservation.
 * Tous les utilisateurs authentifiés peuvent réserver pour eux-mêmes.
 * Les admins peuvent réserver pour d'autres via body.user_id.
 */
router.post(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.createReservation(req as AuthRequest, res),
);

// ==================== WILDCARD PATHS ====================
// Declared last to avoid shadowing the fixed paths above.

/**
 * PATCH /api/reservations/:id/cancel
 * Annule une réservation.
 * Un membre ne peut annuler que ses propres réservations.
 * Un admin peut annuler n'importe quelle réservation.
 */
router.patch(
  "/:id/cancel",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.cancelReservation(req as AuthRequest, res),
);

export default router;
