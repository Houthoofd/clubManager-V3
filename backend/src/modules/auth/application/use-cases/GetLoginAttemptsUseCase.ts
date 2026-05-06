/**
 * GetLoginAttemptsUseCase
 * Retourne les tentatives de connexion pour l'audit admin
 */
import type {
  IAuthRepository,
  LoginAttemptDto,
} from "../../domain/repositories/IAuthRepository.js";

export class GetLoginAttemptsUseCase {
  constructor(private repo: IAuthRepository) {}

  async execute(params: {
    page: number;
    limit: number;
    email?: string;
    ip?: string;
    onlyFailed?: boolean;
  }): Promise<{
    attempts: LoginAttemptDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { attempts, total } = await this.repo.getLoginAttempts(params);
    return {
      attempts,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }
}
