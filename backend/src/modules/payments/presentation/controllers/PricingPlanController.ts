/**
 * PricingPlanController
 * Controller pour gérer les endpoints des plans tarifaires (CRUD complet)
 * Instantiation des use cases au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLPricingPlanRepository } from "../../infrastructure/repositories/MySQLPricingPlanRepository.js";
import { GetPricingPlansUseCase } from "../../application/use-cases/plans/GetPricingPlansUseCase.js";
import { GetPricingPlanByIdUseCase } from "../../application/use-cases/plans/GetPricingPlanByIdUseCase.js";
import { CreatePricingPlanUseCase } from "../../application/use-cases/plans/CreatePricingPlanUseCase.js";
import { UpdatePricingPlanUseCase } from "../../application/use-cases/plans/UpdatePricingPlanUseCase.js";
import { TogglePricingPlanUseCase } from "../../application/use-cases/plans/TogglePricingPlanUseCase.js";
import { DeletePricingPlanUseCase } from "../../application/use-cases/plans/DeletePricingPlanUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLPricingPlanRepository();
const getPlansUC = new GetPricingPlansUseCase(repo);
const getPlanByIdUC = new GetPricingPlanByIdUseCase(repo);
const createPlanUC = new CreatePricingPlanUseCase(repo);
const updatePlanUC = new UpdatePricingPlanUseCase(repo);
const togglePlanUC = new TogglePricingPlanUseCase(repo);
const deletePlanUC = new DeletePricingPlanUseCase(repo);

// ==================== CONTROLLER ====================

export class PricingPlanController {
  /**
   * GET /api/payments/plans
   * Retourne tous les plans tarifaires
   * Query param optionnel : actif=true|false pour filtrer par statut
   */
  async getPlans(req: AuthRequest, res: Response): Promise<void> {
    try {
      const actif =
        req.query.actif !== undefined
          ? req.query.actif === "true"
          : undefined;

      const result = await getPlansUC.execute(actif);
      res.json({
        success: true,
        message: "Plans tarifaires récupérés",
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
   * GET /api/payments/plans/:id
   * Retourne un plan tarifaire par son ID
   */
  async getPlanById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await getPlanByIdUC.execute(id);
      res.json({
        success: true,
        message: "Plan tarifaire récupéré",
        data: result,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/payments/plans
   * Crée un nouveau plan tarifaire
   * Body : { nom, description?, prix, duree_mois }
   */
  async createPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nom, description, prix, duree_mois } = req.body;

      const id = await createPlanUC.execute({
        nom,
        description: description ?? null,
        prix: Number(prix),
        duree_mois: Number(duree_mois),
      });

      const plan = await getPlanByIdUC.execute(id);
      res.status(201).json({
        success: true,
        message: "Plan tarifaire créé",
        data: plan,
      });
    } catch (error: any) {
      const status =
        error.message.includes("requis") ||
        error.message.includes("supérieur")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/payments/plans/:id
   * Met à jour un plan tarifaire existant (mise à jour partielle)
   * Body : { nom?, description?, prix?, duree_mois? }
   */
  async updatePlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { nom, description, prix, duree_mois } = req.body;

      const updateData: {
        nom?: string;
        description?: string | null;
        prix?: number;
        duree_mois?: number;
      } = {};

      if (nom !== undefined) updateData.nom = nom;
      if (description !== undefined) updateData.description = description;
      if (prix !== undefined) updateData.prix = Number(prix);
      if (duree_mois !== undefined) updateData.duree_mois = Number(duree_mois);

      await updatePlanUC.execute(id, updateData);

      const plan = await getPlanByIdUC.execute(id);
      res.json({
        success: true,
        message: "Plan tarifaire mis à jour",
        data: plan,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable")
        ? 404
        : error.message.includes("supérieur") ||
            error.message.includes("vide")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/payments/plans/:id/toggle
   * Active ou désactive un plan tarifaire (inverse l'état courant)
   */
  async togglePlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const plan = await togglePlanUC.execute(id);
      const msg = plan.actif
        ? "Plan tarifaire activé"
        : "Plan tarifaire désactivé";
      res.json({ success: true, message: msg, data: plan });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/payments/plans/:id
   * Supprime définitivement un plan tarifaire
   */
  async deletePlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await deletePlanUC.execute(id);
      res.json({ success: true, message: "Plan tarifaire supprimé" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}
