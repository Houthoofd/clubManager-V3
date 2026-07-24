/**
 * InvitationController
 * Controller pour gérer les endpoints du module d'invitations
 * Instantiation des use cases et du repository au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLInvitationRepository } from "../../infrastructure/repositories/MySQLInvitationRepository.js";
import { SendInvitationUseCase } from "../../application/use-cases/SendInvitationUseCase.js";
import { ValidateInvitationUseCase } from "../../application/use-cases/ValidateInvitationUseCase.js";
import { GetInvitationsUseCase } from "../../application/use-cases/GetInvitationsUseCase.js";
import { RevokeInvitationUseCase } from "../../application/use-cases/RevokeInvitationUseCase.js";
import { EmailService } from "@/modules/auth/application/services/EmailService.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLInvitationRepository();
const sendInvitationUC = new SendInvitationUseCase(repo);
const validateInvitationUC = new ValidateInvitationUseCase(repo);
const getInvitationsUC = new GetInvitationsUseCase(repo);
const revokeInvitationUC = new RevokeInvitationUseCase(repo);
const emailService = new EmailService();

// ==================== CONTROLLER ====================

export class InvitationController {
  /**
   * POST /api/invitations
   * Envoie une invitation à un email (admin seulement)
   * Body : { email: string }
   */
  async sendInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email?: string };

      if (!email || typeof email !== "string" || !email.includes("@")) {
        res.status(400).json({ success: false, message: "Email invalide." });
        return;
      }

      const invited_by = req.user!.userId;
      const { token, invitation } = await sendInvitationUC.execute({
        email: email.trim().toLowerCase(),
        invited_by,
      });

      // Construire l'URL d'inscription avec le token
      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
      const registrationUrl = `${frontendUrl}/register?token=${token}`;

      // Nom de l'admin invitant (depuis le JOIN invitation ou email en fallback)
      const inviterName =
        invitation.invited_by_name ?? req.user?.email ?? "L'administrateur";

      // Envoyer l'email d'invitation
      const emailResult = await emailService.sendInvitationEmail(
        invitation.email,
        inviterName,
        registrationUrl,
        invitation.expires_at,
      );

      if (!emailResult.success && process.env.NODE_ENV !== "production") {
        console.log(
          `[InvitationController][DEV] Lien d'inscription (email non envoyé) :\n  ${registrationUrl}`,
        );
      }

      res.status(201).json({
        success: true,
        message: `Invitation envoyée à ${invitation.email}.`,
        data: {
          id: invitation.id,
          email: invitation.email,
          expires_at: invitation.expires_at,
          status: invitation.status,
          // En dev, on expose le lien pour faciliter les tests
          ...(process.env.NODE_ENV !== "production" && {
            _dev_registration_url: registrationUrl,
          }),
        },
      });
    } catch (error: any) {
      const msg = error.message as string;
      const status = msg.includes("déjà en attente") ? 409 : 500;
      res.status(status).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/invitations/validate?token=xxx
   * Valide un token d'invitation sans le consommer (route publique)
   */
  async validateToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.query["token"] as string | undefined;

      if (!token) {
        res.status(400).json({ success: false, message: "Token manquant." });
        return;
      }

      const result = await validateInvitationUC.execute({ token });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/invitations
   * Retourne la liste paginée des invitations (admin seulement)
   */
  async getInvitations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = req.query["page"] ? Number(req.query["page"]) : 1;
      const limit = req.query["limit"] ? Number(req.query["limit"]) : 20;

      const result = await getInvitationsUC.execute({ page, limit });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/invitations/:id
   * Révoque une invitation pending (admin seulement)
   */
  async revokeInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params["id"]);

      if (!id || isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "Identifiant d'invitation invalide.",
        });
        return;
      }

      await revokeInvitationUC.execute({ id });
      res.json({ success: true, message: "Invitation révoquée." });
    } catch (error: any) {
      const msg = error.message as string;
      const status = msg.includes("introuvable")
        ? 404
        : msg.includes("Impossible")
          ? 409
          : 500;
      res.status(status).json({ success: false, message: msg });
    }
  }
}
