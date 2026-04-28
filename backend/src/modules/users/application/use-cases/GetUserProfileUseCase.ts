/**
 * GetUserProfileUseCase
 * Application Layer — récupère le profil complet d'un utilisateur
 */

import type { IUserRepository, UserProfileDto } from '../../domain/repositories/IUserRepository.js';

export class GetUserProfileUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number): Promise<UserProfileDto> {
    const profile = await this.repo.findProfile(id);
    if (!profile) throw new Error('Utilisateur introuvable');
    return profile;
  }
}
