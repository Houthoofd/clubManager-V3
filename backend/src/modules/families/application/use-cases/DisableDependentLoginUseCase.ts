import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";

interface DisableDependentLoginDto {
  dependentId: number;
  parentId: number;
}

export class DisableDependentLoginUseCase {
  constructor(private repository: IFamilyRepository) {}

  async execute(dto: DisableDependentLoginDto): Promise<void> {
    const { dependentId, parentId } = dto;

    // 1. Verify the dependent is in the parent's family
    const family = await this.repository.findFamilleByUserId(parentId);
    
    if (!family) {
      throw new Error("Famille introuvable pour ce parent");
    }

    const isMember = await this.repository.isMembre(family.id, dependentId);
    if (!isMember) {
      throw new Error("L'utilisateur spécifié n'est pas membre de votre famille");
    }

    // 2. Update the dependent account
    await this.repository.disableDependentLogin(dependentId);
  }
}
