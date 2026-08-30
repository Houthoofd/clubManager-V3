import { IUserRequestRepository } from "../../domain/repositories/IUserRequestRepository.js";
import { UserRequest } from "../../domain/UserRequest.js";

export interface UpdateUserRequestStatusParams {
  request_id: number;
  status: 'approved' | 'rejected';
  admin_comment?: string;
}

export class UpdateUserRequestStatusUseCase {
  constructor(private readonly repo: IUserRequestRepository) {}

  async execute(params: UpdateUserRequestStatusParams): Promise<UserRequest> {
    const request = await this.repo.findById(params.request_id);
    if (!request) {
      throw new Error("User request not found");
    }
    return this.repo.updateStatus(params.request_id, params.status, params.admin_comment);
  }
}
