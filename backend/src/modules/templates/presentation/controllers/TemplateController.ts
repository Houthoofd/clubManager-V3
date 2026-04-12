/**
 * TemplateController
 * Controller pour les endpoints de gestion des templates de messages personnalisés
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLTemplateRepository } from "../../infrastructure/repositories/MySQLTemplateRepository.js";
import { MySQLMessagingRepository } from "../../../messaging/infrastructure/repositories/MySQLMessagingRepository.js";
import { GetTemplateTypesUseCase } from "../../application/use-cases/GetTemplateTypesUseCase.js";
import { CreateTemplateTypeUseCase } from "../../application/use-cases/CreateTemplateTypeUseCase.js";
import { UpdateTemplateTypeUseCase } from "../../application/use-cases/UpdateTemplateTypeUseCase.js";
import { DeleteTemplateTypeUseCase } from "../../application/use-cases/DeleteTemplateTypeUseCase.js";
import { GetTemplatesUseCase } from "../../application/use-cases/GetTemplatesUseCase.js";
import { GetTemplateByIdUseCase } from "../../application/use-cases/GetTemplateByIdUseCase.js";
import { CreateTemplateUseCase } from "../../application/use-cases/CreateTemplateUseCase.js";
import { UpdateTemplateUseCase } from "../../application/use-cases/UpdateTemplateUseCase.js";
import { DeleteTemplateUseCase } from "../../application/use-cases/DeleteTemplateUseCase.js";
import { ToggleTemplateUseCase } from "../../application/use-cases/ToggleTemplateUseCase.js";
import { PreviewTemplateUseCase } from "../../application/use-cases/PreviewTemplateUseCase.js";
import { SendFromTemplateUseCase } from "../../application/use-cases/SendFromTemplateUseCase.js";

// ==================== SINGLETONS ====================

const templateRepo = new MySQLTemplateRepository();
const messagingRepo = new MySQLMessagingRepository();

const getTypesUC = new GetTemplateTypesUseCase(templateRepo);
const createTypeUC = new CreateTemplateTypeUseCase(templateRepo);
const updateTypeUC = new UpdateTemplateTypeUseCase(templateRepo);
const deleteTypeUC = new DeleteTemplateTypeUseCase(templateRepo);
const getTemplatesUC = new GetTemplatesUseCase(templateRepo);
const getTemplateByIdUC = new GetTemplateByIdUseCase(templateRepo);
const createTemplateUC = new CreateTemplateUseCase(templateRepo);
const updateTemplateUC = new UpdateTemplateUseCase(templateRepo);
const deleteTemplateUC = new DeleteTemplateUseCase(templateRepo);
const toggleTemplateUC = new ToggleTemplateUseCase(templateRepo);
const previewTemplateUC = new PreviewTemplateUseCase(templateRepo);
const sendFromTemplateUC = new SendFromTemplateUseCase(
  templateRepo,
  messagingRepo,
);

// ==================== HELPERS ====================

/**
 * Erreurs métier connues → HTTP 400
 */
const BUSINESS_ERRORS = [
  "requis",
  "vide",
  "dépasser",
  "introuvable",
  "rattachés",
  "désactivé",
  "broadcast",
  "membres ne peuvent pas",
];

function isBusinessError(message: string): boolean {
  return BUSINESS_ERRORS.some((kw) =>
    message.toLowerCase().includes(kw.toLowerCase()),
  );
}

function httpStatusForError(message: string): number {
  if (message.toLowerCase().includes("introuvable")) return 404;
  if (isBusinessError(message)) return 400;
  return 500;
}

// ==================== CONTROLLER ====================

export class TemplateController {
  // ===================================================================
  // TYPES
  // ===================================================================

  /**
   * GET /api/templates/types
   * Retourne tous les types de templates (avec compteur)
   */
  async getTypes(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const types = await getTypesUC.execute();
      res.json({
        success: true,
        message: "Types de templates récupérés",
        data: types,
      });
    } catch (error: any) {
      console.error("[TemplateController.getTypes]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/templates/types
   * Crée un nouveau type de template
   * Body: { nom: string, description?: string }
   */
  async createType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nom, description } = req.body;

      const type = await createTypeUC.execute({ nom, description });

      res.status(201).json({
        success: true,
        message: "Type de template créé avec succès",
        data: type,
      });
    } catch (error: any) {
      console.error("[TemplateController.createType]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * PUT /api/templates/types/:id
   * Met à jour un type existant
   * Body: { nom?: string, description?: string, actif?: boolean }
   */
  async updateType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de type invalide",
          error: "INVALID_ID",
        });
        return;
      }

      const { nom, description, actif } = req.body;

      await updateTypeUC.execute(id, { nom, description, actif });

      res.json({
        success: true,
        message: "Type de template mis à jour",
      });
    } catch (error: any) {
      console.error("[TemplateController.updateType]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * DELETE /api/templates/types/:id
   * Supprime un type — refus si des templates actifs y sont rattachés
   */
  async deleteType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de type invalide",
          error: "INVALID_ID",
        });
        return;
      }

      await deleteTypeUC.execute(id);

      res.json({
        success: true,
        message: "Type de template supprimé",
      });
    } catch (error: any) {
      console.error("[TemplateController.deleteType]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }

  // ===================================================================
  // TEMPLATES
  // ===================================================================

  /**
   * GET /api/templates
   * Retourne la liste des templates
   * Query params: type_id?, actif?
   */
  async getTemplates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const type_id = req.query.type_id ? Number(req.query.type_id) : undefined;

      let actif: boolean | undefined;
      if (req.query.actif !== undefined) {
        actif = req.query.actif === "true" || req.query.actif === "1";
      }

      const templates = await getTemplatesUC.execute({ type_id, actif });

      res.json({
        success: true,
        message: "Templates récupérés",
        data: templates,
      });
    } catch (error: any) {
      console.error("[TemplateController.getTemplates]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/templates/:id
   * Retourne un template par son ID
   */
  async getTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de template invalide",
          error: "INVALID_ID",
        });
        return;
      }

      const template = await getTemplateByIdUC.execute(id);

      res.json({
        success: true,
        message: "Template récupéré",
        data: template,
      });
    } catch (error: any) {
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/templates
   * Crée un nouveau template
   * Body: { type_id: number, titre: string, contenu: string, actif?: boolean }
   */
  async createTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type_id, titre, contenu, actif } = req.body;

      const template = await createTemplateUC.execute({
        type_id: Number(type_id),
        titre,
        contenu,
        actif: actif !== undefined ? Boolean(actif) : undefined,
      });

      res.status(201).json({
        success: true,
        message: "Template créé avec succès",
        data: template,
      });
    } catch (error: any) {
      console.error("[TemplateController.createTemplate]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * PUT /api/templates/:id
   * Met à jour un template existant
   * Body: { type_id?: number, titre?: string, contenu?: string, actif?: boolean }
   */
  async updateTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de template invalide",
          error: "INVALID_ID",
        });
        return;
      }

      const { type_id, titre, contenu, actif } = req.body;

      await updateTemplateUC.execute(id, {
        type_id: type_id !== undefined ? Number(type_id) : undefined,
        titre,
        contenu,
        actif: actif !== undefined ? Boolean(actif) : undefined,
      });

      res.json({
        success: true,
        message: "Template mis à jour",
      });
    } catch (error: any) {
      console.error("[TemplateController.updateTemplate]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * DELETE /api/templates/:id
   * Supprime définitivement un template
   */
  async deleteTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de template invalide",
          error: "INVALID_ID",
        });
        return;
      }

      await deleteTemplateUC.execute(id);

      res.json({
        success: true,
        message: "Template supprimé",
      });
    } catch (error: any) {
      console.error("[TemplateController.deleteTemplate]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * PATCH /api/templates/:id/toggle
   * Active ou désactive un template
   * Body: { actif: boolean }
   */
  async toggleTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de template invalide",
          error: "INVALID_ID",
        });
        return;
      }

      if (req.body.actif === undefined) {
        res.status(400).json({
          success: false,
          message: "Le champ 'actif' est requis (boolean)",
          error: "MISSING_FIELD",
        });
        return;
      }

      const actif = Boolean(req.body.actif);

      await toggleTemplateUC.execute(id, actif);

      res.json({
        success: true,
        message: actif ? "Template activé" : "Template désactivé",
        data: { actif },
      });
    } catch (error: any) {
      console.error("[TemplateController.toggleTemplate]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/templates/:id/preview
   * Prévisualise un template rendu avec des données d'exemple
   * Body: { manual_vars?: Record<string, string>, recipient_example?: RecipientData }
   */
  async previewTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de template invalide",
          error: "INVALID_ID",
        });
        return;
      }

      const { manual_vars, recipient_example } = req.body;

      const result = await previewTemplateUC.execute(id, {
        manual_vars: manual_vars ?? {},
        recipient_example: recipient_example ?? undefined,
      });

      res.json({
        success: true,
        message: "Prévisualisation du template",
        data: result,
      });
    } catch (error: any) {
      console.error("[TemplateController.previewTemplate]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/templates/:id/send
   * Envoie un message basé sur un template à un ou plusieurs destinataires
   * Body: {
   *   destinataire_id?: number,
   *   cible?: 'tous' | 'admin' | 'professor' | 'member',
   *   manual_vars?: Record<string, string>,
   *   envoye_par_email: boolean
   * }
   */
  async sendFromTemplate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de template invalide",
          error: "INVALID_ID",
        });
        return;
      }

      const { destinataire_id, cible, manual_vars, envoye_par_email } =
        req.body;

      // Validation : destinataire ou cible obligatoire
      if (!destinataire_id && !cible) {
        res.status(400).json({
          success: false,
          message:
            "Un destinataire (destinataire_id) ou une cible de broadcast (cible) est requis",
          error: "MISSING_RECIPIENT",
        });
        return;
      }

      const result = await sendFromTemplateUC.execute({
        template_id: id,
        expediteur_id: req.user!.userId,
        expediteur_role: req.user!.role_app ?? "member",
        destinataire_id: destinataire_id ? Number(destinataire_id) : undefined,
        cible: cible ?? undefined,
        manual_vars: manual_vars ?? {},
        envoye_par_email: Boolean(envoye_par_email),
      });

      res.status(201).json({
        success: true,
        message: `${result.sent_count} message(s) envoyé(s) avec succès`,
        data: result,
      });
    } catch (error: any) {
      console.error("[TemplateController.sendFromTemplate]", error);
      const status = httpStatusForError(error.message ?? "");
      res.status(status).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error:
          status === 404
            ? "NOT_FOUND"
            : status === 400
              ? "BAD_REQUEST"
              : "INTERNAL_ERROR",
      });
    }
  }
}
