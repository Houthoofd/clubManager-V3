/**
 * OrderController
 * Controller pour gérer les endpoints des commandes
 * Gère la création de commandes avec gestion automatique des stocks
 * Instantiation au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import type { OrderStatus } from "@clubmanager/types";
import { MySQLOrderRepository } from "../../infrastructure/repositories/MySQLOrderRepository.js";
import { MySQLStockRepository } from "../../infrastructure/repositories/MySQLStockRepository.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const orderRepo = new MySQLOrderRepository();
const stockRepo = new MySQLStockRepository();

// ==================== CONTROLLER ====================

export class OrderController {
  /**
   * GET /api/store/orders
   * Retourne la liste paginée des commandes (admin + professor)
   * Query params: user_id, statut, page, limit
   */
  async getOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
      const statut = req.query.statut as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await orderRepo.findAll({
        user_id: userId,
        statut,
        page,
        limit,
      });

      res.json({
        success: true,
        message: "Commandes récupérées",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[OrderController.getOrders]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/orders/my
   * Retourne les commandes de l'utilisateur connecté
   */
  async getMyOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Non authentifié",
        });
        return;
      }

      const result = await orderRepo.findByUserId(userId);

      res.json({
        success: true,
        message: "Mes commandes récupérées",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[OrderController.getMyOrders]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/orders/:id
   * Retourne une commande par son ID avec tous ses items
   */
  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await orderRepo.findById(id);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Commande introuvable",
        });
        return;
      }

      res.json({
        success: true,
        message: "Commande récupérée",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[OrderController.getOrderById]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/orders
   * Crée une nouvelle commande et diminue les stocks automatiquement
   * Body: { items: [{ article_id, taille_id, quantite, prix }] }
   */
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Non authentifié",
        });
        return;
      }

      const { items } = req.body;

      // Validation
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: "La commande doit contenir au moins un article",
        });
        return;
      }

      // Valider chaque item
      for (const item of items) {
        if (
          !item.article_id ||
          !item.taille_id ||
          !item.quantite ||
          !item.prix
        ) {
          res.status(400).json({
            success: false,
            message:
              "Chaque item doit contenir article_id, taille_id, quantite et prix",
          });
          return;
        }

        if (item.quantite <= 0) {
          res.status(400).json({
            success: false,
            message: "La quantité doit être supérieure à 0",
          });
          return;
        }

        if (item.prix < 0) {
          res.status(400).json({
            success: false,
            message: "Le prix doit être positif",
          });
          return;
        }
      }

      // Vérifier la disponibilité des stocks AVANT de créer la commande
      for (const item of items) {
        const stock = await stockRepo.findByArticleAndSize(
          item.article_id,
          item.taille_id,
        );

        if (!stock) {
          res.status(400).json({
            success: false,
            message: `Stock introuvable pour l'article ${item.article_id}`,
          });
          return;
        }

        if (stock.quantite < item.quantite) {
          res.status(400).json({
            success: false,
            message: `Stock insuffisant pour ${stock.article_nom ?? "l'article"} (taille ${stock.taille_nom ?? "N/A"}). Disponible: ${stock.quantite}`,
          });
          return;
        }
      }

      // Récupérer IP et User-Agent
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        null;
      const userAgent = req.headers["user-agent"] || null;

      // Créer la commande (qui génère automatiquement unique_id et numero_commande)
      const orderId = await orderRepo.create({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        items: items.map((item) => ({
          article_id: Number(item.article_id),
          taille_id: Number(item.taille_id),
          quantite: Number(item.quantite),
          prix: Number(item.prix),
        })),
      });

      // Diminuer les stocks
      await stockRepo.decreaseForOrder(
        items.map((item) => ({
          article_id: Number(item.article_id),
          taille_id: Number(item.taille_id),
          quantite: Number(item.quantite),
        })),
        orderId,
        userId,
      );

      // Récupérer la commande créée avec tous ses détails
      const order = await orderRepo.findById(orderId);

      res.status(201).json({
        success: true,
        message: "Commande créée",
        data: order,
      });
    } catch (error: unknown) {
      console.error("[OrderController.createOrder]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * PATCH /api/store/orders/:id/status
   * Met à jour le statut d'une commande (admin only)
   * Body: { statut: OrderStatus }
   */
  async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { statut } = req.body;

      // Vérifier que la commande existe
      const existing = await orderRepo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Commande introuvable",
        });
        return;
      }

      // Validation du statut
      const validStatuses = [
        "en_attente",
        "payee",
        "expediee",
        "livree",
        "annulee",
      ];
      if (!statut || !validStatuses.includes(statut)) {
        res.status(400).json({
          success: false,
          message: `Statut invalide. Valeurs possibles: ${validStatuses.join(", ")}`,
        });
        return;
      }

      await orderRepo.updateStatus(id, statut as OrderStatus);

      const updated = await orderRepo.findById(id);

      res.json({
        success: true,
        message: "Statut de la commande mis à jour",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[OrderController.updateOrderStatus]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/orders/:id/cancel
   * Annule une commande et restaure les stocks
   * Autorisé uniquement si la commande est en_attente ou payee
   * L'utilisateur peut annuler sa propre commande, l'admin peut tout annuler
   */
  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const userId = req.user?.userId;
      const userRole = req.user?.role_app;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Non authentifié",
        });
        return;
      }

      // Vérifier que la commande existe
      const existing = await orderRepo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Commande introuvable",
        });
        return;
      }

      // Vérifier les permissions : propriétaire ou admin
      if (existing.user_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à annuler cette commande",
        });
        return;
      }

      // Vérifier que la commande est annulable
      if (existing.statut !== "en_attente" && existing.statut !== "payee") {
        res.status(400).json({
          success: false,
          message:
            "Seules les commandes en attente ou payées peuvent être annulées",
        });
        return;
      }

      // Annuler la commande
      await orderRepo.updateStatus(id, "annulee" as OrderStatus);

      // Restaurer les stocks
      await stockRepo.restoreForCancellation(id, userId);

      const updated = await orderRepo.findById(id);

      res.json({
        success: true,
        message: "Commande annulée et stocks restaurés",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[OrderController.cancelOrder]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
