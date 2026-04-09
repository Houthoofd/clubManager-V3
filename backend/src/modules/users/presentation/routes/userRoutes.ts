import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authMiddleware, requireRole } from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const ctrl = new UserController();

// Toutes les routes nécessitent d'être authentifié
router.use(authMiddleware);

// GET /api/users — admin + professor
router.get("/", requireRole(UserRole.ADMIN, UserRole.PROFESSOR), (req, res) => ctrl.getUsers(req as any, res));

// GET /api/users/:id — admin + professor
router.get("/:id", requireRole(UserRole.ADMIN, UserRole.PROFESSOR), (req, res) => ctrl.getUserById(req as any, res));

// PATCH /api/users/:id/role — admin seulement
router.patch("/:id/role", requireRole(UserRole.ADMIN), (req, res) => ctrl.updateRole(req as any, res));

// PATCH /api/users/:id/status — admin seulement
router.patch("/:id/status", requireRole(UserRole.ADMIN), (req, res) => ctrl.updateStatus(req as any, res));

// DELETE /api/users/:id — admin seulement
router.delete("/:id", requireRole(UserRole.ADMIN), (req, res) => ctrl.softDelete(req as any, res));

// POST /api/users/:id/restore — admin seulement
router.post("/:id/restore", requireRole(UserRole.ADMIN), (req, res) => ctrl.restore(req as any, res));

export default router;
