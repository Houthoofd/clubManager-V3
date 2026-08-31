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
import { PaymentEmailService } from "../../application/services/PaymentEmailService.js";
import { GetPaymentsUseCase } from "../../application/use-cases/payments/GetPaymentsUseCase.js";
import { GetPaymentByIdUseCase } from "../../application/use-cases/payments/GetPaymentByIdUseCase.js";
import { GetUserPaymentsUseCase } from "../../application/use-cases/payments/GetUserPaymentsUseCase.js";
import { CreatePaymentUseCase } from "../../application/use-cases/payments/CreatePaymentUseCase.js";
import { CreateStripePaymentIntentUseCase } from "../../application/use-cases/payments/CreateStripePaymentIntentUseCase.js";
import { RefundPaymentUseCase } from "../../application/use-cases/payments/RefundPaymentUseCase.js";
import { VerifyStripePaymentUseCase } from "../../application/use-cases/payments/VerifyStripePaymentUseCase.js";
import { MySQLPaymentScheduleRepository } from "../../infrastructure/repositories/MySQLPaymentScheduleRepository.js";
import { MarkScheduleAsPaidUseCase } from "../../application/use-cases/schedules/MarkScheduleAsPaidUseCase.js";
import { MySQLOrderRepository } from "../../../store/infrastructure/repositories/MySQLOrderRepository.js";
import { MySQLStockRepository } from "../../../store/infrastructure/repositories/MySQLStockRepository.js";
import { MarkOrderAsPaidUseCase } from "../../../store/application/use-cases/orders/MarkOrderAsPaidUseCase.js";

import { GetQuickPayDataUseCase } from "../../application/use-cases/payments/GetQuickPayDataUseCase.js";
import jwt from "jsonwebtoken";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLPaymentRepository();
const scheduleRepo = new MySQLPaymentScheduleRepository();
const orderRepo = new MySQLOrderRepository();
const stockRepo = new MySQLStockRepository();
const markScheduleAsPaidUC = new MarkScheduleAsPaidUseCase(scheduleRepo, repo);
const markOrderAsPaidUC = new MarkOrderAsPaidUseCase(orderRepo, stockRepo);
const getQuickPayDataUC = new GetQuickPayDataUseCase(scheduleRepo, orderRepo);
const paymentEmailService = new PaymentEmailService();
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
const refundPaymentUC = new RefundPaymentUseCase(repo);
const verifyStripePaymentUC = new VerifyStripePaymentUseCase(
  repo,
  stripeService,
  markScheduleAsPaidUC,
  markOrderAsPaidUC
);

// ==================== CONTROLLER ====================

export class PaymentController {
  
  /**
   * GET /api/payments/public/quick-pay?token=...
   */
  async getQuickPayData(req: Request, res: Response): Promise<void> {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ success: false, message: "Token manquant" });
        return;
      }
      
      const type = req.query.type as string | undefined;
      const idParam = req.query.id ? Number(req.query.id) : undefined;
      const items = await getQuickPayDataUC.execute(token, type, idParam);
      res.json({ success: true, data: items });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/payments/stripe/public/intent
   */
  async createPublicStripeIntent(req: Request, res: Response): Promise<void> {
    try {
      const { token, item_type, item_id } = req.body;
      if (!token) {
        res.status(400).json({ success: false, message: "Token manquant" });
        return;
      }

      const secret = process.env.JWT_SECRET || "fallback_secret";
      const accessSecret = process.env.JWT_ACCESS_SECRET || "your-super-secret-access-key-change-this-in-production";
      let decoded: any;
      
      try {
        decoded = jwt.verify(token, secret);
      } catch (e1) {
        try {
          decoded = jwt.verify(token, accessSecret, { issuer: "clubmanager", audience: "clubmanager-api" });
        } catch (e2) {
          res.status(400).json({ success: false, message: "Lien invalide ou expiré" });
          return;
        }
      }
      
      const userId = decoded.id || decoded.userId;

      let commande_id = null;
      let echeance_id = null;
      
      if (item_type === "boutique") {
        commande_id = Number(item_id);
      } else if (item_type === "cotisation") {
        echeance_id = Number(item_id);
      }

      const items = await getQuickPayDataUC.execute(token, item_type, Number(item_id));
      if (!items || items.length === 0) {
        res.status(400).json({ success: false, message: "Élément introuvable ou déjà payé" });
        return;
      }
      
      const montant = items[0].montant;
      const description = items[0].description;

      const result = await createStripeIntentUC.execute({
        user_id: userId,
        montant,
        description,
        commande_id,
        echeance_id,
        mode_paiement: "stripe"
      } as any);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[PaymentController] Error in createPublicStripeIntent:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
  
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
   * Body : { user_id, montant, methode_paiement_id, plan_tarifaire_id?, description?, date_paiement? }
   */
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        user_id,
        montant,
        methode_paiement_id,
        plan_tarifaire_id,
        description,
        date_paiement,
      } = req.body;

      const id = await createPaymentUC.execute({
        user_id: Number(user_id),
        montant: Number(montant),
        methode_paiement_id: Number(methode_paiement_id),
        plan_tarifaire_id: plan_tarifaire_id ? Number(plan_tarifaire_id) : null,
        description: description ?? null,
        date_paiement: date_paiement ?? null,
      });

      const payment = await getPaymentByIdUC.execute(id);

      // Email receipt
      if (payment && req.user?.email) {
        paymentEmailService.sendPaymentReceipt(
          req.user.email,
          "Membre", // User info not immediately joined, fallback
          payment.montant.toString(),
          payment.methode_nom || "Autre",
          payment.description || "Paiement"
        ).catch(e => console.error(e));
      }

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
      const { user_id, montant, plan_tarifaire_id, commande_id, echeance_id, description } = req.body;

      const result = await createStripeIntentUC.execute({
        user_id: Number(user_id),
        montant: Number(montant),
        plan_tarifaire_id: plan_tarifaire_id ? Number(plan_tarifaire_id) : null,
        commande_id: commande_id ? Number(commande_id) : null,
        echeance_id: echeance_id ? Number(echeance_id) : null,
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
   * POST /api/payments/:id/refund
   * Marque un paiement comme remboursé (admin uniquement)
   */
  async refund(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      
      const payment = await getPaymentByIdUC.execute(id);
      
      await refundPaymentUC.execute(id);

      // Email refund
      if (payment && req.user?.email) {
        paymentEmailService.sendRefundNotification(
          req.user.email,
          "Membre",
          payment.montant.toString(),
          payment.description || "Paiement"
        ).catch(e => console.error(e));
      }

      res.json({ success: true, message: "Paiement remboursé" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404
        : error.message.includes("déjà") || error.message.includes("Impossible") ? 400
        : 500;
      res.status(status).json({ success: false, message: error.message });
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
  
  async verifyPublicPayment(req: Request, res: Response): Promise<void> {
    try {
      const { payment_intent, item_type, item_id } = req.body;
      const payment_intent_id = payment_intent || req.body.payment_intent_id;
      
      if (!payment_intent_id) {
        res.status(400).json({ success: false, message: "payment_intent manquant" });
        return;
      }

      console.log("[verifyPublicPayment] Verifying intent:", payment_intent_id);
      const intent = await stripeService.stripe.paymentIntents.retrieve(payment_intent_id);
      
      if (intent.status === "succeeded") {
        const repo = new MySQLPaymentRepository();
        const payment = await repo.findByStripeIntentId(intent.id);
        
        console.log("[verifyPublicPayment] Found payment:", payment?.id, "statut:", payment?.statut_code);
        
        if (payment && payment.statut_code !== "valide") {
          const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : undefined;
          await repo.updateStatus(payment.id, 2, chargeId);

          if (payment.echeance_id) {
            await markScheduleAsPaidUC.execute(payment.echeance_id, payment.id);
            console.log("[verifyPublicPayment] Marked schedule as paid:", payment.echeance_id);
          }
          if (payment.commande_id) {
            await markOrderAsPaidUC.execute(payment.commande_id);
            console.log("[verifyPublicPayment] Marked order as paid:", payment.commande_id);
          }

          if (payment.user_email) {
            console.log("[verifyPublicPayment] Sending receipt to:", payment.user_email);
            await paymentEmailService.sendPaymentReceipt(
              payment.user_email,
              payment.user_first_name || "Membre",
              payment.montant.toString(),
              payment.methode_nom || "Stripe",
              payment.description || "Paiement"
            );
          } else {
            console.log("[verifyPublicPayment] No email found for user.");
          }
        }
      } else {
        console.log("[verifyPublicPayment] Intent not succeeded, status:", intent.status);
      }
      res.json({ success: true, status: intent.status });
    } catch (error: any) {
      console.error("[PaymentController] Error verifying payment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

    async verifyStripePayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        res.status(400).json({ success: false, message: "paymentIntentId manquant" });
        return;
      }
      const success = await verifyStripePaymentUC.execute(paymentIntentId);
      res.json({ success, message: success ? "Paiement valid�" : "Paiement non compl�t�" });
    } catch (error: any) {
      console.error("[PaymentController] Error in verifyStripePayment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

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
            await repo.updateStatus(payment.id, 2, chargeId); // 2 = valide
            
            // Lier le paiement au bon module si nécessaire
            if (payment.echeance_id) {
              await markScheduleAsPaidUC.execute(payment.echeance_id, payment.id);
            }
            if (payment.commande_id) {
              await markOrderAsPaidUC.execute(payment.commande_id);
            }

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
            await repo.updateStatus(payment.id, 3); // 3 = echoue
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


