/**
 * StockController
 * Controller pour gérer les endpoints des stocks
 * Gère la consultation et l'ajustement des stocks
 * Instantiation au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLStockRepository } from "../../infrastructure/repositories/MySQLStockRepository.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLStockRepository();

// ==================== CONTROLLER ====================

export class StockController {
  /**
   * GET /api/store/stocks
   * Retourne la liste des stocks avec infos enrichies
   * Query param optionnel: article_id
   */
  async getStocks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articleId = req.query.article_id
        ? Number(req.query.article_id)
        : undefined;

      const result = await repo.findAll(articleId);

      res.json({
        success: true,
        message: "Stocks récupérés",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[StockController.getStocks]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/stocks/low
   * Retourne les stocks bas (quantite <= quantite_minimum)
   * Pour les alertes d'approvisionnement
   */
  async getLowStocks(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await repo.findLowStock();

      res.json({
        success: true,
        message: "Stocks bas récupérés",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[StockController.getLowStocks]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/stocks/article/:articleId
   * Retourne tous les stocks d'un article spécifique (toutes les tailles)
   */
  async getArticleStocks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articleId = Number(req.params.articleId);

      const result = await repo.findByArticleId(articleId);

      res.json({
        success: true,
        message: "Stocks de l'article récupérés",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[StockController.getArticleStocks]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * PUT /api/store/stocks/:id
   * Met à jour un stock existant
   * Body: { quantite?, quantite_minimum? }
   */
  async updateStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { quantite, quantite_minimum } = req.body;

      // Vérifier que le stock existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Stock introuvable",
        });
        return;
      }

      // Validation
      if (quantite !== undefined) {
        const qty = Number(quantite);
        if (isNaN(qty) || qty < 0) {
          res.status(400).json({
            success: false,
            message: "La quantité doit être un nombre positif ou nul",
          });
          return;
        }
      }

      if (quantite_minimum !== undefined) {
        const qtyMin = Number(quantite_minimum);
        if (isNaN(qtyMin) || qtyMin < 0) {
          res.status(400).json({
            success: false,
            message: "La quantité minimum doit être un nombre positif ou nul",
          });
          return;
        }
      }

      await repo.update(id, {
        quantite: quantite !== undefined ? Number(quantite) : undefined,
        quantite_minimum:
          quantite_minimum !== undefined ? Number(quantite_minimum) : undefined,
      });

      const updated = await repo.findById(id);

      res.json({
        success: true,
        message: "Stock mis à jour",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[StockController.updateStock]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/stocks/:id/adjust
   * Ajuste la quantité d'un stock (+/-)
   * Enregistre un mouvement de stock
   * Body: { quantite: number (delta, peut être négatif), motif?: string }
   */
  async adjustStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.userId;
      const { quantite, motif } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Non authentifié",
        });
        return;
      }

      // Vérifier que le stock existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Stock introuvable",
        });
        return;
      }

      // Validation
      if (quantite === undefined || quantite === null) {
        res.status(400).json({
          success: false,
          message: "La quantité d'ajustement est requise",
        });
        return;
      }

      const delta = Number(quantite);
      if (isNaN(delta) || delta === 0) {
        res.status(400).json({
          success: false,
          message:
            "La quantité d'ajustement doit être un nombre différent de zéro",
        });
        return;
      }

      // Vérifier que l'ajustement ne rendrait pas le stock négatif
      const newQuantity = existing.quantite + delta;
      if (newQuantity < 0) {
        res.status(400).json({
          success: false,
          message: `Ajustement impossible : le stock ne peut pas être négatif (actuel: ${existing.quantite}, ajustement: ${delta})`,
        });
        return;
      }

      // Effectuer l'ajustement
      await repo.adjustQuantity(
        id,
        delta,
        motif || "Ajustement manuel",
        userId,
      );

      const updated = await repo.findById(id);

      res.json({
        success: true,
        message: "Stock ajusté",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[StockController.adjustStock]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
