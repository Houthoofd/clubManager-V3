import { IUserRequestRepository } from "../../domain/repositories/IUserRequestRepository.js";
import { UserRequest } from "../../domain/UserRequest.js";

export class GetMyUserRequestsUseCase {
  constructor(private readonly repo: IUserRequestRepository) {}

  async execute(userId: number): Promise<UserRequest[]> {
    return this.repo.findByUserId(userId);
  }
}
