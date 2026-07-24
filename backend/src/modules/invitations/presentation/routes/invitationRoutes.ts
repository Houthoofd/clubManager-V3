/**
 * invitationRoutes
 * Routes du module d'invitations
 *
 * POST   /              → authMiddleware + admin → sendInvitation
 * GET    /validate      → public (sans auth)    → validateToken
 * GET    /              → authMiddleware + admin → getInvitations
 * DELETE /:id           → authMiddleware + admin → revokeInvitation
 */

import { Router } from "express";
import { authMiddleware } from "@/shared/middleware/authMiddleware.js";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";
import { InvitationController } from "../controllers/InvitationController.js";

const router = Router();
const ctrl = new InvitationController();

// ============================================================
// POST / — admin only : envoyer une invitation
// ============================================================
router.post("/", authMiddleware, (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role_app !== UserRole.ADMIN) {
    res.status(403).json({ success: false, message: "Accès refusé" });
    return;
  }
  ctrl.sendInvitation(authReq, res);
});

// ============================================================
// GET /validate — public : valider un token d'invitation
// ⚠️ Doit être déclaré AVANT GET / pour ne pas être capturé par /:id
// ============================================================
router.get("/validate", (req, res) =>
  ctrl.validateToken(req as AuthRequest, res),
);

// ============================================================
// GET / — admin only : liste paginée des invitations
// ============================================================
router.get("/", authMiddleware, (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role_app !== UserRole.ADMIN) {
    res.status(403).json({ success: false, message: "Accès refusé" });
    return;
  }
  ctrl.getInvitations(authReq, res);
});

// ============================================================
// DELETE /:id — admin only : révoquer une invitation
// ============================================================
router.delete("/:id", authMiddleware, (req, res) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role_app !== UserRole.ADMIN) {
    res.status(403).json({ success: false, message: "Accès refusé" });
    return;
  }
  ctrl.revokeInvitation(authReq, res);
});

export default router;
