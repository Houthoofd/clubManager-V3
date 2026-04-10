/**
 * templatesApi.ts
 * Appels API pour le module templates de messages
 */

import apiClient, { type ApiResponse } from '../../../shared/api/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplateType {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  templates_count?: number;
}

export interface Template {
  id: number;
  type_id: number;
  type_nom?: string;
  titre: string;
  contenu: string;
  actif: boolean;
  variables: string[]; // ex: ['prenom', 'date_cours', 'raison']
  created_at: string;
  updated_at: string | null;
}

export interface PreviewResult {
  titre: string;
  contenu: string;
  missingVariables: string[];
}

// ─── Template Types ───────────────────────────────────────────────────────────

/**
 * Récupère tous les types de templates
 */
export const getTemplateTypes = async (): Promise<TemplateType[]> => {
  const res = await apiClient.get<ApiResponse<TemplateType[]>>('/templates/types');
  return res.data.data!;
};

/**
 * Crée un nouveau type de template
 */
export const createTemplateType = async (data: {
  nom: string;
  description?: string;
}): Promise<TemplateType> => {
  const res = await apiClient.post<ApiResponse<TemplateType>>('/templates/types', data);
  return res.data.data!;
};

/**
 * Met à jour un type de template existant
 */
export const updateTemplateType = async (
  id: number,
  data: Partial<{ nom: string; description: string; actif: boolean }>,
): Promise<void> => {
  await apiClient.put(`/templates/types/${id}`, data);
};

/**
 * Supprime un type de template
 */
export const deleteTemplateType = async (id: number): Promise<void> => {
  await apiClient.delete(`/templates/types/${id}`);
};

// ─── Templates ────────────────────────────────────────────────────────────────

/**
 * Récupère la liste des templates (avec filtres optionnels)
 */
export const getTemplates = async (
  typeId?: number,
  actif?: boolean,
): Promise<Template[]> => {
  const params: Record<string, unknown> = {};
  if (typeId !== undefined) params.type_id = typeId;
  if (actif !== undefined) params.actif = actif;
  const res = await apiClient.get<ApiResponse<Template[]>>('/templates', { params });
  return res.data.data!;
};

/**
 * Récupère un template par son ID
 */
export const getTemplate = async (id: number): Promise<Template> => {
  const res = await apiClient.get<ApiResponse<Template>>(`/templates/${id}`);
  return res.data.data!;
};

/**
 * Crée un nouveau template
 */
export const createTemplate = async (data: {
  type_id: number;
  titre: string;
  contenu: string;
  actif?: boolean;
}): Promise<Template> => {
  const res = await apiClient.post<ApiResponse<Template>>('/templates', data);
  return res.data.data!;
};

/**
 * Met à jour un template existant
 */
export const updateTemplate = async (
  id: number,
  data: Partial<{ type_id: number; titre: string; contenu: string; actif: boolean }>,
): Promise<void> => {
  await apiClient.put(`/templates/${id}`, data);
};

/**
 * Supprime un template
 */
export const deleteTemplate = async (id: number): Promise<void> => {
  await apiClient.delete(`/templates/${id}`);
};

/**
 * Active ou désactive un template
 */
export const toggleTemplate = async (id: number, actif: boolean): Promise<void> => {
  await apiClient.patch(`/templates/${id}/toggle`, { actif });
};

/**
 * Génère un aperçu d'un template avec les variables remplies
 */
export const previewTemplate = async (
  id: number,
  manualVars: Record<string, string>,
): Promise<PreviewResult> => {
  const res = await apiClient.post<ApiResponse<PreviewResult>>(
    `/templates/${id}/preview`,
    {
      manual_vars: manualVars,
      recipient_example: {
        first_name: 'Jean',
        last_name: 'Dupont',
        userId: 'U-2025-0001',
      },
    },
  );
  return res.data.data!;
};

/**
 * Envoie un message à partir d'un template
 */
export const sendFromTemplate = async (
  id: number,
  payload: {
    destinataire_id?: number;
    cible?: string;
    manual_vars?: Record<string, string>;
    envoye_par_email: boolean;
  },
): Promise<{ count: number }> => {
  const res = await apiClient.post<ApiResponse<{ count: number }>>(
    `/templates/${id}/send`,
    payload,
  );
  return res.data.data!;
};
