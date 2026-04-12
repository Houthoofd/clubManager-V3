/**
 * GetPricingPlanByIdUseCase
 * Cas d'utilisation : récupérer un plan tarifaire par son ID
 * Lance une erreur explicite si le plan est introuvable
 */

import type {
  IPricingPlanRepository,
  PricingPlanRow,
} from "../../../domain/repositories/IPricingPlanRepository.js";

export class GetPricingPlanByIdUseCase {
  constructor(private repo: IPricingPlanRepository) {}

  async execute(id: number): Promise<PricingPlanRow> {
    const plan = await this.repo.findById(id);
    if (!plan) throw new Error("Plan introuvable");
    return plan;
  }
}
