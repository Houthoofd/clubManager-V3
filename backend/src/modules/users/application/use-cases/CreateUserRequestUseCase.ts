import { IUserRequestRepository } from "../../domain/repositories/IUserRequestRepository.js";
import { UserRequest } from "../../domain/UserRequest.js";

export interface CreateUserRequestParams {
  user_id: number;
  type: 'account_deletion' | 'other';
  message?: string;
}

export class CreateUserRequestUseCase {
  constructor(private readonly repo: IUserRequestRepository) {}

  async execute(params: CreateUserRequestParams): Promise<UserRequest> {
    return this.repo.create(params);
  }
}
