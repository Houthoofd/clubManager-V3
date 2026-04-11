/**
 * DeletePricingPlanUseCase
 * Cas d'utilisation : supprimer un plan tarifaire
 * Vérifie l'existence du plan avant la suppression définitive
 */

import type { IPricingPlanRepository } from "../../../domain/repositories/IPricingPlanRepository.js";

export class DeletePricingPlanUseCase {
  constructor(private repo: IPricingPlanRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Plan introuvable");

    await this.repo.delete(id);
  }
}
