import type { IAuthRepository, ActiveSessionDto } from '../../domain/repositories/IAuthRepository.js';

export class GetActiveSessionsUseCase {
  constructor(private repo: IAuthRepository) {}
  async execute(userId: number): Promise<ActiveSessionDto[]> {
    return this.repo.getActiveSessions(userId);
  }
}
