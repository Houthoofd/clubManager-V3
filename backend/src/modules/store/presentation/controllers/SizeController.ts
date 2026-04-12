/**
 * SizeController
 * Controller pour gérer les endpoints des tailles
 * Instantiation au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLSizeRepository } from "../../infrastructure/repositories/MySQLSizeRepository.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLSizeRepository();

// ==================== CONTROLLER ====================

export class SizeController {
  /**
   * GET /api/store/sizes
   * Retourne toutes les tailles triées par ordre
   */
  async getSizes(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await repo.findAll();
      res.json({
        success: true,
        message: "Tailles récupérées",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[SizeController.getSizes]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/sizes/:id
   * Retourne une taille par son ID
   */
  async getSizeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await repo.findById(id);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Taille introuvable",
        });
        return;
      }

      res.json({
        success: true,
        message: "Taille récupérée",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[SizeController.getSizeById]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/sizes
   * Crée une nouvelle taille
   */
  async createSize(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nom, ordre } = req.body;

      if (!nom || nom.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Le nom de la taille est requis",
        });
        return;
      }

      const id = await repo.create({
        nom: nom.trim(),
        ordre: ordre ?? 0,
      });

      const size = await repo.findById(id);

      res.status(201).json({
        success: true,
        message: "Taille créée",
        data: size,
      });
    } catch (error: unknown) {
      console.error("[SizeController.createSize]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * PUT /api/store/sizes/:id
   * Met à jour une taille existante
   */
  async updateSize(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { nom, ordre } = req.body;

      // Vérifier que la taille existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Taille introuvable",
        });
        return;
      }

      await repo.update(id, {
        nom: nom !== undefined ? nom.trim() : undefined,
        ordre: ordre !== undefined ? Number(ordre) : undefined,
      });

      const updated = await repo.findById(id);

      res.json({
        success: true,
        message: "Taille mise à jour",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[SizeController.updateSize]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * DELETE /api/store/sizes/:id
   * Supprime une taille
   */
  async deleteSize(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      // Vérifier que la taille existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Taille introuvable",
        });
        return;
      }

      await repo.delete(id);

      res.json({
        success: true,
        message: "Taille supprimée",
      });
    } catch (error: unknown) {
      console.error("[SizeController.deleteSize]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
