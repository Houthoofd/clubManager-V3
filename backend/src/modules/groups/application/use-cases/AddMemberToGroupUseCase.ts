/**
 * AddMemberToGroupUseCase
 * Ajoute un utilisateur à un groupe (Application Layer)
 * Vérifie l'existence du groupe et que l'utilisateur n'est pas déjà membre.
 */

import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

export class AddMemberToGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(groupeId: number, userId: number): Promise<void> {
    // Vérifier que le groupe existe
    const group = await this.repo.findById(groupeId);
    if (!group) {
      throw new Error("Groupe introuvable");
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const alreadyMember = await this.repo.isMember(groupeId, userId);
    if (alreadyMember) {
      throw new Error("Cet utilisateur est déjà membre de ce groupe");
    }

    await this.repo.addMember({ groupe_id: groupeId, user_id: userId });
  }
}
