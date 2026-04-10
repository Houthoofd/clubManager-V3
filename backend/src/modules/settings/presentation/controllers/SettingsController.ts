/**
 * SettingsController
 * Controller pour gérer les endpoints des paramètres du club (admin)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLInformationRepository } from "../../infrastructure/repositories/MySQLInformationRepository.js";
import { GetInformationsUseCase } from "../../application/use-cases/GetInformationsUseCase.js";
import { GetInformationByKeyUseCase } from "../../application/use-cases/GetInformationByKeyUseCase.js";
import { UpsertInformationUseCase } from "../../application/use-cases/UpsertInformationUseCase.js";
import { BulkUpsertInformationsUseCase } from "../../application/use-cases/BulkUpsertInformationsUseCase.js";

// Instantiate at module level (same pattern as UserController)
const repo = new MySQLInformationRepository();
const getInformationsUC = new GetInformationsUseCase(repo);
const getInformationByKeyUC = new GetInformationByKeyUseCase(repo);
const upsertInformationUC = new UpsertInformationUseCase(repo);
const bulkUpsertInformationsUC = new BulkUpsertInformationsUseCase(repo);

export class SettingsController {
  /**
   * GET /api/settings
   * Retourne la liste paginée des paramètres avec filtres optionnels (admin + professor)
   */
  async getSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = {
        search: req.query.search as string | undefined,
        cle: req.query.cle as string | undefined,
        sort_by:
          (req.query.sort_by as "cle" | "updated_at" | undefined) ?? "cle",
        sort_order:
          (req.query.sort_order as "asc" | "desc" | undefined) ?? "asc",
        page: req.query.page ? Math.max(1, Number(req.query.page)) : 1,
        limit: req.query.limit
          ? Math.min(100, Math.max(1, Number(req.query.limit)))
          : 20,
      };

      const result = await getInformationsUC.execute(query);
      res.json({
        success: true,
        message: "Paramètres récupérés",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Erreur serveur",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/settings/key/:cle
   * Retourne un paramètre par sa clé unique (admin + professor)
   */
  async getSettingByKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cle = req.params.cle as string;
      const result = await getInformationByKeyUC.execute(cle);
      res.json({ success: true, message: "Paramètre récupéré", data: result });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/settings/key/:cle
   * Crée ou met à jour un paramètre par sa clé (admin seulement)
   * Body: { valeur: string, description?: string }
   */
  async upsertSetting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cle = req.params.cle as string;
      const { valeur, description } = req.body;

      if (!valeur) {
        res
          .status(400)
          .json({ success: false, message: "La valeur est requise" });
        return;
      }

      const result = await upsertInformationUC.execute({
        cle,
        valeur,
        description,
      });
      res.json({
        success: true,
        message: "Paramètre sauvegardé",
        data: result,
      });
    } catch (error: any) {
      const status =
        error.message.includes("requis") || error.message.includes("dépasser")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/settings/bulk
   * Upsert en masse de plusieurs paramètres (admin seulement)
   * Body: { informations: Array<{ cle: string, valeur: string, description?: string }> }
   */
  async bulkUpsertSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { informations } = req.body;

      if (!Array.isArray(informations)) {
        res.status(400).json({
          success: false,
          message: "Le champ 'informations' doit être un tableau",
        });
        return;
      }

      const result = await bulkUpsertInformationsUC.execute(informations);
      res.json({
        success: true,
        message: `${result.length} paramètre(s) sauvegardé(s)`,
        data: result,
      });
    } catch (error: any) {
      const status =
        error.message.includes("Au moins") ||
        error.message.includes("plus de") ||
        error.message.includes("requis") ||
        error.message.includes("valide")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/settings/:id
   * Supprime un paramètre par son ID (admin seulement)
   */
  async deleteSetting(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }

      const existing = await repo.findById(id);
      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "Paramètre introuvable" });
        return;
      }

      await repo.delete(id);
      res.json({ success: true, message: "Paramètre supprimé" });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Erreur serveur",
        error: "INTERNAL_ERROR",
      });
    }
  }
}

export const settingsController = new SettingsController();
