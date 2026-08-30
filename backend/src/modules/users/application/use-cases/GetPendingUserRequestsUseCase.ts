import { IUserRequestRepository } from "../../domain/repositories/IUserRequestRepository.js";
import { UserRequest } from "../../domain/UserRequest.js";

export class GetPendingUserRequestsUseCase {
  constructor(private readonly repo: IUserRequestRepository) {}

  async execute(all: boolean = false): Promise<UserRequest[]> {
    if (all) {
      return this.repo.findAll();
    }
    return this.repo.findPending();
  }
}
