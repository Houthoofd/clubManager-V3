import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';

export class RevokeSessionUseCase {
  constructor(private repo: IAuthRepository) {}
  async execute(sessionId: number, userId: number): Promise<boolean> {
    return this.repo.revokeSession(sessionId, userId);
  }
}
