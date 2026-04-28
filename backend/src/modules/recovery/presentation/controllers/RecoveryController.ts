/**
 * RecoveryController
 * Controller pour gérer les endpoints des demandes de récupération manuelle
 * Instantiation des use cases et du repository au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLRecoveryRepository } from "../../infrastructure/repositories/MySQLRecoveryRepository.js";
import { GetRecoveryRequestsUseCase } from "../../application/use-cases/GetRecoveryRequestsUseCase.js";
import { ProcessRecoveryRequestUseCase } from "../../application/use-cases/ProcessRecoveryRequestUseCase.js";
import type { RecoveryStatus } from "../../domain/types.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLRecoveryRepository();
const getRecoveryRequestsUC = new GetRecoveryRequestsUseCase(repo);
const processRecoveryRequestUC = new ProcessRecoveryRequestUseCase(repo);

// ==================== CONTROLLER ====================

export class RecoveryController {
  /**
   * GET /api/recovery
   * Retourne la liste paginée des demandes de récupération manuelle
   * Query params : status? ('pending' | 'approved' | 'rejected'), page?, limit?
   */
  async getRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rawStatus = req.query.status as string | undefined;
      const validStatuses: RecoveryStatus[] = ["pending", "approved", "rejected"];

      const status =
        rawStatus && validStatuses.includes(rawStatus as RecoveryStatus)
          ? (rawStatus as RecoveryStatus)
          : undefined;

      const query = {
        status,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await getRecoveryRequestsUC.execute(query);

      res.json({
        success: true,
        message: "Demandes de récupération récupérées",
        data: result,
      });
    } catch (error: any) {
      console.error("[RecoveryController.getRequests]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne du serveur",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * PATCH /api/recovery/:id
   * Traite une demande de récupération manuelle (approbation ou rejet)
   * Params : id (numérique)
   * Body   : { status: 'approved' | 'rejected', admin_note?: string }
   */
  async processRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!id || isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "Identifiant de demande invalide",
        });
        return;
      }

      const { status, admin_note } = req.body as {
        status?: string;
        admin_note?: string;
      };

      if (!status || (status !== "approved" && status !== "rejected")) {
        res.status(400).json({
          success: false,
          message: "Le statut doit être 'approved' ou 'rejected'",
        });
        return;
      }

      await processRecoveryRequestUC.execute({
        id,
        status,
        admin_note,
      });

      const actionLabel = status === "approved" ? "approuvée" : "rejetée";
      const message = admin_note
        ? `Demande ${actionLabel} — ${admin_note}`
        : `Demande ${actionLabel} avec succès`;

      res.json({
        success: true,
        message,
      });
    } catch (error: any) {
      console.error("[RecoveryController.processRequest]", error);

      if (
        error.message === "Demande introuvable"
      ) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      if (error.message === "Cette demande a déjà été traitée") {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne du serveur",
        error: "INTERNAL_ERROR",
      });
    }
  }
}
