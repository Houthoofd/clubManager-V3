/**
 * sessionsApi
 * Gestion des sessions actives de l'utilisateur
 */
import apiClient from '../../../shared/api/apiClient';

export interface ActiveSessionDto {
  id: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
}

export const sessionsApi = {
  getSessions: async (): Promise<ActiveSessionDto[]> => {
    const res = await apiClient.get('/auth/sessions');
    return res.data.data ?? [];
  },
  revokeSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${id}`);
  },
};
