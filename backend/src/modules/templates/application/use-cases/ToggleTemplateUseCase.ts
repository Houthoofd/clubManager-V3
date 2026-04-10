/**
 * ToggleTemplateUseCase
 * Active ou désactive un template existant
 */

import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";

export class ToggleTemplateUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(id: number, actif: boolean): Promise<void> {
    // Vérifier que le template existe
    const existing = await this.repo.getById(id);

    if (!existing) {
      throw new Error("Template introuvable");
    }

    await this.repo.toggle(id, actif);
  }
}
