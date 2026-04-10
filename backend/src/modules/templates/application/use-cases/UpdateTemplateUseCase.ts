/**
 * UpdateTemplateUseCase
 * Cas d'utilisation pour la mise à jour d'un template existant
 */

import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";

// ==================== DTO ====================

export interface UpdateTemplateDto {
  type_id?: number;
  titre?: string;
  contenu?: string;
  actif?: boolean;
}

// ==================== USE CASE ====================

export class UpdateTemplateUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(id: number, dto: UpdateTemplateDto): Promise<void> {
    // Validation : au moins un champ doit être fourni
    if (
      dto.type_id === undefined &&
      dto.titre === undefined &&
      dto.contenu === undefined &&
      dto.actif === undefined
    ) {
      throw new Error("Au moins un champ doit être fourni pour la mise à jour");
    }

    // Validation : titre non vide si fourni
    if (dto.titre !== undefined && dto.titre.trim().length === 0) {
      throw new Error("Le titre du template ne peut pas être vide");
    }

    // Validation : contenu non vide si fourni
    if (dto.contenu !== undefined && dto.contenu.trim().length === 0) {
      throw new Error("Le contenu du template ne peut pas être vide");
    }

    // Vérifier que le template existe
    const existing = await this.repo.getById(id);

    if (!existing) {
      throw new Error("Template introuvable");
    }

    await this.repo.update(id, {
      type_id: dto.type_id,
      titre: dto.titre?.trim(),
      contenu: dto.contenu?.trim(),
      actif: dto.actif,
    });
  }
}
