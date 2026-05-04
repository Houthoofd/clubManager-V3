import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class AnonymizeUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("Utilisateur introuvable");
    if (!user.deleted_at)
      throw new Error(
        "L'utilisateur doit d'abord être supprimé (soft delete) avant d'être anonymisé",
      );
    await this.repo.anonymize(id);
  }
}
