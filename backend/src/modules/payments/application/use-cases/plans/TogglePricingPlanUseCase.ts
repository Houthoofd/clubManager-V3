/**
 * TogglePricingPlanUseCase
 * Cas d'utilisation : activer ou désactiver un plan tarifaire
 * Inverse l'état actif/inactif du plan et retourne l'état mis à jour
 */

import type {
  IPricingPlanRepository,
  PricingPlanRow,
} from "../../../domain/repositories/IPricingPlanRepository.js";

export class TogglePricingPlanUseCase {
  constructor(private repo: IPricingPlanRepository) {}

  async execute(id: number): Promise<PricingPlanRow> {
    const plan = await this.repo.findById(id);
    if (!plan) throw new Error("Plan introuvable");

    await this.repo.toggleActive(id, !plan.actif);

    const updated = await this.repo.findById(id);
    return updated!;
  }
}
