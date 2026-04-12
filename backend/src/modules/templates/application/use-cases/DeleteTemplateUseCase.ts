/**
 * DeleteTemplateUseCase
 * Supprime définitivement un template de message personnalisé
 */

import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";

export class DeleteTemplateUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(id: number): Promise<void> {
    // Vérifier que le template existe avant de supprimer
    const existing = await this.repo.getById(id);

    if (!existing) {
      throw new Error("Template introuvable");
    }

    await this.repo.delete(id);
  }
}
