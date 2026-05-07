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
import { MySQLPricingPlanRepository } from "../../infrastructure/repositories/MySQLPricingPlanRepository.js";
import { MySQLUserRepository } from "../../../users/infrastructure/repositories/MySQLUserRepository.js";
import { CreateScheduleUseCase } from "../../application/use-cases/schedules/CreateScheduleUseCase.js";
import { GenerateSchedulesUseCase } from "../../application/use-cases/schedules/GenerateSchedulesUseCase.js";
import { DeleteScheduleUseCase } from "../../application/use-cases/schedules/DeleteScheduleUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const scheduleRepo = new MySQLPaymentScheduleRepository();
const paymentRepo = new MySQLPaymentRepository();
const planRepo = new MySQLPricingPlanRepository();
const userRepo = new MySQLUserRepository();

const getSchedulesUC = new GetSchedulesUseCase(scheduleRepo);
const getUserSchedulesUC = new GetUserSchedulesUseCase(scheduleRepo);
const getOverdueSchedulesUC = new GetOverdueSchedulesUseCase(scheduleRepo);
const markAsPaidUC = new MarkScheduleAsPaidUseCase(scheduleRepo, paymentRepo);
const createScheduleUC = new CreateScheduleUseCase(scheduleRepo);
const generateSchedulesUC = new GenerateSchedulesUseCase(
  scheduleRepo,
  planRepo,
  userRepo,
);
const deleteScheduleUC = new DeleteScheduleUseCase(scheduleRepo);

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
      console.error("[PaymentScheduleController.getSchedules]", error);
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
      console.error("[PaymentScheduleController.getUserSchedules]", error);
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
      console.error("[PaymentScheduleController.getOverdueSchedules]", error);
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

  /**
   * POST /api/payments/schedules
   * Crée manuellement une nouvelle échéance (admin)
   * Body : { user_id, montant, date_echeance, plan_tarifaire_id? }
   */
  async createSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { user_id, montant, date_echeance, plan_tarifaire_id } = req.body;
      const id = await createScheduleUC.execute({
        user_id: Number(user_id),
        montant: Number(montant),
        date_echeance,
        plan_tarifaire_id: plan_tarifaire_id ? Number(plan_tarifaire_id) : null,
      });
      res
        .status(201)
        .json({ success: true, message: "Échéance créée", data: { id } });
    } catch (error: any) {
      const status =
        error.message.includes("requis") || error.message.includes("supérieur")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/payments/schedules/generate/:userId
   * Génère automatiquement les échéances d'un utilisateur selon son plan tarifaire
   */
  async generateSchedules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const ids = await generateSchedulesUC.execute(userId);
      res.status(201).json({
        success: true,
        message: `${ids.length} échéance(s) générée(s)`,
        data: { generated: ids.length, ids },
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable")
        ? 404
        : error.message.includes("pas de plan")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/payments/schedules/:id
   * Supprime une échéance (admin, statut != paye)
   */
  async deleteSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await deleteScheduleUC.execute(id);
      res.json({ success: true, message: "Échéance supprimée" });
    } catch (error: any) {
      const status = error.message.includes("introuvable")
        ? 404
        : error.message.includes("payée")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}
