/**
 * SendMessageUseCase
 * Cas d'utilisation pour l'envoi de messages (individuel ou broadcast groupé)
 */

import { UserRole } from "@clubmanager/types";
import type { IMessagingRepository, BroadcastParams } from "../../domain/repositories/IMessagingRepository.js";
import { MessagingEmailService } from "../services/MessagingEmailService.js";

// ==================== DTO ====================

export interface SendMessageDto {
  expediteur_id: number;
  expediteur_role: string;
  // Pour message individuel :
  destinataire_id?: number;
  destinataire_email?: string;
  destinataire_nom?: string;
  // Pour broadcast :
  cible?: 'tous' | 'admin' | 'professor' | 'member';
  // Commun :
  sujet?: string;
  contenu: string;
  envoye_par_email: boolean;
}

export interface SendMessageResult {
  messageIds: number[];
  broadcastId?: number;
}

// ==================== USE CASE ====================

export class SendMessageUseCase {
  private emailService = new MessagingEmailService();

  constructor(private repo: IMessagingRepository) {}

  async execute(dto: SendMessageDto): Promise<SendMessageResult> {
    // Validation du contenu
    if (!dto.contenu || dto.contenu.trim().length === 0) {
      throw new Error("Le contenu du message est requis");
    }
    if (dto.contenu.trim().length > 65535) {
      throw new Error("Le message est trop long");
    }

    // ===================================================================
    // CAS 1 : BROADCAST (envoi groupé)
    // ===================================================================
    if (dto.cible) {
      // Seuls admin et professor peuvent broadcaster
      if (dto.expediteur_role === UserRole.MEMBER) {
        throw new Error("Les membres ne peuvent pas envoyer de messages groupés");
      }

      // Créer l'enregistrement broadcast
      const broadcastId = await this.repo.createBroadcast({
        expediteur_id: dto.expediteur_id,
        sujet: dto.sujet,
        contenu: dto.contenu,
        cible: dto.cible,
        envoye_par_email: dto.envoye_par_email,
      } satisfies BroadcastParams);

      // Récupérer les destinataires selon la cible
      const recipients = await this.repo.getRecipientsForBroadcast(dto.cible);

      // Exclure l'expéditeur de la liste
      const filtered = recipients.filter((r) => r.id !== dto.expediteur_id);

      const messageIds: number[] = [];

      for (const recipient of filtered) {
        // Insérer le message individuel lié au broadcast
        const msgId = await this.repo.sendToUser({
          expediteur_id: dto.expediteur_id,
          destinataire_id: recipient.id,
          sujet: dto.sujet,
          contenu: dto.contenu,
          broadcast_id: broadcastId,
          envoye_par_email: dto.envoye_par_email,
        });
        messageIds.push(msgId);

        // Envoyer la notification email si demandé
        if (dto.envoye_par_email && recipient.email) {
          await this.emailService.sendMessageNotification({
            to: recipient.email,
            recipientName: `${recipient.first_name} ${recipient.last_name}`,
            senderName: `Équipe ClubManager`,
            subject: dto.sujet ?? null,
            contentPreview: dto.contenu,
          });
        }
      }

      // Mettre à jour le compteur de destinataires du broadcast
      await this.repo.updateBroadcastCount(broadcastId, filtered.length);

      return { messageIds, broadcastId };
    }

    // ===================================================================
    // CAS 2 : MESSAGE INDIVIDUEL
    // ===================================================================
    if (!dto.destinataire_id) {
      throw new Error("Le destinataire est requis pour un message individuel");
    }
    if (dto.destinataire_id === dto.expediteur_id) {
      throw new Error("Vous ne pouvez pas vous envoyer un message à vous-même");
    }

    const msgId = await this.repo.sendToUser({
      expediteur_id: dto.expediteur_id,
      destinataire_id: dto.destinataire_id,
      sujet: dto.sujet,
      contenu: dto.contenu,
      envoye_par_email: dto.envoye_par_email,
    });

    // Envoyer la notification email si demandé et email disponible
    if (dto.envoye_par_email && dto.destinataire_email) {
      await this.emailService.sendMessageNotification({
        to: dto.destinataire_email,
        recipientName: dto.destinataire_nom ?? "Membre",
        senderName: "Un membre du club",
        subject: dto.sujet ?? null,
        contentPreview: dto.contenu,
      });
    }

    return { messageIds: [msgId] };
  }
}
