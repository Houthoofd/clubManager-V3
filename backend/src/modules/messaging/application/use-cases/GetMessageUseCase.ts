/**
 * GetMessageUseCase
 * Récupère un message par son ID et le marque automatiquement comme lu
 * si l'utilisateur courant est le destinataire
 */

import type { IMessagingRepository, MessageWithDetails } from "../../domain/repositories/IMessagingRepository.js";

export class GetMessageUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(messageId: number, userId: number): Promise<MessageWithDetails> {
    const msg = await this.repo.getById(messageId, userId);

    if (!msg) {
      throw new Error("Message introuvable ou accès refusé");
    }

    // Auto-marquer comme lu si l'utilisateur courant est le destinataire
    if (msg.destinataire_id === userId && !msg.lu) {
      await this.repo.markAsRead(messageId, userId);
      msg.lu = true;
      msg.date_lecture = new Date();
    }

    return msg;
  }
}
