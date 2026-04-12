import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class RestoreUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(targetId: number): Promise<void> {
    const user = await this.repo.findById(targetId);
    if (!user) throw new Error("Utilisateur introuvable");
    await this.repo.restore(targetId);
  }
}
