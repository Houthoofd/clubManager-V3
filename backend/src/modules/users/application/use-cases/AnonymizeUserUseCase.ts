import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class AnonymizeUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number, adminId?: number): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("Utilisateur introuvable");
    
    // Auto soft-delete if not already deleted
    if (!user.deleted_at) {
      const deletedBy = adminId || id;
      await this.repo.softDelete(id, deletedBy, "Anonymisation automatique après approbation RGPD");
    }

    await this.repo.anonymize(id);
  }
}
