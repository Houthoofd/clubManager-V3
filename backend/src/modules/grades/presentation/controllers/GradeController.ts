/**
 * GradeController
 * Controller pour gérer les endpoints CRUD des grades/ceintures (Presentation Layer)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLGradeRepository } from "../../infrastructure/repositories/MySQLGradeRepository.js";
import { GetGradesUseCase } from "../../application/use-cases/GetGradesUseCase.js";
import { GetGradeByIdUseCase } from "../../application/use-cases/GetGradeByIdUseCase.js";
import { CreateGradeUseCase } from "../../application/use-cases/CreateGradeUseCase.js";
import { UpdateGradeUseCase } from "../../application/use-cases/UpdateGradeUseCase.js";
import { DeleteGradeUseCase } from "../../application/use-cases/DeleteGradeUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLGradeRepository();
const getGradesUC = new GetGradesUseCase(repo);
const getGradeByIdUC = new GetGradeByIdUseCase(repo);
const createGradeUC = new CreateGradeUseCase(repo);
const updateGradeUC = new UpdateGradeUseCase(repo);
const deleteGradeUC = new DeleteGradeUseCase(repo);

// ==================== CONTROLLER ====================

export class GradeController {
  /**
   * GET /api/grades
   * Retourne la liste complète des grades triés par ordre croissant.
   * Accessible à tous les utilisateurs authentifiés (données de référence).
   */
  async getGrades(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const grades = await getGradesUC.execute();
      res.json({
        success: true,
        message: "Grades récupérés",
        data: grades,
      });
    } catch (error: unknown) {
      console.error("[GradeController.getGrades]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * GET /api/grades/:id
   * Retourne un grade par son ID.
   * Accessible à tous les utilisateurs authentifiés.
   */
  async getGradeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const grade = await getGradeByIdUC.execute(id);
      res.json({
        success: true,
        message: "Grade récupéré",
        data: grade,
      });
    } catch (error: unknown) {
      console.error("[GradeController.getGradeById]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * POST /api/grades
   * Crée un nouveau grade.
   * Réservé aux administrateurs.
   */
  async createGrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const grade = await createGradeUC.execute({
        nom: req.body.nom,
        ordre: req.body.ordre,
        couleur: req.body.couleur,
      });
      res.status(201).json({
        success: true,
        message: "Grade créé",
        data: grade,
      });
    } catch (error: unknown) {
      console.error("[GradeController.createGrade]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status =
        message.includes("requis") || message.includes("entier")
          ? 400
          : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * PUT /api/grades/:id
   * Met à jour partiellement un grade existant.
   * Réservé aux administrateurs.
   * L'id est extrait des paramètres de route et fusionné dans le DTO.
   */
  async updateGrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const grade = await updateGradeUC.execute({ ...req.body, id });
      res.json({
        success: true,
        message: "Grade mis à jour",
        data: grade,
      });
    } catch (error: unknown) {
      console.error("[GradeController.updateGrade]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable")
        ? 404
        : message.includes("requis") || message.includes("entier") || message.includes(">= 0")
        ? 400
        : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/grades/:id
   * Supprime un grade.
   * Réservé aux administrateurs.
   * Retourne 409 si le grade est référencé par des membres ou des professeurs actifs.
   */
  async deleteGrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await deleteGradeUC.execute(id);
      res.json({
        success: true,
        message: "Grade supprimé",
      });
    } catch (error: unknown) {
      console.error("[GradeController.deleteGrade]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable")
        ? 404
        : message.includes("utilisé par")
        ? 409
        : 500;
      res.status(status).json({ success: false, message });
    }
  }
}
