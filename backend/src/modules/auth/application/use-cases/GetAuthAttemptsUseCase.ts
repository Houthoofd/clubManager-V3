/**
 * GetAuthAttemptsUseCase
 * Retourne les tentatives d'authentification pour l'audit admin
 */
import type {
  IAuthRepository,
  AuthAttemptDto,
} from "../../domain/repositories/IAuthRepository.js";

export class GetAuthAttemptsUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(params: {
    page: number;
    limit: number;
    email?: string;
    ip?: string;
    onlyFailed?: boolean;
  }): Promise<{
    attempts: AuthAttemptDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { attempts, total } = await this.repo.getAuthAttempts(params);
    return {
      attempts,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }
}
