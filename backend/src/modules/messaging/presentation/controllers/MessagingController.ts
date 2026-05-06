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
import { ArchiveMessageUseCase } from "../../application/use-cases/ArchiveMessageUseCase.js";
import { GetArchivedMessagesUseCase } from "../../application/use-cases/GetArchivedMessagesUseCase.js";

// ==================== SINGLETONS ====================

const repo = new MySQLMessagingRepository();
const sendMessageUC = new SendMessageUseCase(repo);
const getInboxUC = new GetInboxUseCase(repo);
const getSentUC = new GetSentUseCase(repo);
const getMessageUC = new GetMessageUseCase(repo);
const getUnreadCountUC = new GetUnreadCountUseCase(repo);
const deleteMessageUC = new DeleteMessageUseCase(repo);
const archiveMessageUC = new ArchiveMessageUseCase(repo);
const getArchivedMessagesUC = new GetArchivedMessagesUseCase(repo);

// ==================== HELPER ROW INTERFACES ====================

interface UserEmailRow extends RowDataPacket {
  email: string | null;
  nom: string;
}

// ==================== CONTROLLER ====================

export class MessagingController {
  /**
   * GET /api/messages/inbox?page=&limit=&lu=
   * Retourne la boite de reception paginee de l'utilisateur connecte
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
        message: "Boite de reception recuperee",
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
   * Retourne la boite d'envoi paginee de l'utilisateur connecte
   */
  async getSent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await getSentUC.execute(userId, page, limit);

      res.json({
        success: true,
        message: "Boite d'envoi recuperee",
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
   * si l'utilisateur connecte est le destinataire
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
        message: "Message recupere",
        data: message,
      });
    } catch (error: any) {
      const isNotFound =
        error.message === "Message introuvable ou acces refuse";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: isNotFound ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/messages/unread-count
   * Retourne le nombre de messages non lus pour l'utilisateur connecte
   */
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await getUnreadCountUC.execute(userId);

      res.json({
        success: true,
        message: "Compteur de messages non lus recupere",
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
   * Envoie un message individuel ou groupe (broadcast)
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

      // Validation contenu present
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

      // Si message individuel -> recuperer email et nom du destinataire en DB
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
        message: "Message envoye avec succes",
        data: result,
      });
    } catch (error: any) {
      console.error("[MessagingController.send]", error);

      // Erreurs metier connues -> 400
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
   * Supprime definitivement un message pour le destinataire connecte
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
        message: "Message supprime",
      });
    } catch (error: any) {
      const isNotFound =
        error.message === "Message introuvable ou acces refuse";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: isNotFound ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * POST /api/messages/:id/archive
   * Archive un message pour le destinataire connecte
   */
  async archiveMessage(req: AuthRequest, res: Response): Promise<void> {
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

      await archiveMessageUC.execute(messageId, userId);

      res.json({
        success: true,
        message: "Message archive",
      });
    } catch (error: any) {
      const isNotFound =
        error.message === "Message introuvable ou acces refuse";
      res.status(isNotFound ? 404 : 500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: isNotFound ? "NOT_FOUND" : "INTERNAL_ERROR",
      });
    }
  }

  /**
   * GET /api/messages/archived?page=&limit=
   * Retourne les messages archives pagines de l'utilisateur connecte
   */
  async getArchived(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await getArchivedMessagesUC.execute(userId, page, limit);

      res.json({
        success: true,
        message: "Messages archives recuperes",
        data: result,
      });
    } catch (error: any) {
      console.error("[MessagingController.getArchived]", error);
      res.status(500).json({
        success: false,
        message: error.message ?? "Erreur interne",
        error: "INTERNAL_ERROR",
      });
    }
  }
}
