import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const ctrl = new UserController();

// Toutes les routes nécessitent d'être authentifié
router.use(authMiddleware);

// ── Routes statiques (doivent être AVANT les routes paramétrées /:id) ────────

// GET /api/users — admin + professor
router.get("/", requireRole(UserRole.ADMIN, UserRole.PROFESSOR), (req, res) =>
  ctrl.getUsers(req as any, res),
);

// POST /api/users/notify-bulk — admin + professor
// ⚠️ DOIT être déclaré avant /:id pour ne pas être capturé comme un paramètre
router.post(
  "/notify-bulk",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.notifyBulk(req as any, res),
);

// GET /api/users/deleted — admin seulement : liste des utilisateurs supprimés (soft delete)
// ⚠️ DOIT être déclaré avant /:id pour ne pas être capturé comme un paramètre
router.get("/deleted", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.getDeletedUsers(req as any, res),
);

// ── Routes paramétrées /:id ─────────────────────────────────────────────────────────

// GET /api/users/:id — admin + professor
router.get(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getUserById(req as any, res),
);

// GET /api/users/:id/profile — utilisateur authentifié (own profile ou admin)
router.get("/:id/profile", (req, res) => ctrl.getProfile(req as any, res));

// PATCH /api/users/:id/profile — utilisateur authentifié (own profile ou admin)
router.patch("/:id/profile", (req, res) => ctrl.updateProfile(req as any, res));

// PATCH /api/users/:id/role — admin seulement
router.patch("/:id/role", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.updateRole(req as any, res),
);

// PATCH /api/users/:id/status — admin seulement
router.patch("/:id/status", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.updateStatus(req as any, res),
);

// PATCH /api/users/:id/language — utilisateur authentifié (peut modifier sa propre langue)
router.patch("/:id/language", (req, res) =>
  ctrl.updateLanguage(req as any, res),
);

// DELETE /api/users/:id — admin seulement
router.delete("/:id", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.softDelete(req as any, res),
);

// POST /api/users/:id/restore — admin seulement
router.post("/:id/restore", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.restore(req as any, res),
);

// POST /api/users/:id/anonymize — admin seulement : anonymisation RGPD
router.post("/:id/anonymize", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.anonymize(req as any, res),
);

export default router;
