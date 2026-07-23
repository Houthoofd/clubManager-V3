/**
 * alertRoutes.ts
 * Définition de toutes les routes du module alerts
 * Ordre important : routes statiques AVANT les routes paramétrées (:id)
 */

import { Router } from 'express';
import { AlertController } from '../controllers/AlertController.js';
import { authMiddleware, requireRole } from '@/shared/middleware/authMiddleware.js';
import { UserRole } from '@clubmanager/types';

const router: Router = Router();
const ctrl = new AlertController();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// ============================================================
// ROUTES STATIQUES — avant les routes paramétrées
// ============================================================

// ─── Types d'alertes (admin) — chemins fixes ─────────────────────────────────

// GET /api/alerts/types — liste des types d'alertes (?activeOnly=true)
router.get('/types', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.getAlertTypes(req as any, res),
);

// POST /api/alerts/types — créer un type d'alerte
router.post('/types', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.createAlertType(req as any, res),
);

// ─── Vue admin — chemins fixes ────────────────────────────────────────────────

// GET /api/alerts/admin — liste toutes les alertes (?statut=active&priorite=haute&userId=123)
router.get('/admin', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.getAdminAlerts(req as any, res),
);

// POST /api/alerts/admin — créer manuellement une alerte pour un utilisateur
router.post('/admin', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.createUserAlert(req as any, res),
);

// ─── Member — alertes de l'utilisateur connecté ──────────────────────────────

// GET /api/alerts/me — alertes de l'utilisateur connecté (?statut=active)
// Doit être AVANT les routes /:id pour que "me" ne soit pas capturé comme paramètre
router.get('/me', (req, res) => ctrl.getMyAlerts(req as any, res));

// ============================================================
// ROUTES PARAMÉTRÉES — en dernier
// ============================================================

// ─── Types d'alertes (admin) — avec paramètre :id ────────────────────────────

// PUT /api/alerts/types/:id — modifier un type d'alerte
router.put('/types/:id', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.updateAlertType(req as any, res),
);

// DELETE /api/alerts/types/:id — supprimer un type d'alerte
router.delete('/types/:id', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.deleteAlertType(req as any, res),
);

// ─── Vue admin — avec paramètre :id ──────────────────────────────────────────

// PATCH /api/alerts/admin/:id/resolve — résoudre une alerte
router.patch('/admin/:id/resolve', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.resolveAlert(req as any, res),
);

// PATCH /api/alerts/admin/:id/ignore — ignorer une alerte
router.patch('/admin/:id/ignore', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.ignoreAlert(req as any, res),
);

// GET /api/alerts/admin/:id/actions — historique des actions d'une alerte
router.get('/admin/:id/actions', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.getAlertActions(req as any, res),
);

// POST /api/alerts/admin/:id/actions — ajouter une action à une alerte
router.post('/admin/:id/actions', requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.addAlertAction(req as any, res),
);

export default router;
