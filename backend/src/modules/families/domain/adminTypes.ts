/**
 * Families Admin Domain Types
 * Types additionnels pour les endpoints admin du module familles
 */

export interface FamilyWithCount {
  id: number;
  nom: string | null;
  membre_count: number;
  created_at: string;
  updated_at: string;
}

export interface GetFamiliesQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedFamiliesResponse {
  families: FamilyWithCount[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateFamilyDto {
  id: number;
  nom?: string | null;
}

export interface AdminAddMemberDto {
  familleId: number;
  userId: number;
  role: 'parent' | 'tuteur' | 'enfant' | 'conjoint' | 'autre';
  estResponsable: boolean;
  estTuteurLegal: boolean;
}
