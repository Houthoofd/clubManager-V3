/**
 * UpdateGroupUseCase
 * Met à jour un groupe existant (Application Layer)
 * Valide le nom si fourni, puis délègue au repository.
 */

import type { Group, UpdateGroupDto } from "../../domain/types.js";
import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

export class UpdateGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(data: UpdateGroupDto): Promise<Group> {
    // Vérifier que le groupe existe
    const existing = await this.repo.findById(data.id);
    if (!existing) {
      throw new Error("Groupe introuvable");
    }

    // Valider le nom si fourni
    if (data.nom !== undefined) {
      const nom = data.nom.trim();
      if (nom.length < 2) {
        throw new Error("Le nom du groupe doit contenir au moins 2 caractères");
      }
      data = { ...data, nom };
    }

    return this.repo.update(data);
  }
}
