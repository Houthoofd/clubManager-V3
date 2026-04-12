/**
 * CategoryController
 * Controller pour gérer les endpoints des catégories
 * Instantiation des use cases au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLCategoryRepository } from "../../infrastructure/repositories/MySQLCategoryRepository.js";
import { GetCategoriesUseCase } from "../../application/use-cases/categories/GetCategoriesUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLCategoryRepository();
const getCategoriesUC = new GetCategoriesUseCase(repo);

// ==================== CONTROLLER ====================

export class CategoryController {
  /**
   * GET /api/store/categories
   * Retourne toutes les catégories avec compteurs d'articles
   */
  async getCategories(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await getCategoriesUC.execute();
      res.json({
        success: true,
        message: "Catégories récupérées",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[CategoryController.getCategories]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/categories/:id
   * Retourne une catégorie par son ID
   */
  async getCategoryById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await repo.findById(id);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Catégorie introuvable",
        });
        return;
      }

      res.json({
        success: true,
        message: "Catégorie récupérée",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[CategoryController.getCategoryById]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/categories
   * Crée une nouvelle catégorie
   */
  async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nom, description, ordre } = req.body;

      if (!nom || nom.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Le nom de la catégorie est requis",
        });
        return;
      }

      const id = await repo.create({
        nom: nom.trim(),
        description: description ?? null,
        ordre: ordre ?? 0,
      });

      const category = await repo.findById(id);

      res.status(201).json({
        success: true,
        message: "Catégorie créée",
        data: category,
      });
    } catch (error: unknown) {
      console.error("[CategoryController.createCategory]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * PUT /api/store/categories/:id
   * Met à jour une catégorie existante
   */
  async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { nom, description, ordre } = req.body;

      // Vérifier que la catégorie existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Catégorie introuvable",
        });
        return;
      }

      await repo.update(id, {
        nom: nom !== undefined ? nom.trim() : undefined,
        description: description !== undefined ? description : undefined,
        ordre: ordre !== undefined ? Number(ordre) : undefined,
      });

      const updated = await repo.findById(id);

      res.json({
        success: true,
        message: "Catégorie mise à jour",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[CategoryController.updateCategory]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * DELETE /api/store/categories/:id
   * Supprime une catégorie
   */
  async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      // Vérifier que la catégorie existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Catégorie introuvable",
        });
        return;
      }

      await repo.delete(id);

      res.json({
        success: true,
        message: "Catégorie supprimée",
      });
    } catch (error: unknown) {
      console.error("[CategoryController.deleteCategory]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/categories/reorder
   * Réorganise l'ordre des catégories en masse
   * Body: { categories: [{ id: number, ordre: number }] }
   */
  async reorderCategories(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { categories } = req.body;

      if (!Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({
          success: false,
          message: "Le tableau de catégories est requis",
        });
        return;
      }

      await repo.reorder(categories);

      res.json({
        success: true,
        message: "Ordre des catégories mis à jour",
      });
    } catch (error: unknown) {
      console.error("[CategoryController.reorderCategories]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
