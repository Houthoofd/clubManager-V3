import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class UpdateUserStatusUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(targetId: number, status_id: number, requesterId: number): Promise<void> {
    if (targetId === requesterId) {
      throw new Error("Vous ne pouvez pas modifier votre propre statut");
    }
    const user = await this.repo.findById(targetId);
    if (!user) throw new Error("Utilisateur introuvable");
    await this.repo.updateStatus(targetId, status_id);
  }
}
