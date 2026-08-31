import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import { PasswordService } from "../../../../shared/services/PasswordService.js";

interface EnableDependentLoginDto {
  dependentId: number;
  password: string;
  email?: string;
  parentId: number;
}

export class EnableDependentLoginUseCase {
  constructor(private repository: IFamilyRepository) {}

  async execute(dto: EnableDependentLoginDto): Promise<void> {
    const { dependentId, password, email, parentId } = dto;

    // 1. Verify the dependent is in the parent's family
    const family = await this.repository.findFamilleByUserId(parentId);
    
    if (!family) {
      throw new Error("Famille introuvable pour ce parent");
    }

    const isMember = await this.repository.isMembre(family.id, dependentId);
    if (!isMember) {
      throw new Error("L'utilisateur spécifié n'est pas membre de votre famille");
    }

    // 2. Validate password
    const validation = PasswordService.validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new Error(`Mot de passe invalide: ${validation.errors.join(", ")}`);
    }

    // 3. Hash password
    const passwordHash = await PasswordService.hash(password);

    // 4. Update the dependent account
    await this.repository.enableDependentLogin(dependentId, passwordHash, email);
  }
}
