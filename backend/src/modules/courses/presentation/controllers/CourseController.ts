/**
 * CourseController
 * Controller pour gérer tous les endpoints du module courses :
 * cours récurrents, professeurs, instances de cours et inscriptions
 */

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLCourseRepository } from "../../infrastructure/repositories/MySQLCourseRepository.js";
import { pool } from "@/core/database/connection.js";

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
import { ExportSessionAttendanceUseCase } from "../../application/use-cases/ExportSessionAttendanceUseCase.js";

// Use Cases — assignation professeurs à un cours récurrent
import { AssignProfessorToCourseUseCase } from "../../application/use-cases/AssignProfessorToCourseUseCase.js";
import { UnassignProfessorFromCourseUseCase } from "../../application/use-cases/UnassignProfessorFromCourseUseCase.js";
import { GetCourseProfessorsUseCase } from "../../application/use-cases/GetCourseProfessorsUseCase.js";

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
const exportSessionAttendanceUC = new ExportSessionAttendanceUseCase(repo);

// Assignation professeurs à un cours récurrent
const assignProfessorUC = new AssignProfessorToCourseUseCase(repo);
const unassignProfessorUC = new UnassignProfessorFromCourseUseCase(repo);
const getCourseProfessorsUC = new GetCourseProfessorsUseCase(repo);

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
   * Accepte `user_id` (client) ou `utilisateur_id` (DTO interne)
   */
  async createInscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cours_id = Number(req.params.id);
      if (isNaN(cours_id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      // Normalisation : accepte user_id (API publique) ou utilisateur_id (DTO interne)
      const utilisateur_id = Number(
        req.body.utilisateur_id ?? req.body.user_id,
      );
      if (!utilisateur_id || isNaN(utilisateur_id)) {
        res.status(400).json({ success: false, message: "user_id requis" });
        return;
      }
      const dto = {
        utilisateur_id,
        cours_id,
        status_id: req.body.status_id ?? null,
        commentaire: req.body.commentaire,
      };
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
   * Met à jour en masse les statuts de présence pour un cours.
   *
   * Accepte deux formats :
   *   - Format DTO interne : { updates: [{ inscription_id, status_id }] }
   *   - Format client API : { presences: [{ inscription_id, statut: 'present'|'absent' }] }
   */
  async bulkUpdatePresence(req: AuthRequest, res: Response): Promise<void> {
    try {
      let updates: { inscription_id: number; status_id: number | null }[];

      if (Array.isArray(req.body.presences)) {
        // Format client : statut en chaîne → status_id numérique
        const statutToId = (s: string): number | null =>
          s === "present" ? 1 : null;
        updates = req.body.presences.map(
          (p: { inscription_id: number; statut: string }) => ({
            inscription_id: p.inscription_id,
            status_id: statutToId(p.statut),
          }),
        );
      } else {
        updates = req.body.updates ?? [];
      }

      await bulkUpdatePresenceUC.execute({ updates });
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

      // Membres : vérifier que l'inscription leur appartient
      const userRole = req.user?.role_app;
      if (userRole === "member") {
        const numericUserId = req.user?.userId; // id numérique en DB
        const [rows] = await pool.query<any[]>(
          `SELECT id FROM inscriptions WHERE id = ? AND user_id = ?`,
          [id, numericUserId],
        );
        if (!Array.isArray(rows) || rows.length === 0) {
          res.status(403).json({ success: false, message: "Accès interdit" });
          return;
        }
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

  // ==================== EXPORT ====================

  /**
   * GET /api/courses/sessions/:id/export
   * Exporte la feuille d'appel d'une séance en CSV
   */
  async exportSessionAttendance(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionId = Number(req.params.id);
      if (isNaN(sessionId) || sessionId <= 0) {
        res.status(400).json({ success: false, error: "Invalid session ID" });
        return;
      }
      const result = await exportSessionAttendanceUC.execute(sessionId);
      if (!result) {
        res.status(404).json({ success: false, error: "Session not found" });
        return;
      }
      // Send as CSV file download
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      // BOM pour Excel FR
      res.status(200).send("\uFEFF" + result.csv);
    } catch (error) {
      next(error);
    }
  }

  // ==================== ASSIGNATION PROFESSEURS À UN COURS RÉCURRENT ====================

  /**
   * GET /api/courses/:id/professors
   * Retourne la liste des IDs de professeurs assignés à un cours récurrent
   */
  getCourseProfessors = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const professorIds = await getCourseProfessorsUC.execute(id);
      res.status(200).json({ success: true, data: professorIds });
    } catch (error: any) {
      if (error.message.includes("introuvable")) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * POST /api/courses/:id/professors
   * Assigne un professeur à un cours récurrent
   */
  assignProfessorToCourse = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.id);
      if (isNaN(courseId)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      const { professor_id } = req.body;
      if (!professor_id) {
        res
          .status(400)
          .json({ success: false, message: "professor_id requis" });
        return;
      }
      await assignProfessorUC.execute(courseId, Number(professor_id));
      res
        .status(201)
        .json({ success: true, message: "Professeur assigné avec succès" });
    } catch (error: any) {
      if (error.message.includes("introuvable")) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * DELETE /api/courses/:id/professors/:professorId
   * Retire un professeur d'un cours récurrent
   */
  unassignProfessorFromCourse = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.id);
      const professorId = Number(req.params.professorId);
      if (isNaN(courseId) || isNaN(professorId)) {
        res.status(400).json({ success: false, message: "ID invalide" });
        return;
      }
      await unassignProfessorUC.execute(courseId, professorId);
      res
        .status(200)
        .json({ success: true, message: "Professeur retiré avec succès" });
    } catch (error: any) {
      if (error.message.includes("introuvable")) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };
}
