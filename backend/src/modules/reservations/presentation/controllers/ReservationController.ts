/**
 * ReservationController
 * Controller pour gérer tous les endpoints du module réservations.
 * Les use cases sont instanciés au niveau module (singleton de fait).
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

import { MySQLReservationRepository } from "../../infrastructure/repositories/MySQLReservationRepository.js";
import { GetReservationsUseCase } from "../../application/use-cases/GetReservationsUseCase.js";
import { GetUserReservationsUseCase } from "../../application/use-cases/GetUserReservationsUseCase.js";
import { CreateReservationUseCase } from "../../application/use-cases/CreateReservationUseCase.js";
import { CancelReservationUseCase } from "../../application/use-cases/CancelReservationUseCase.js";

// ==================== MODULE-SCOPE INSTANTIATION ====================

const repo = new MySQLReservationRepository();

const getReservationsUC     = new GetReservationsUseCase(repo);
const getUserReservationsUC = new GetUserReservationsUseCase(repo);
const createReservationUC   = new CreateReservationUseCase(repo);
const cancelReservationUC   = new CancelReservationUseCase(repo);

// ==================== CONTROLLER ====================

export class ReservationController {
  /**
   * GET /api/reservations
   * Récupère les réservations avec filtres optionnels.
   * - Admin / Professor : accès complet aux query params (cours_id, user_id, statut, page, limit)
   * - Member            : forcé sur ses propres réservations uniquement
   */
  async getReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const role = req.user!.role_app;
      const isPrivileged =
        role === UserRole.ADMIN || role === UserRole.PROFESSOR;

      const query = {
        cours_id: req.query.cours_id ? Number(req.query.cours_id) : undefined,
        user_id: isPrivileged
          ? req.query.user_id
            ? Number(req.query.user_id)
            : undefined
          : req.user!.userId,
        statut: req.query.statut as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      } as Parameters<typeof getReservationsUC.execute>[0];

      const data = await getReservationsUC.execute(query);
      res.json({
        success: true,
        message: "Réservations récupérées",
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/reservations/course/:coursId
   * Récupère toutes les réservations d'un cours donné.
   * Réservé aux admins et professeurs.
   */
  async getCourseReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cours_id = Number(req.params.coursId);
      if (isNaN(cours_id)) {
        res.status(400).json({ success: false, message: "ID de cours invalide" });
        return;
      }

      const data = await getReservationsUC.execute({ cours_id });
      res.json({
        success: true,
        message: "Réservations du cours récupérées",
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/reservations
   * Crée une réservation.
   * - Un membre ne peut créer que pour lui-même.
   * - Un admin peut créer pour n'importe quel utilisateur via body.user_id.
   */
  async createReservation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cours_id } = req.body;

      if (!cours_id) {
        res.status(400).json({
          success: false,
          message: "cours_id est requis",
        });
        return;
      }

      const user_id: number =
        req.body.user_id != null ? Number(req.body.user_id) : req.user!.userId;

      // Non-admins cannot create reservations on behalf of another user
      const role = req.user!.role_app;
      if (role !== UserRole.ADMIN && user_id !== req.user!.userId) {
        res.status(403).json({
          success: false,
          message: "Accès refusé",
        });
        return;
      }

      const data = await createReservationUC.execute({
        user_id,
        cours_id: Number(cours_id),
      });

      res.status(201).json({
        success: true,
        message: "Réservation créée",
        data,
      });
    } catch (error: any) {
      // "déjà" → the user already has an active reservation for this course
      const status = error.message.includes("déjà") ? 409 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PATCH /api/reservations/:id/cancel
   * Annule une réservation.
   * - Un membre ne peut annuler que ses propres réservations.
   * - Un admin peut annuler n'importe quelle réservation.
   */
  async cancelReservation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }

      await cancelReservationUC.execute(
        id,
        req.user!.userId,
        req.user!.role_app ?? "",
      );

      res.json({
        success: true,
        message: "Réservation annulée",
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable")
        ? 404
        : error.message.includes("Accès")
          ? 403
          : error.message.includes("déjà")
            ? 409
            : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/reservations/user/:userId
   * Récupère les réservations d'un utilisateur spécifique.
   * - Un membre ne peut consulter que ses propres réservations.
   * - Un admin / professeur peut consulter celles de n'importe quel utilisateur.
   */
  async getUserReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.userId
        ? Number(req.params.userId)
        : req.user!.userId;

      if (isNaN(targetUserId)) {
        res.status(400).json({ success: false, message: "ID utilisateur invalide" });
        return;
      }

      // Non-privileged users can only access their own reservations
      const role = req.user!.role_app;
      const isPrivileged =
        role === UserRole.ADMIN || role === UserRole.PROFESSOR;

      if (!isPrivileged && targetUserId !== req.user!.userId) {
        res.status(403).json({
          success: false,
          message: "Accès refusé",
        });
        return;
      }

      const statut = req.query.statut as
        | Parameters<typeof getUserReservationsUC.execute>[1]
        | undefined;

      const data = await getUserReservationsUC.execute(targetUserId, statut);

      res.json({
        success: true,
        message: "Réservations de l'utilisateur récupérées",
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }
}
