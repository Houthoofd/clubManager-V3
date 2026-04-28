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

export interface UpdateUserProfileDto {
  first_name?: string;
  last_name?: string;
  telephone?: string | null;
  adresse?: string | null;
  date_of_birth?: string; // YYYY-MM-DD
  genre_id?: number;
  grade_id?: number | null;
  photo_url?: string | null;
}

export interface UserProfileDto {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string;
  email: string;
  date_of_birth: string;
  telephone: string | null;
  adresse: string | null;
  photo_url: string | null;
  email_verified: boolean;
  role_app: string;
  langue_preferee: string | null;
  date_inscription: string;
  derniere_connexion: string | null;
  genre: { id: number; nom: string } | null;
  grade: { id: number; nom: string; couleur: string | null } | null;
  abonnement: { id: number; nom: string; prix: number } | null;
  status: { id: number; nom: string };
}

export interface IUserRepository {
  findAll(query: GetUsersQueryDto): Promise<PaginatedUsersResponseDto>;
  findById(id: number): Promise<User | null>;
  findProfile(id: number): Promise<UserProfileDto | null>;
  updateRole(id: number, role_app: string): Promise<void>;
  updateStatus(id: number, status_id: number): Promise<void>;
  updateLanguage(id: number, langue_preferee: string): Promise<void>;
  updateProfile(
    id: number,
    data: UpdateUserProfileDto,
  ): Promise<UserProfileDto>;
  softDelete(id: number, deletedBy: number, reason: string): Promise<void>;
  restore(id: number): Promise<void>;
}
