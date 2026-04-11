/**
 * paymentRoutes
 * Définition de toutes les routes du module paiements
 * Ordre important : routes statiques AVANT les routes paramétrées (/:id)
 * Le webhook Stripe est public (pas d'auth) et requiert express.raw() pour le corps brut
 */

import { Router } from "express";
import express from "express";
import { PricingPlanController } from "../controllers/PricingPlanController.js";
import { PaymentController } from "../controllers/PaymentController.js";
import { PaymentScheduleController } from "../controllers/PaymentScheduleController.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const planCtrl = new PricingPlanController();
const paymentCtrl = new PaymentController();
const scheduleCtrl = new PaymentScheduleController();

// ============================================================
// WEBHOOK STRIPE — PUBLIC, corps brut requis
// IMPORTANT : cette route doit être enregistrée AVANT tout
// middleware global express.json() dans app.ts. Elle utilise
// express.raw() pour recevoir le payload non parsé nécessaire
// à la vérification de signature Stripe.
// ============================================================

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => paymentCtrl.handleStripeWebhook(req, res),
);

// ============================================================
// PLANS TARIFAIRES
// Routes statiques (/plans et /plans/:id) avant /:id
// ============================================================

// GET /api/payments/plans — liste tous les plans (admin + professor)
router.get(
  "/plans",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => planCtrl.getPlans(req as any, res),
);

// GET /api/payments/plans/:id — détail d'un plan (admin + professor)
router.get(
  "/plans/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => planCtrl.getPlanById(req as any, res),
);

// POST /api/payments/plans — crée un plan (admin)
router.post(
  "/plans",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => planCtrl.createPlan(req as any, res),
);

// PUT /api/payments/plans/:id — met à jour un plan (admin)
router.put(
  "/plans/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => planCtrl.updatePlan(req as any, res),
);

// PATCH /api/payments/plans/:id/toggle — active/désactive un plan (admin)
router.patch(
  "/plans/:id/toggle",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => planCtrl.togglePlan(req as any, res),
);

// DELETE /api/payments/plans/:id — supprime un plan (admin)
router.delete(
  "/plans/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => planCtrl.deletePlan(req as any, res),
);

// ============================================================
// PAIEMENTS — routes statiques avant /:id
// ============================================================

// GET /api/payments — liste paginée des paiements (admin + professor)
router.get(
  "/",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => paymentCtrl.getPayments(req as any, res),
);

// POST /api/payments — crée un paiement manuel (admin)
router.post(
  "/",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => paymentCtrl.createPayment(req as any, res),
);

// POST /api/payments/stripe/intent — crée un PaymentIntent Stripe (admin)
// Doit être AVANT /:id pour que "stripe" ne soit pas capturé comme id
router.post(
  "/stripe/intent",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => paymentCtrl.createStripeIntent(req as any, res),
);

// GET /api/payments/user/:userId — historique paiements d'un user
// Doit être AVANT /:id pour que "user" ne soit pas capturé comme id
router.get(
  "/user/:userId",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => paymentCtrl.getUserPayments(req as any, res),
);

// ============================================================
// ÉCHÉANCES — routes statiques avant /:id
// L'ordre /overdue et /user/:userId AVANT /:id/pay est important
// ============================================================

// GET /api/payments/schedules — liste paginée des échéances (admin + professor)
router.get(
  "/schedules",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => scheduleCtrl.getSchedules(req as any, res),
);

// GET /api/payments/schedules/overdue — échéances en retard (admin + professor)
// Doit être AVANT /schedules/:id pour que "overdue" ne soit pas capturé comme id
router.get(
  "/schedules/overdue",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => scheduleCtrl.getOverdueSchedules(req as any, res),
);

// GET /api/payments/schedules/user/:userId — échéances d'un utilisateur
// Doit être AVANT /schedules/:id pour que "user" ne soit pas capturé comme id
router.get(
  "/schedules/user/:userId",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => scheduleCtrl.getUserSchedules(req as any, res),
);

// PATCH /api/payments/schedules/:id/pay — marque une échéance comme payée (admin)
router.patch(
  "/schedules/:id/pay",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => scheduleCtrl.markAsPaid(req as any, res),
);

// ============================================================
// ROUTE PARAMÉTRÉE — EN DERNIER (capte tout ce qui n'a pas matché)
// ============================================================

// GET /api/payments/:id — détail d'un paiement (admin + professor)
router.get(
  "/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => paymentCtrl.getPaymentById(req as any, res),
);

export default router;
