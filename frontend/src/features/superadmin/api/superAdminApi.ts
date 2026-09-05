import { apiClient } from '../../../shared/api/apiClient';

export interface ClubInfo {
  id: number;
  name: string;
  code: string;
  db_name: string;
  admin_count: number;
  contact_email: string;
  contact_phone?: string;
  status: 'active' | 'suspended' | 'trial';
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export const superAdminApi = {
  getClubs: async (): Promise<ApiResponse<ClubInfo[]>> => {
    const response = await apiClient.get<ApiResponse<ClubInfo[]>>('/superadmin/clubs');
    return response.data;
  },

  inviteClub: async (email: string): Promise<ApiResponse<{ inviteLink: string, token: string }>> => {
    const response = await apiClient.post<ApiResponse<{ inviteLink: string, token: string }>>('/superadmin/clubs/invite', { email });
    return response.data;
  },

  updateClubStatus: async (id: number, status: 'active' | 'suspended' | 'trial'): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/superadmin/clubs/${id}/status`, { status });
    return response.data;
  },

  updateClub: async (id: number, data: { name: string; code: string; contact_email: string; contact_phone?: string }): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/superadmin/clubs/${id}`, data);
    return response.data;
  },

  deleteClub: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/superadmin/clubs/${id}`);
    return response.data;
  }
};
