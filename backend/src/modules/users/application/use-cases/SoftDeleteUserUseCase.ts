import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { EmailService } from "@/modules/auth/application/services/EmailService.js";

export class SoftDeleteUserUseCase {
  constructor(
    private repo: IUserRepository,
    private emailService?: EmailService
  ) {}

  async execute(targetId: number, deletedBy: number, reason: string): Promise<void> {
    if (targetId === deletedBy) {
      throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    }
    if (!reason || reason.trim().length < 5) {
      throw new Error("Une raison d'au moins 5 caractères est requise");
    }
    const user = await this.repo.findById(targetId);
    if (!user) throw new Error("Utilisateur introuvable");
    if (user.deleted_at) throw new Error("Utilisateur déjà supprimé");
    await this.repo.softDelete(targetId, deletedBy, reason.trim());

    if (this.emailService && user.email) {
      this.emailService.sendAccountDeletionEmail(user.email, user.prenom || "Membre").catch(err => {
        console.error("Failed to send deletion email:", err);
      });
    }
  }
}
