import { apiClient } from '../../../shared/api/apiClient';

export interface SaasModule {
  id: string;
  name: string;
  description: string;
  icon?: string | React.ElementType; 
  status: 'active' | 'beta' | 'deprecated';
  type: 'core' | 'addon' | 'integration';
  pricing: 'free' | 'paid' | 'plan_restricted';
  clubsUsingCount?: number;
  isEnabledGlobally: boolean;
  colorClass: string;
  dependencies?: string[];
}

export const saasModulesApi = {
  getModules: async (): Promise<SaasModule[]> => {
    const response = await apiClient.get('/superadmin/saas/modules');
    const items = response.data.data || [];
    return items.map((mod: any) => ({
      ...mod,
      type: mod.type,
      isEnabledGlobally: mod.isEnabledGlobally ?? false,
      colorClass: mod.colorClass,
      clubsUsingCount: mod.clubsUsingCount ?? 0,
    }));
  },

  createModule: async (data: Partial<SaasModule>): Promise<SaasModule> => {
    const payload = {
      id: "m_" + Date.now(),
      ...data
    };
    const response = await apiClient.post('/superadmin/saas/modules', payload);
    return response.data.data;
  },

  updateModule: async (id: string, data: Partial<SaasModule>): Promise<SaasModule> => {
    const response = await apiClient.put(`/superadmin/saas/modules/${id}`, data);
    return response.data.data;
  },

  toggleModule: async (id: string): Promise<{ success: boolean; is_enabled_globally: boolean }> => {
    const response = await apiClient.post(`/superadmin/saas/modules/${id}/toggle`);
    return response.data;
  },
};
