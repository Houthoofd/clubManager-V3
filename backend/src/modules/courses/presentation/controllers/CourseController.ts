/**
 * CourseController
 * Controller pour gérer tous les endpoints du module courses :
 * cours récurrents, professeurs, instances de cours et inscriptions
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLCourseRepository } from "../../infrastructure/repositories/MySQLCourseRepository.js";

// Use Cases — cours récurrents
import { GetCourseRecurrentsUseCase } from "../../application/use-cases/GetCourseRecurrentsUseCase.js";
import { GetCourseRecurrentByIdUseCase } from "../../application/use-cases/GetCourseRecurrentByIdUseCase.js";
import { CreateCourseRecurrentUseCase } from "../../application/use-cases/CreateCourseRecurrentUseCase.js";
import { UpdateCourseRecurrentUseCase } from "../../application/use-cases/UpdateCourseRecurrentUseCase.js";
import { DeleteCourseRecurrentUseCase } from "../../application/use-cases/DeleteCourseRecurrentUseCase.js";

// Use Cases — professeurs
import { GetProfessorsUseCase } from "../../application/use-cases/GetProfessorsUseCase.js";
import { GetProfessorByIdUseCase } from "../../application/use-cases/GetProfessorByIdUseCase.js";
import { CreateProfessorUseCase } from "../../application/use-cases/CreateProfessorUseCase.js";
import { UpdateProfessorUseCase } from "../../application/use-cases/UpdateProfessorUseCase.js";
import { DeleteProfessorUseCase } from "../../application/use-cases/DeleteProfessorUseCase.js";

// Use Cases — cours (instances)
import { GetCoursesUseCase } from "../../application/use-cases/GetCoursesUseCase.js";
import { GetCourseByIdUseCase } from "../../application/use-cases/GetCourseByIdUseCase.js";
import { CreateCourseUseCase } from "../../application/use-cases/CreateCourseUseCase.js";
import { GenerateCoursesUseCase } from "../../application/use-cases/GenerateCoursesUseCase.js";

// Use Cases — inscriptions
import { GetCourseInscriptionsUseCase } from "../../application/use-cases/GetCourseInscriptionsUseCase.js";
import { CreateInscriptionUseCase } from "../../application/use-cases/CreateInscriptionUseCase.js";
import { BulkUpdatePresenceUseCase } from "../../application/use-cases/BulkUpdatePresenceUseCase.js";
import { DeleteInscriptionUseCase } from "../../application/use-cases/DeleteInscriptionUseCase.js";
import { GetMyEnrollmentsUseCase } from "../../application/use-cases/GetMyEnrollmentsUseCase.js";

// ==================== INSTANTIATION ====================

const repo = new MySQLCourseRepository();

// Cours récurrents
const getCourseRecurrentsUC = new GetCourseRecurrentsUseCase(repo);
const getCourseRecurrentByIdUC = new GetCourseRecurrentByIdUseCase(repo);
const createCourseRecurrentUC = new CreateCourseRecurrentUseCase(repo);
const updateCourseRecurrentUC = new UpdateCourseRecurrentUseCase(repo);
const deleteCourseRecurrentUC = new DeleteCourseRecurrentUseCase(repo);

// Professeurs
const getProfessorsUC = new GetProfessorsUseCase(repo);
const getProfessorByIdUC = new GetProfessorByIdUseCase(repo);
const createProfessorUC = new CreateProfessorUseCase(repo);
const updateProfessorUC = new UpdateProfessorUseCase(repo);
const deleteProfessorUC = new DeleteProfessorUseCase(repo);

// Cours (instances)
const getCoursesUC = new GetCoursesUseCase(repo);
const getCourseByIdUC = new GetCourseByIdUseCase(repo);
const createCourseUC = new CreateCourseUseCase(repo);
const generateCoursesUC = new GenerateCoursesUseCase(repo);

// Inscriptions
const getCourseInscriptionsUC = new GetCourseInscriptionsUseCase(repo);
const createInscriptionUC = new CreateInscriptionUseCase(repo);
const bulkUpdatePresenceUC = new BulkUpdatePresenceUseCase(repo);
const deleteInscriptionUC = new DeleteInscriptionUseCase(repo);
const getMyEnrollmentsUC = new GetMyEnrollmentsUseCase(repo);

// ==================== CONTROLLER ====================

/**
 * CourseController
 * Expose les méthodes handler Express pour chaque endpoint du module courses.
 * Toutes les instances de use cases sont créées au niveau module (singleton de fait).
 */
export class CourseController {
  // ==================== COURS RÉCURRENTS ====================

  /**
   * GET /api/courses
   * Retourne tous les cours récurrents avec leurs professeurs
   */
  async getCourseRecurrents(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await getCourseRecurrentsUC.execute();
      res.json({
        success: true,
        message: "Cours récurrents récupérés",
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
   * GET /api/courses/:id
   * Retourne un cours récurrent par son ID avec détail des professeurs
   */
  async getCourseRecurrentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const data = await getCourseRecurrentByIdUC.execute(id);
      res.json({
        success: true,
        message: "Cours récurrent récupéré",
        data,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/courses
   * Crée un nouveau cours récurrent (admin seulement)
   */
  async createCourseRecurrent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await createCourseRecurrentUC.execute(req.body);
      res.status(201).json({
        success: true,
        message: "Cours récurrent créé",
        data,
      });
    } catch (error: any) {
      const isValidation =
        error.message.includes("obligatoire") ||
        error.message.includes("invalide") ||
        error.message.includes("entier");
      res.status(isValidation ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/courses/:id
   * Met à jour un cours récurrent existant (admin seulement)
   * L'id des params est mergé dans le corps de la requête
   */
  async updateCourseRecurrent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const dto = { ...req.body, id };
      const data = await updateCourseRecurrentUC.execute(dto);
      res.json({
        success: true,
        message: "Cours récurrent mis à jour",
        data,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/courses/:id
   * Supprime un cours récurrent (admin seulement)
   */
  async deleteCourseRecurrent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      await deleteCourseRecurrentUC.execute(id);
      res.json({
        success: true,
        message: "Cours récurrent supprimé",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  // ==================== PROFESSEURS ====================

  /**
   * GET /api/courses/professors
   * Retourne la liste de tous les professeurs (admin + professor)
   */
  async getProfessors(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await getProfessorsUC.execute();
      res.json({
        success: true,
        message: "Professeurs récupérés",
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
   * POST /api/courses/professors
   * Crée un nouveau professeur (admin seulement)
   */
  async createProfessor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await createProfessorUC.execute(req.body);
      res.status(201).json({
        success: true,
        message: "Professeur créé",
        data,
      });
    } catch (error: any) {
      const isValidation = error.message.includes("obligatoire");
      res.status(isValidation ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/courses/professors/:id
   * Met à jour un professeur existant (admin seulement)
   */
  async updateProfessor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const dto = { ...req.body, id };
      const data = await updateProfessorUC.execute(dto);
      res.json({
        success: true,
        message: "Professeur mis à jour",
        data,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/courses/professors/:id
   * Retourne un professeur par son identifiant
   */
  async getProfessorById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const data = await getProfessorByIdUC.execute(id);
      res.json({ success: true, message: "Professeur récupéré", data });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/courses/professors/:id
   * Supprime un professeur et ses assignations de cours récurrents
   */
  async deleteProfessor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      await deleteProfessorUC.execute(id);
      res.json({ success: true, message: "Professeur supprimé" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // ==================== COURS (INSTANCES) ====================

  /**
   * GET /api/courses/sessions
   * Retourne la liste des cours avec filtres optionnels
   * Query params : date_debut, date_fin, type_cours, cours_recurrent_id
   */
  async getCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = {
        date_debut: req.query.date_debut as string | undefined,
        date_fin: req.query.date_fin as string | undefined,
        type_cours: req.query.type_cours as string | undefined,
        cours_recurrent_id: req.query.cours_recurrent_id
          ? Number(req.query.cours_recurrent_id)
          : undefined,
      };
      const data = await getCoursesUC.execute(filters);
      res.json({
        success: true,
        message: "Cours récupérés",
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
   * GET /api/courses/sessions/:id
   * Retourne un cours par son ID avec toutes ses relations
   */
  async getCourseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const data = await getCourseByIdUC.execute(id);
      res.json({
        success: true,
        message: "Cours récupéré",
        data,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/courses/sessions
   * Crée un cours (instance ponctuelle ou liée à un cours récurrent)
   */
  async createCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await createCourseUC.execute(req.body);
      res.status(201).json({
        success: true,
        message: "Cours créé",
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
   * POST /api/courses/sessions/generate
   * Génère automatiquement des cours à partir d'un cours récurrent sur une plage de dates
   */
  async generateCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await generateCoursesUC.execute(req.body);
      res.status(201).json({
        success: true,
        message: `${data.generated} cours générés`,
        data,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // ==================== INSCRIPTIONS ====================

  /**
   * GET /api/courses/sessions/:id/inscriptions
   * Retourne la feuille de présence complète d'un cours
   */
  async getCourseInscriptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cours_id = Number(req.params.id);
      if (isNaN(cours_id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const data = await getCourseInscriptionsUC.execute(cours_id);
      res.json({
        success: true,
        message: "Inscriptions récupérées",
        data,
      });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/courses/sessions/:id/inscriptions
   * Inscrit un utilisateur à un cours
   * L'id du cours (params) est automatiquement inclus dans le DTO
   */
  async createInscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cours_id = Number(req.params.id);
      if (isNaN(cours_id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const dto = { ...req.body, cours_id };
      await createInscriptionUC.execute(dto);
      res.status(201).json({
        success: true,
        message: "Inscription créée",
      });
    } catch (error: any) {
      // Handle UNIQUE KEY constraint violation (double inscription)
      if (error.code === "ER_DUP_ENTRY") {
        res.status(400).json({
          success: false,
          message: "Cet utilisateur est déjà inscrit à ce cours",
          error: "DUPLICATE_INSCRIPTION",
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * PATCH /api/courses/sessions/:id/presence
   * Met à jour en masse les statuts de présence pour un cours
   */
  async bulkUpdatePresence(req: AuthRequest, res: Response): Promise<void> {
    try {
      await bulkUpdatePresenceUC.execute(req.body);
      res.json({
        success: true,
        message: "Présences mises à jour",
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
   * DELETE /api/courses/inscriptions/:inscriptionId
   * Supprime une inscription par son ID
   */
  async deleteInscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.inscriptionId);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      await deleteInscriptionUC.execute(id);
      res.json({
        success: true,
        message: "Inscription supprimée",
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
   * GET /api/courses/sessions/my-enrollments
   * Retourne les inscriptions de l'utilisateur connecté avec le détail des cours
   * Accessible aux membres, professeurs et admins
   */
  async getMyEnrollments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = await getMyEnrollmentsUC.execute(userId);
      res.json({
        success: true,
        message: "Inscriptions récupérées",
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
