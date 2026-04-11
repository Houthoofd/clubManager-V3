/**
 * PaymentController
 * Controller pour gérer les endpoints des paiements (liste, détail, création, Stripe)
 * Inclut le handler du webhook Stripe pour synchroniser les statuts de paiement en DB
 * Instantiation des use cases au niveau module (pattern Clean Architecture)
 */

import type { Request, Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import type Stripe from "stripe";
import { MySQLPaymentRepository } from "../../infrastructure/repositories/MySQLPaymentRepository.js";
import { StripeService } from "../../infrastructure/services/StripeService.js";
import { GetPaymentsUseCase } from "../../application/use-cases/payments/GetPaymentsUseCase.js";
import { GetPaymentByIdUseCase } from "../../application/use-cases/payments/GetPaymentByIdUseCase.js";
import { GetUserPaymentsUseCase } from "../../application/use-cases/payments/GetUserPaymentsUseCase.js";
import { CreatePaymentUseCase } from "../../application/use-cases/payments/CreatePaymentUseCase.js";
import { CreateStripePaymentIntentUseCase } from "../../application/use-cases/payments/CreateStripePaymentIntentUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLPaymentRepository();
let stripeService: StripeService;
try {
  stripeService = new StripeService();
} catch (err) {
  console.error(
    "[PaymentController] Échec initialisation StripeService :",
    err,
  );
  stripeService = null as any;
}
const getPaymentsUC = new GetPaymentsUseCase(repo);
const getPaymentByIdUC = new GetPaymentByIdUseCase(repo);
const getUserPaymentsUC = new GetUserPaymentsUseCase(repo);
const createPaymentUC = new CreatePaymentUseCase(repo);
const createStripeIntentUC = new CreateStripePaymentIntentUseCase(
  repo,
  stripeService,
);

// ==================== CONTROLLER ====================

export class PaymentController {
  /**
   * GET /api/payments
   * Retourne la liste paginée des paiements avec filtres optionnels
   * Query params : user_id?, statut?, methode?, date_debut?, date_fin?, page?, limit?
   */
  async getPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        statut: req.query.statut as string | undefined,
        methode: req.query.methode as string | undefined,
        date_debut: req.query.date_debut as string | undefined,
        date_fin: req.query.date_fin as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await getPaymentsUC.execute(query);
      res.json({ success: true, message: "Paiements récupérés", data: result });
    } catch (error: any) {
      console.error("[PaymentController.getPayments]", error);
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/payments/:id
   * Retourne un paiement par son ID avec les informations utilisateur et plan tarifaire
   */
  async getPaymentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await getPaymentByIdUC.execute(id);
      res.json({ success: true, message: "Paiement récupéré", data: result });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/payments/user/:userId
   * Retourne l'historique complet des paiements d'un utilisateur spécifique
   */
  async getUserPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const result = await getUserPaymentsUC.execute(userId);
      res.json({
        success: true,
        message: "Paiements utilisateur récupérés",
        data: result,
      });
    } catch (error: any) {
      console.error("[PaymentController.getUserPayments]", error);
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/payments/user/:userId
   * POST /api/payments
   * Crée un paiement manuel (espèces, virement ou autre — pas Stripe)
   * Body : { user_id, montant, methode_paiement, plan_tarifaire_id?, description?, date_paiement? }
   */
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        user_id,
        montant,
        methode_paiement,
        plan_tarifaire_id,
        description,
        date_paiement,
      } = req.body;

      const id = await createPaymentUC.execute({
        user_id: Number(user_id),
        montant: Number(montant),
        methode_paiement,
        plan_tarifaire_id: plan_tarifaire_id ? Number(plan_tarifaire_id) : null,
        description: description ?? null,
        date_paiement: date_paiement ?? null,
      });

      const payment = await getPaymentByIdUC.execute(id);
      res.status(201).json({
        success: true,
        message: "Paiement créé",
        data: payment,
      });
    } catch (error: any) {
      const status =
        error.message.includes("requis") ||
        error.message.includes("supérieur") ||
        error.message.includes("Utilisez")
          ? 400
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/payments/stripe/intent
   * Crée un PaymentIntent Stripe et retourne le client_secret pour la confirmation côté client
   * Body : { user_id, montant, plan_tarifaire_id?, description? }
   */
  async createStripeIntent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { user_id, montant, plan_tarifaire_id, description } = req.body;

      const result = await createStripeIntentUC.execute({
        user_id: Number(user_id),
        montant: Number(montant),
        plan_tarifaire_id: plan_tarifaire_id ? Number(plan_tarifaire_id) : null,
        description: description ?? null,
      });

      res.status(201).json({
        success: true,
        message: "PaymentIntent Stripe créé",
        data: result,
      });
    } catch (error: any) {
      const status =
        error.message.includes("requis") || error.message.includes("supérieur")
          ? 400
          : 500;
      res.status(status).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/payments/stripe/webhook
   * Gère les événements webhook Stripe — corps brut requis (express.raw())
   * Traite :
   *   - payment_intent.succeeded      → statut 'valide'  + stripe_charge_id
   *   - payment_intent.payment_failed → statut 'echoue'
   * Route PUBLIQUE : pas d'authentification JWT
   */
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      res
        .status(400)
        .json({ success: false, message: "Signature Stripe manquante" });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripeService.constructWebhookEvent(
        req.body as Buffer,
        signature,
      );
    } catch (err: any) {
      console.error("[Webhook Stripe] Signature invalide :", err.message);
      res.status(400).json({
        success: false,
        message: `Signature invalide : ${String(err.message)}`,
      });
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          // latest_charge peut être un string (ID) ou un objet Charge expandé
          const latestCharge = paymentIntent.latest_charge;
          const chargeId =
            typeof latestCharge === "string" ? latestCharge : undefined;

          const payment = await repo.findByStripeIntentId(paymentIntent.id);
          if (payment) {
            await repo.updateStatus(payment.id, "valide", chargeId);
            console.log(
              `[Webhook Stripe] Paiement #${payment.id} validé (intent: ${paymentIntent.id})`,
            );
          } else {
            console.warn(
              `[Webhook Stripe] Aucun paiement trouvé pour l'intent : ${paymentIntent.id}`,
            );
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          const payment = await repo.findByStripeIntentId(paymentIntent.id);
          if (payment) {
            await repo.updateStatus(payment.id, "echoue");
            console.log(
              `[Webhook Stripe] Paiement #${payment.id} échoué (intent: ${paymentIntent.id})`,
            );
          } else {
            console.warn(
              `[Webhook Stripe] Aucun paiement trouvé pour l'intent : ${paymentIntent.id}`,
            );
          }
          break;
        }

        default:
          // Événement non géré — on accuse réception sans lever d'erreur
          console.log(`[Webhook Stripe] Événement non géré : ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("[Webhook Stripe] Erreur de traitement :", error.message);
      res.status(500).json({ success: false, message: String(error.message) });
    }
  }
}
