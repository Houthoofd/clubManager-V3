/**
 * Groups Domain Types
 * Basé sur les tables `groupes` et `groupes_utilisateurs`
 */

export interface Group {
  id: number;
  nom: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  membre_count?: number;
}

export interface GroupMember {
  id: number;
  groupe_id: number;
  user_id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  role_app: string | null;
  photo_url: string | null;
}

export interface CreateGroupDto {
  nom: string;
  description?: string | null;
}

export interface UpdateGroupDto {
  id: number;
  nom?: string;
  description?: string | null;
}

export interface AddMemberDto {
  groupe_id: number;
  user_id: number;
}

export interface RemoveMemberDto {
  groupe_id: number;
  user_id: number;
}

export interface GetGroupsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedGroupsResponse {
  groups: Group[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
