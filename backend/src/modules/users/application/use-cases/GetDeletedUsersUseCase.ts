import type { IUserRepository, DeletedUserDto } from "../../domain/repositories/IUserRepository.js";

export class GetDeletedUsersUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(): Promise<DeletedUserDto[]> {
    return this.repo.findDeleted();
  }
}
