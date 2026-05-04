/**
 * recoveryRoutes
 * Routes du module de demandes de récupération manuelle
 * Toutes les routes sont protégées : authentification JWT + rôle ADMIN requis
 */

import { Router } from "express";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";
import { RecoveryController } from "../controllers/RecoveryController.js";

const router = Router();
const ctrl = new RecoveryController();

// ============================================================
// PUBLIC ROUTE — aucune authentification requise
// ============================================================

// POST /api/recovery/public — soumission publique d'une demande de récupération
// Body : { email: string, reason: string }
router.post("/public", (req, res) => ctrl.submitRequest(req as any, res));

// ============================================================
// GUARDS — appliqués à toutes les routes du module après ce point
// ============================================================

router.use(authMiddleware);
router.use(requireRole(UserRole.ADMIN));

// ============================================================
// ROUTES ADMIN
// ============================================================

// GET /api/recovery — liste paginée des demandes de récupération
// Query params : status? ('pending' | 'approved' | 'rejected'), page?, limit?
router.get("/", (req, res) => ctrl.getRequests(req as any, res));

// PATCH /api/recovery/:id — traite une demande (approbation ou rejet)
// Body : { status: 'approved' | 'rejected', admin_note?: string }
router.patch("/:id", (req, res) => ctrl.processRequest(req as any, res));

export default router;
