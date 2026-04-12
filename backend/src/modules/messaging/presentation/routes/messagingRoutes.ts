/**
 * messagingRoutes
 * Routes pour le module de messagerie interne
 */

import { Router } from "express";
import { MessagingController } from "../controllers/MessagingController.js";
import { authMiddleware } from "@/shared/middleware/authMiddleware.js";

const router = Router();
const ctrl = new MessagingController();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/messages/unread-count — Nombre de messages non lus
router.get("/unread-count", (req, res) => ctrl.getUnreadCount(req as any, res));

// GET /api/messages/inbox — Boîte de réception
router.get("/inbox", (req, res) => ctrl.getInbox(req as any, res));

// GET /api/messages/sent — Boîte d'envoi
router.get("/sent", (req, res) => ctrl.getSent(req as any, res));

// POST /api/messages/send — Envoyer un message (individuel ou broadcast)
router.post("/send", (req, res) => ctrl.send(req as any, res));

// GET /api/messages/:id — Lire un message (auto-marque comme lu)
router.get("/:id", (req, res) => ctrl.getMessage(req as any, res));

// DELETE /api/messages/:id — Supprimer un message
router.delete("/:id", (req, res) => ctrl.delete(req as any, res));

export default router;
