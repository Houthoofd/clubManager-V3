/**
 * settingsRoutes
 * Définition des routes pour le module settings (Presentation Layer)
 */

import { Router } from "express";
import { authMiddleware, requireRole } from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";
import { SettingsController } from "../controllers/SettingsController.js";

const router = Router();
const ctrl = new SettingsController();

// Toutes les routes nécessitent d'être authentifié
router.use(authMiddleware);

// GET /api/settings — admin + professor
router.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getSettings(req as any, res),
);

// GET /api/settings/key/:cle — admin + professor
router.get(
  "/key/:cle",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getSettingByKey(req as any, res),
);

// PUT /api/settings/key/:cle — admin seulement
router.put(
  "/key/:cle",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.upsertSetting(req as any, res),
);

// POST /api/settings/bulk — admin seulement
router.post(
  "/bulk",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.bulkUpsertSettings(req as any, res),
);

// DELETE /api/settings/:id — admin seulement
router.delete(
  "/:id",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.deleteSetting(req as any, res),
);

export default router;
