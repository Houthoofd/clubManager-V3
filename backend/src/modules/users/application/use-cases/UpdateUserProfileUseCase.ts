import type { IUserRepository, UpdateUserProfileDto, UserProfileDto } from '../../domain/repositories/IUserRepository.js';

export class UpdateUserProfileUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number, requesterId: number, requesterRole: string, data: UpdateUserProfileDto): Promise<UserProfileDto> {
    // Security: user can only edit own profile (unless admin)
    if (id !== requesterId && requesterRole !== 'admin') {
      throw new Error('Vous ne pouvez modifier que votre propre profil');
    }
    // Validate name fields
    if (data.first_name !== undefined && data.first_name.trim().length < 2) {
      throw new Error('Le prénom doit contenir au moins 2 caractères');
    }
    if (data.last_name !== undefined && data.last_name.trim().length < 2) {
      throw new Error('Le nom doit contenir au moins 2 caractères');
    }
    // Sanitize
    const sanitized: UpdateUserProfileDto = {
      ...data,
      first_name: data.first_name?.trim(),
      last_name: data.last_name?.trim(),
      telephone: data.telephone?.trim() || null,
      adresse: data.adresse?.trim() || null,
    };
    return this.repo.updateProfile(id, sanitized);
  }
}
