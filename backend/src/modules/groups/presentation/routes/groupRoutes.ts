/**
 * groupRoutes
 * Définition des routes du module groups (groupes)
 * Lecture : ADMIN + PROFESSOR — Écriture : ADMIN uniquement
 */

import { Router } from "express";
import { GroupController } from "../controllers/GroupController.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const ctrl = new GroupController();

// Toutes les routes nécessitent d'être authentifié
router.use(authMiddleware);

// ── Groupes CRUD ─────────────────────────────────────────────────────────────

// GET / — Liste paginée des groupes (ADMIN + PROFESSOR)
router.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getGroups(req as any, res),
);

// POST / — Crée un nouveau groupe (ADMIN seulement)
router.post(
  "/",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.createGroup(req as any, res),
);

// GET /:id — Récupère un groupe par son ID (ADMIN + PROFESSOR)
router.get(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getGroupById(req as any, res),
);

// PUT /:id — Met à jour un groupe (ADMIN seulement)
router.put(
  "/:id",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.updateGroup(req as any, res),
);

// DELETE /:id — Supprime un groupe (ADMIN seulement)
router.delete(
  "/:id",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.deleteGroup(req as any, res),
);

// ── Membres d'un groupe ───────────────────────────────────────────────────────

// GET /:id/members — Liste les membres d'un groupe (ADMIN + PROFESSOR)
router.get(
  "/:id/members",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getMembers(req as any, res),
);

// POST /:id/members — Ajoute un membre à un groupe (ADMIN seulement)
router.post(
  "/:id/members",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.addMember(req as any, res),
);

// DELETE /:id/members/:userId — Retire un membre d'un groupe (ADMIN seulement)
router.delete(
  "/:id/members/:userId",
  requireRole(UserRole.ADMIN),
  (req, res) => ctrl.removeMember(req as any, res),
);

export default router;
