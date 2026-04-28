/**
 * profileApi.ts
 * Appels API pour le profil utilisateur
 */

import apiClient from '../../../shared/api/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfileDto {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string;
  email: string;
  date_of_birth: string; // ISO date
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

// ─── API Calls ────────────────────────────────────────────────────────────────

export const profileApi = {
  /**
   * Récupère le profil complet d'un utilisateur par son ID numérique
   */
  getProfile: async (userId: number): Promise<UserProfileDto> => {
    const res = await apiClient.get<{ success: boolean; data: UserProfileDto }>(
      `/users/${userId}/profile`,
    );
    return res.data.data!;
  },

  /**
   * Met à jour les informations de profil d'un utilisateur
   */
  updateProfile: async (
    userId: number,
    data: UpdateUserProfileDto,
  ): Promise<UserProfileDto> => {
    const res = await apiClient.patch<{
      success: boolean;
      data: UserProfileDto;
    }>(`/users/${userId}/profile`, data);
    return res.data.data!;
  },
};
