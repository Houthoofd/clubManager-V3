/**
 * notificationRoutes
 * Définition de toutes les routes du module notifications
 * Toutes les routes nécessitent une authentification (authMiddleware appliqué globalement)
 * Ordre important : routes statiques AVANT les routes paramétrées (/:id)
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { authMiddleware } from '@/shared/middleware/authMiddleware.js';

const router = Router();
const ctrl = new NotificationController();

// All notification routes require authentication
router.use(authMiddleware);

// ============================================================
// ROUTES STATIQUES — avant les routes paramétrées
// ============================================================

// GET /api/notifications — liste les notifications de l'utilisateur courant
// Query param optionnel : ?unread=true pour ne récupérer que les non-lues
router.get('/', (req, res) => ctrl.getNotifications(req as any, res));

// GET /api/notifications/unread-count — nombre de notifications non lues
// Doit être AVANT /:id pour que "unread-count" ne soit pas capturé comme id
router.get('/unread-count', (req, res) => ctrl.getUnreadCount(req as any, res));

// POST /api/notifications/read-all — marque toutes les notifications comme lues
// Doit être AVANT /:id pour que "read-all" ne soit pas capturé comme id
router.post('/read-all', (req, res) => ctrl.markAllAsRead(req as any, res));

// ============================================================
// ROUTES PARAMÉTRÉES — en dernier
// ============================================================

// PATCH /api/notifications/:id/read — marque une notification spécifique comme lue
router.patch('/:id/read', (req, res) => ctrl.markAsRead(req as any, res));

export default router;
