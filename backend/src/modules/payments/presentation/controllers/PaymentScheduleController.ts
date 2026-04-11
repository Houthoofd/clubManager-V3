/**
 * PaymentScheduleController
 * Controller pour gérer les endpoints des échéances de paiement
 * Consultation des échéances, détection des retards et marquage comme payé
 * Instantiation des use cases au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLPaymentScheduleRepository } from "../../infrastructure/repositories/MySQLPaymentScheduleRepository.js";
import { MySQLPaymentRepository } from "../../infrastructure/repositories/MySQLPaymentRepository.js";
import { GetSchedulesUseCase } from "../../application/use-cases/schedules/GetSchedulesUseCase.js";
import { GetUserSchedulesUseCase } from "../../application/use-cases/schedules/GetUserSchedulesUseCase.js";
import { GetOverdueSchedulesUseCase } from "../../application/use-cases/schedules/GetOverdueSchedulesUseCase.js";
import { MarkScheduleAsPaidUseCase } from "../../application/use-cases/schedules/MarkScheduleAsPaidUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const scheduleRepo = new MySQLPaymentScheduleRepository();
const paymentRepo = new MySQLPaymentRepository();
const getSchedulesUC = new GetSchedulesUseCase(scheduleRepo);
const getUserSchedulesUC = new GetUserSchedulesUseCase(scheduleRepo);
const getOverdueSchedulesUC = new GetOverdueSchedulesUseCase(scheduleRepo);
const markAsPaidUC = new MarkScheduleAsPaidUseCase(scheduleRepo, paymentRepo);

// ==================== CONTROLLER ====================

export class PaymentScheduleController {
  /**
   * GET /api/payments/schedules
   * Retourne la liste paginée des échéances avec filtres optionnels
   * Query params : user_id?, statut?, overdue?, page?, limit?
   */
  async getSchedules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        statut: req.query.statut as string | undefined,
        overdue: req.query.overdue === "true",
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await getSchedulesUC.execute(query);
      res.json({
        success: true,
        message: "Échéances récupérées",
        data: result,
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
   * GET /api/payments/schedules/user/:userId
   * Retourne toutes les échéances d'un utilisateur spécifique, triées par date croissante
   */
  async getUserSchedules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const result = await getUserSchedulesUC.execute(userId);
      res.json({
        success: true,
        message: "Échéances utilisateur récupérées",
        data: result,
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
   * GET /api/payments/schedules/overdue
   * Retourne toutes les échéances en retard (date dépassée, statut 'en_attente')
   */
  async getOverdueSchedules(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await getOverdueSchedulesUC.execute();
      res.json({
        success: true,
        message: "Échéances en retard récupérées",
        data: result,
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
   * PATCH /api/payments/schedules/:id/pay
   * Marque une échéance comme payée
   * Si paiement_id est fourni, lie l'échéance à ce paiement existant
   * Sinon, crée automatiquement un paiement (espèces) associé
   * Body : { paiement_id? }
   */
  async markAsPaid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scheduleId = Number(req.params.id);
      const paiementId = req.body.paiement_id
        ? Number(req.body.paiement_id)
        : undefined;

      await markAsPaidUC.execute(scheduleId, paiementId);
      res.json({ success: true, message: "Échéance marquée comme payée" });
    } catch (error: any) {
      const status = error.message.includes("introuvable")
        ? 404
        : error.message.includes("déjà") || error.message.includes("annulée")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}
