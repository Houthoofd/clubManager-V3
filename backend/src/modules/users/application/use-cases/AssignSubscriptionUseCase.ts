/**
 * AssignSubscriptionUseCase
 * Assigne ou retire un plan tarifaire à un utilisateur
 */
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class AssignSubscriptionUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(userId: number, abonnement_id: number | null): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) throw new Error("Utilisateur introuvable");
    await this.repo.updateSubscription(userId, abonnement_id);
  }
}
