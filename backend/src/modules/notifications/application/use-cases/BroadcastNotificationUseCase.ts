/**
 * BroadcastNotificationUseCase
 * Envoie une notification à un groupe d'utilisateurs selon la cible
 */
import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { BroadcastNotificationDto, BroadcastResultDto } from '../../domain/types.js';

export class BroadcastNotificationUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(dto: BroadcastNotificationDto): Promise<BroadcastResultDto> {
    const userIds = await this.repo.getUserIdsByCible(dto.cible);

    if (userIds.length === 0) {
      return { sent: 0, skipped: 0 };
    }

    const notifications = userIds.map((uid) => ({
      user_id: uid,
      type: dto.type,
      titre: dto.titre,
      contenu: dto.contenu,
    }));

    const sent = await this.repo.createBulk(notifications);

    return { sent, skipped: userIds.length - sent };
  }
}
