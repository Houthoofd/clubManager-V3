/**
 * CreateGroupUseCase
 * Cas d'usage pour la création d'un nouveau groupe (Application Layer)
 */

import type { Group, CreateGroupDto } from "../../domain/types.js";
import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

export class CreateGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(data: CreateGroupDto): Promise<Group> {
    // Validation : nom requis, non vide et minimum 2 caractères
    const nom = data.nom?.trim();
    if (!nom) {
      throw new Error("Le nom du groupe est requis");
    }
    if (nom.length < 2) {
      throw new Error("Le nom du groupe doit contenir au moins 2 caractères");
    }

    return this.repo.create({
      nom,
      description: data.description ?? null,
    });
  }
}
