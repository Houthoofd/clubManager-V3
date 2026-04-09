import type { User } from "@clubmanager/types";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class GetUserByIdUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("Utilisateur introuvable");
    return user;
  }
}
