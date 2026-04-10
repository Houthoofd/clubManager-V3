/**
 * templateRoutes
 * Routes pour le module de gestion des templates de messages personnalisés
 */

import { Router } from "express";
import { TemplateController } from "../controllers/TemplateController.js";
import { authMiddleware, requireRole } from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const ctrl = new TemplateController();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// ===================================================================
// TYPES DE TEMPLATES
// ===================================================================

// GET    /api/templates/types           — Lister tous les types
router.get(
  "/types",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getTypes(req as any, res),
);

// POST   /api/templates/types           — Créer un type
router.post(
  "/types",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.createType(req as any, res),
);

// PUT    /api/templates/types/:id       — Mettre à jour un type
router.put(
  "/types/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.updateType(req as any, res),
);

// DELETE /api/templates/types/:id       — Supprimer un type (admin seulement)
router.delete(
  "/types/:id",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.deleteType(req as any, res),
);

// ===================================================================
// TEMPLATES
// ===================================================================

// GET    /api/templates                 — Lister les templates (filtrables)
router.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getTemplates(req as any, res),
);

// GET    /api/templates/:id             — Récupérer un template par son ID
router.get(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getTemplate(req as any, res),
);

// POST   /api/templates                 — Créer un template
router.post(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.createTemplate(req as any, res),
);

// PUT    /api/templates/:id             — Mettre à jour un template
router.put(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.updateTemplate(req as any, res),
);

// DELETE /api/templates/:id             — Supprimer un template
router.delete(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.deleteTemplate(req as any, res),
);

// PATCH  /api/templates/:id/toggle      — Activer / désactiver un template
router.patch(
  "/:id/toggle",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.toggleTemplate(req as any, res),
);

// POST   /api/templates/:id/preview     — Prévisualiser un template rendu
router.post(
  "/:id/preview",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.previewTemplate(req as any, res),
);

// POST   /api/templates/:id/send        — Envoyer depuis un template
router.post(
  "/:id/send",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.sendFromTemplate(req as any, res),
);

export default router;
