import { UserRequest } from "../UserRequest.js";

export interface CreateUserRequestDto {
  user_id: number;
  type: 'account_deletion' | 'other';
  message?: string;
}

export interface IUserRequestRepository {
  create(data: CreateUserRequestDto): Promise<UserRequest>;
  findByUserId(user_id: number): Promise<UserRequest[]>;
  findPending(): Promise<UserRequest[]>;
  findAll(): Promise<UserRequest[]>;
  findById(id: number): Promise<UserRequest | null>;
  updateStatus(id: number, status: 'approved' | 'rejected', admin_comment?: string): Promise<UserRequest>;
}
