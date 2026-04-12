/**
 * MessagingController
 * Controller pour les endpoints de messagerie interne
 */

import type { Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/core/database/connection.js";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLMessagingRepository } from "../../infrastructure/repositories/MySQLMessagingRepository.js";
import { SendMessageUseCase } from "../../application/use-cases/SendMessageUseCase.js";
import { GetInboxUseCase } from "../../application/use-cases/GetInboxUseCase.js";
import { GetSentUseCase } from "../../application/use-cases/GetSentUseCase.js";
import { GetMessageUseCase } from "../../application/use-cases/GetMessageUseCase.js";
import { GetUnreadCountUseCase } from "../../application/use-cases/GetUnreadCountUseCase.js";
import { DeleteMessageUseCase } from "../../application/use-cases/DeleteMessageUseCase.js";

// ==================== SINGLETONS ====================

const repo = new MySQLMessagingRepository();
const sendMessageUC = new SendMessageUseCase(repo);
const getInboxUC = new GetInboxUseCase(repo);
const getSentUC = new GetSentUseCase(repo);
const getMessageUC = new GetMessageUseCase(repo);
const getUnreadCountUC = new GetUnreadCountUseCase(repo);
const deleteMessageUC = new DeleteMessageUseCase(repo);

// ==================== HELPER ROW INTERFACES ====================

interface UserEmailRow extends RowDataPacket {
  email: string | null;
  nom: string;
}

// ==================== CONTROLLER ====================

export class MessagingController {
  /**
   * GET /api/messages/inbox?page=&limit=&lu=
   * Retourne la boîte de réception paginée de l'utilisateur connecté
   */
  async getInbox(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      // Filtre optionnel lu/non-lu
      let lu: boolean | undefined;
      if (req.query.lu !== undefined) {
        lu = req.query.lu === "true" || req.query.lu === "1";
      }

      const result = await getInboxUC.execute(userId, page, limit, lu);

      res.json({
        success: true,
        message: "Boîte de réception récupérée",
        data: result,
      });
    } catch (error: any) {
      console.error("[MessagingController.getInbox]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/messages/sent?page=&limit=
   * Retourne la boîte d'envoi paginée de l'utilisateur connecté
   */
  async getSent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await getSentUC.execute(userId, page, limit);

      res.json({
        success: true,
        message: "Boîte d'envoi récupérée",
        data: result,
      });
    } catch (error: any) {
      console.error("[MessagingController.getSent]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/messages/:id
   * Retourne un message par son ID et le marque automatiquement comme lu
   * si l'utilisateur connecté est le destinataire
   */
  async getMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const messageId = Number(req.params.id);

      if (isNaN(messageId) || messageId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de message invalide",
          error: "INVALID_ID",
        });
        return;
      }

      const message = await getMessageUC.execute(messageId, userId);

      res.json({
        success: true,
        message: "Message récupéré",
        data: message,
      });
    } catch (error: any) {
      const isNotFound =
        error.message === "Message introuvable ou accès refusé";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: isNotFound ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/messages/unread-count
   * Retourne le nombre de messages non lus pour l'utilisateur connecté
   */
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await getUnreadCountUC.execute(userId);

      res.json({
        success: true,
        message: "Compteur de messages non lus récupéré",
        data: { unread: count },
      });
    } catch (error: any) {
      console.error("[MessagingController.getUnreadCount]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/messages/send
   * Envoie un message individuel ou groupé (broadcast)
   *
   * Body:
   *   - destinataire_id? : number   → message individuel
   *   - cible?           : 'tous' | 'admin' | 'professor' | 'member'  → broadcast
   *   - sujet?           : string
   *   - contenu          : string   (obligatoire)
   *   - envoye_par_email : boolean
   */
  async send(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role_app;

      const {
        destinataire_id,
        cible,
        sujet,
        contenu,
        envoye_par_email,
      } = req.body;

      // Validation minimale : ni destinataire ni cible
      if (!destinataire_id && !cible) {
        res.status(400).json({
          success: false,
          message: "Un destinataire (destinataire_id) ou une cible de broadcast (cible) est requis",
          error: "MISSING_RECIPIENT",
        });
        return;
      }

      // Validation contenu présent
      if (!contenu || String(contenu).trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Le contenu du message est requis",
          error: "MISSING_CONTENT",
        });
        return;
      }

      let destinataire_email: string | undefined;
      let destinataire_nom: string | undefined;

      // Si message individuel → récupérer email et nom du destinataire en DB
      if (destinataire_id) {
        const [rows] = await pool.query<UserEmailRow[]>(
          `SELECT email, CONCAT(first_name, ' ', last_name) AS nom
           FROM utilisateurs
           WHERE id = ?
             AND deleted_at IS NULL
             AND anonymized = FALSE
           LIMIT 1`,
          [Number(destinataire_id)],
        );

        if (rows.length === 0) {
          res.status(404).json({
            success: false,
            message: "Destinataire introuvable",
            error: "RECIPIENT_NOT_FOUND",
          });
          return;
        }

        destinataire_email = rows[0]!.email ?? undefined;
        destinataire_nom = rows[0]!.nom;
      }

      const result = await sendMessageUC.execute({
        expediteur_id: userId,
        expediteur_role: role ?? "member",
        destinataire_id: destinataire_id ? Number(destinataire_id) : undefined,
        destinataire_email,
        destinataire_nom,
        cible: cible ?? undefined,
        sujet: sujet ?? undefined,
        contenu: String(contenu),
        envoye_par_email: Boolean(envoye_par_email),
      });

      res.status(201).json({
        success: true,
        message: "Message envoyé avec succès",
        data: result,
      });
    } catch (error: any) {
      console.error("[MessagingController.send]", error);

      // Erreurs métier connues → 400
      const businessErrors = [
        "Le contenu du message est requis",
        "Le message est trop long",
        "Le destinataire est requis",
        "Vous ne pouvez pas vous envoyer",
        "Les membres ne peuvent pas envoyer",
      ];

      const isBusinessError = businessErrors.some((msg) =>
        error.message?.includes(msg),
      );

      res.status(isBusinessError ? 400 : 500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: isBusinessError ? "BAD_REQUEST" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * DELETE /api/messages/:id
   * Supprime définitivement un message pour le destinataire connecté
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const messageId = Number(req.params.id);

      if (isNaN(messageId) || messageId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de message invalide",
          error: "INVALID_ID",
        });
        return;
      }

      await deleteMessageUC.execute(messageId, userId);

      res.json({
        success: true,
        message: "Message supprimé",
      });
    } catch (error: any) {
      const isNotFound =
        error.message === "Message introuvable ou accès refusé";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: isNotFound ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }
}
