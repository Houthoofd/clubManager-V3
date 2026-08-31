import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import type { EmailService } from "@/modules/auth/application/services/EmailService.js";

export class AnonymizeUserUseCase {
  constructor(
    private repo: IUserRepository,
    private emailService?: EmailService
  ) {}

  async execute(id: number, adminId?: number): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("Utilisateur introuvable");
    
    // Send email BEFORE anonymization happens, as the email address will be destroyed
    if (this.emailService && user.email) {
      await this.emailService.sendAccountDeletionEmail(user.email, user.first_name);
    }

    // Auto soft-delete if not already deleted
    if (!user.deleted_at) {
      const deletedBy = adminId || id;
      await this.repo.softDelete(id, deletedBy, "Anonymisation automatique après approbation RGPD");
    }

    await this.repo.anonymize(id);
  }
}
