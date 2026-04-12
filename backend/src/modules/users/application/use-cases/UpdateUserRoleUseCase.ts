import { UserRole } from "@clubmanager/types";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class UpdateUserRoleUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(targetId: number, role_app: string, requesterId: number): Promise<void> {
    if (!Object.values(UserRole).includes(role_app as UserRole)) {
      throw new Error(`Rôle invalide: ${role_app}`);
    }
    if (targetId === requesterId) {
      throw new Error("Vous ne pouvez pas modifier votre propre rôle");
    }
    const user = await this.repo.findById(targetId);
    if (!user) throw new Error("Utilisateur introuvable");
    await this.repo.updateRole(targetId, role_app);
  }
}
