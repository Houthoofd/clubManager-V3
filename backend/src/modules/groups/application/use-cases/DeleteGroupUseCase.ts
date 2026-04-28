/**
 * DeleteGroupUseCase
 * Supprime un groupe existant (Application Layer)
 * Vérifie l'existence avant de déléguer la suppression au repository.
 * Le CASCADE sur groupes_utilisateurs est géré côté base de données.
 */

import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

export class DeleteGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(id: number): Promise<void> {
    const group = await this.repo.findById(id);
    if (!group) {
      throw new Error("Groupe introuvable");
    }

    await this.repo.delete(id);
  }
}
