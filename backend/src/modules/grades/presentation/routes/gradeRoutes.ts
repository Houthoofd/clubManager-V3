/**
 * gradeRoutes
 * Définition des routes du module grades (ceintures)
 * Lecture : authentifié (tous rôles) — Écriture : admin uniquement
 */

import { Router } from "express";
import { GradeController } from "../controllers/GradeController.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const ctrl = new GradeController();

// ==================== ROUTES GRADES ====================

// GET / — Liste tous les grades (authentifié, tous rôles)
router.get("/", authMiddleware, (req, res) =>
  ctrl.getGrades(req as any, res),
);

// GET /:id — Récupère un grade par son ID (authentifié, tous rôles)
router.get("/:id", authMiddleware, (req, res) =>
  ctrl.getGradeById(req as any, res),
);

// POST / — Crée un nouveau grade (admin seulement)
router.post("/", authMiddleware, requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.createGrade(req as any, res),
);

// PUT /:id — Met à jour un grade (admin seulement)
router.put("/:id", authMiddleware, requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.updateGrade(req as any, res),
);

// DELETE /:id — Supprime un grade (admin seulement)
router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.deleteGrade(req as any, res),
);

export default router;
