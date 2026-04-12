/**
 * CreateTemplateUseCase
 * Crée un nouveau template de message personnalisé
 * Extrait automatiquement les variables {{variable}} présentes dans le contenu
 */

import type {
  ITemplateRepository,
  Template,
} from "../../domain/repositories/ITemplateRepository.js";

// ==================== DTO ====================

export interface CreateTemplateDto {
  type_id: number;
  titre: string;
  contenu: string;
  actif?: boolean;
}

// ==================== USE CASE ====================

export class CreateTemplateUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(dto: CreateTemplateDto): Promise<Template> {
    // Validation : titre obligatoire
    if (!dto.titre || dto.titre.trim().length === 0) {
      throw new Error("Le titre du template est requis");
    }

    if (dto.titre.trim().length > 255) {
      throw new Error(
        "Le titre du template ne peut pas dépasser 255 caractères",
      );
    }

    // Validation : contenu obligatoire
    if (!dto.contenu || dto.contenu.trim().length === 0) {
      throw new Error("Le contenu du template est requis");
    }

    // Validation : type_id requis
    if (!dto.type_id || isNaN(dto.type_id) || dto.type_id <= 0) {
      throw new Error("Le type du template est requis");
    }

    // Vérifier que le type existe
    const types = await this.repo.getTypes();
    const typeExists = types.some((t) => t.id === dto.type_id);

    if (!typeExists) {
      throw new Error("Type de template introuvable");
    }

    // Créer le template (les variables sont extraites côté repository/mapping)
    const template = await this.repo.create({
      type_id: dto.type_id,
      titre: dto.titre.trim(),
      contenu: dto.contenu.trim(),
      actif: dto.actif ?? true,
    });

    return template;
  }
}
