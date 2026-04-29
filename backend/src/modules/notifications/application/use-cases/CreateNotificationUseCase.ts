/**
 * CreateNotificationUseCase
 * Cas d'utilisation : créer une notification pour un utilisateur
 * Valide les champs requis et le type avant insertion
 * Ce use-case est conçu pour être appelé par d'autres modules
 * (ex: paiement confirmé, commande expédiée, etc.)
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { CreateNotificationDto, NotificationDto, NotificationKind } from '../../domain/types.js';

const VALID_TYPES: NotificationKind[] = ['info', 'warning', 'error', 'success'];

export class CreateNotificationUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(data: CreateNotificationDto): Promise<NotificationDto> {
    // Validate user_id
    if (!data.user_id || data.user_id <= 0) {
      throw new Error("L'identifiant de l'utilisateur est requis");
    }

    // Validate titre
    if (!data.titre || data.titre.trim().length === 0) {
      throw new Error('Le titre de la notification est requis');
    }

    // Validate contenu
    if (!data.contenu || data.contenu.trim().length === 0) {
      throw new Error('Le contenu de la notification est requis');
    }

    // Validate type
    if (!data.type || !VALID_TYPES.includes(data.type)) {
      throw new Error(
        `Le type de notification est invalide. Valeurs acceptées : ${VALID_TYPES.join(', ')}`,
      );
    }

    return this.repo.create({
      user_id: data.user_id,
      type: data.type,
      titre: data.titre.trim(),
      contenu: data.contenu.trim(),
    });
  }
}
