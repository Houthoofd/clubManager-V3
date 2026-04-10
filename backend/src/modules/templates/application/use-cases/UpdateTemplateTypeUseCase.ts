/**
 * UpdateTemplateTypeUseCase
 * Cas d'utilisation pour la mise à jour d'un type de template
 */

import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";

// ==================== DTO ====================

export interface UpdateTemplateTypeDto {
  nom?: string;
  description?: string;
  actif?: boolean;
}

// ==================== USE CASE ====================

export class UpdateTemplateTypeUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(id: number, dto: UpdateTemplateTypeDto): Promise<void> {
    // Validation : au moins un champ doit être fourni
    if (
      dto.nom === undefined &&
      dto.description === undefined &&
      dto.actif === undefined
    ) {
      throw new Error("Au moins un champ doit être fourni pour la mise à jour");
    }

    // Validation : nom non vide si fourni
    if (dto.nom !== undefined && dto.nom.trim().length === 0) {
      throw new Error("Le nom du type ne peut pas être vide");
    }

    // Vérifier que le type existe
    const types = await this.repo.getTypes();
    const existing = types.find((t) => t.id === id);

    if (!existing) {
      throw new Error("Type de template introuvable");
    }

    await this.repo.updateType(id, {
      nom: dto.nom?.trim(),
      description: dto.description?.trim(),
      actif: dto.actif,
    });
  }
}
