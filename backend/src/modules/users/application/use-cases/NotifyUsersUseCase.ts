/**
 * NotifyUsersUseCase
 * Envoie un message interne (et optionnellement un email) à une liste d’utilisateurs.
 */

import { MySQLMessagingRepository } from "@/modules/messaging/infrastructure/repositories/MySQLMessagingRepository.js";
import { MessagingEmailService } from "@/modules/messaging/application/services/MessagingEmailService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export interface NotifyUsersDto {
  expediteur_id: number;
  user_ids: number[];
  sujet?: string;
  contenu: string;
  envoye_par_email: boolean;
}

export interface NotifyUsersResult {
  sent: number;
  errors: number;
  total: number;
}

export class NotifyUsersUseCase {
  private messagingRepo = new MySQLMessagingRepository();
  private emailService = new MessagingEmailService();

  constructor(private userRepo: IUserRepository) {}

  async execute(dto: NotifyUsersDto): Promise<NotifyUsersResult> {
    if (!dto.contenu || dto.contenu.trim().length === 0)
      throw new Error("Le contenu du message est requis");
    if (dto.user_ids.length === 0)
      throw new Error("Aucun destinataire sélectionné");
    if (dto.user_ids.length > 200)
      throw new Error("Maximum 200 destinataires à la fois");

    let sent = 0;
    let errors = 0;

    for (const userId of dto.user_ids) {
      try {
        const user = await this.userRepo.findById(userId);
        if (!user) { errors++; continue; }

        // Store the message
        await this.messagingRepo.sendToUser({
          expediteur_id: dto.expediteur_id,
          destinataire_id: userId,
          sujet: dto.sujet,
          contenu: dto.contenu,
          envoye_par_email: dto.envoye_par_email,
        });

        // Send email notification if requested
        if (dto.envoye_par_email && user.email) {
          await this.emailService.sendMessageNotification({
            to: user.email,
            recipientName: `${user.first_name} ${user.last_name}`,
            senderName: "Administration du club",
            subject: dto.sujet ?? null,
            contentPreview: dto.contenu,
          });
        }

        sent++;
      } catch {
        errors++;
      }
    }

    return { sent, errors, total: dto.user_ids.length };
  }
}
