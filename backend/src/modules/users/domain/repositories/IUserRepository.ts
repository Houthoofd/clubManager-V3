/**
 * IUserRepository
 * Interface du repository users (Domain Layer)
 * Contrat pour les opérations de gestion des utilisateurs en base de données
 */

import type { User } from "@clubmanager/types";
import type {
  GetUsersQueryDto,
  PaginatedUsersResponseDto,
} from "@clubmanager/types";

export interface IUserRepository {
  findAll(query: GetUsersQueryDto): Promise<PaginatedUsersResponseDto>;
  findById(id: number): Promise<User | null>;
  updateRole(id: number, role_app: string): Promise<void>;
  updateStatus(id: number, status_id: number): Promise<void>;
  updateLanguage(id: number, langue_preferee: string): Promise<void>;
  softDelete(id: number, deletedBy: number, reason: string): Promise<void>;
  restore(id: number): Promise<void>;
}
