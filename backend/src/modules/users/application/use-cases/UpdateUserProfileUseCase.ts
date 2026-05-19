import type {
  IUserRepository,
  UpdateUserProfileDto,
  UserProfileDto,
} from "../../domain/repositories/IUserRepository.js";

export class UpdateUserProfileUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(
    id: number,
    requesterId: number,
    requesterRole: string,
    data: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    // Security: user can only edit own profile (unless admin)
    if (id !== requesterId && requesterRole !== "admin") {
      throw new Error(
        "Accès refusé : vous ne pouvez modifier que votre propre profil",
      );
    }
    // Validate name fields
    if (data.first_name !== undefined && data.first_name.trim().length < 2) {
      throw new Error("Le prénom doit contenir au moins 2 caractères");
    }
    if (data.last_name !== undefined && data.last_name.trim().length < 2) {
      throw new Error("Le nom doit contenir au moins 2 caractères");
    }
    // Sanitize — only include fields that were explicitly provided to avoid
    // overwriting NOT NULL columns with null via hasOwnProperty in the repo
    const sanitized: UpdateUserProfileDto = { ...data };
    if (data.first_name !== undefined)
      sanitized.first_name = data.first_name.trim();
    if (data.last_name !== undefined)
      sanitized.last_name = data.last_name.trim();
    if (data.telephone !== undefined)
      sanitized.telephone = data.telephone?.trim() || null;
    if (data.adresse !== undefined)
      sanitized.adresse = data.adresse?.trim() || null;
    return this.repo.updateProfile(id, sanitized);
  }
}
