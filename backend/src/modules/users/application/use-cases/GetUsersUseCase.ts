import type { GetUsersQueryDto, PaginatedUsersResponseDto } from "@clubmanager/types";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export class GetUsersUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(query: GetUsersQueryDto): Promise<PaginatedUsersResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
