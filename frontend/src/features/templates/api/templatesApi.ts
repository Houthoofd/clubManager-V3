/**
 * Templates API Service
 * Service pour gérer les appels API du module modèles de messages
 *
 * Endpoints couverts :
 *  GET    /templates/types           — liste des types
 *  POST   /templates/types           — créer un type
 *  PUT    /templates/types/:id       — mettre à jour un type
 *  DELETE /templates/types/:id       — supprimer un type (admin)
 *  GET    /templates                 — liste des templates (query: ?type_id=&actif=)
 *  GET    /templates/:id             — détail d'un template
 *  POST   /templates                 — créer un template
 *  PUT    /templates/:id             — mettre à jour un template
 *  DELETE /templates/:id             — supprimer un template
 *  PATCH  /templates/:id/toggle      — activer/désactiver un template
 *  POST   /templates/:id/preview     — aperçu rendu
 *  POST   /templates/:id/send        — envoyer depuis un template
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";

// ─── Domain Types ─────────────────────────────────────────────────────────────

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
  variables: string[];
  created_at: string;
  updated_at: string | null;
}

// ─── Request Params ───────────────────────────────────────────────────────────

export interface GetTemplatesParams {
  type_id?: number;
  actif?: boolean;
}

// ─── Template Types CRUD ──────────────────────────────────────────────────────

/**
 * Récupère la liste de tous les types de modèles.
 */
export const getTemplateTypes = async (): Promise<TemplateType[]> => {
  const response = await apiClient.get<ApiResponse<TemplateType[]>>(
    "/templates/types",
  );
  return response.data.data!;
};

/**
 * Crée un nouveau type de modèle.
 */
export const createTemplateType = async (data: {
  nom: string;
  description?: string;
}): Promise<TemplateType> => {
  const response = await apiClient.post<ApiResponse<TemplateType>>(
    "/templates/types",
    data,
  );
  return response.data.data!;
};

/**
 * Met à jour un type de modèle existant.
 */
export const updateTemplateType = async (
  id: number,
  data: { nom?: string; description?: string; actif?: boolean },
): Promise<void> => {
  await apiClient.put(`/templates/types/${id}`, data);
};

/**
 * Supprime un type de modèle (admin uniquement).
 */
export const deleteTemplateType = async (id: number): Promise<void> => {
  await apiClient.delete(`/templates/types/${id}`);
};

// ─── Templates CRUD ───────────────────────────────────────────────────────────

/**
 * Récupère la liste des templates, avec filtres optionnels.
 */
export const getTemplates = async (
  params?: GetTemplatesParams,
): Promise<Template[]> => {
  const response = await apiClient.get<ApiResponse<Template[]>>("/templates", {
    params,
  });
  return response.data.data!;
};

/**
 * Récupère un template par son identifiant.
 */
export const getTemplateById = async (id: number): Promise<Template> => {
  const response = await apiClient.get<ApiResponse<Template>>(
    `/templates/${id}`,
  );
  return response.data.data!;
};

/**
 * Crée un nouveau template.
 */
export const createTemplate = async (data: {
  type_id: number;
  titre: string;
  contenu: string;
  actif?: boolean;
}): Promise<Template> => {
  const response = await apiClient.post<ApiResponse<Template>>(
    "/templates",
    data,
  );
  return response.data.data!;
};

/**
 * Met à jour un template existant.
 */
export const updateTemplate = async (
  id: number,
  data: Partial<{
    type_id: number;
    titre: string;
    contenu: string;
    actif: boolean;
  }>,
): Promise<void> => {
  await apiClient.put(`/templates/${id}`, data);
};

/**
 * Supprime un template.
 */
export const deleteTemplate = async (id: number): Promise<void> => {
  await apiClient.delete(`/templates/${id}`);
};

/**
 * Active ou désactive un template.
 */
export const toggleTemplate = async (
  id: number,
  actif: boolean,
): Promise<{ id: number; actif: boolean }> => {
  const response = await apiClient.patch<
    ApiResponse<{ id: number; actif: boolean }>
  >(`/templates/${id}/toggle`, { actif });
  return response.data.data!;
};

/**
 * Génère un aperçu rendu du template.
 */
export const previewTemplate = async (
  id: number,
  data?: {
    manual_vars?: Record<string, string>;
    recipient_example?: Record<string, string>;
  },
): Promise<{ rendered: string; variables: string[] }> => {
  const response = await apiClient.post<
    ApiResponse<{ rendered: string; variables: string[] }>
  >(`/templates/${id}/preview`, data ?? {});
  return response.data.data!;
};

/**
 * Envoie un message depuis un template.
 */
export const sendFromTemplate = async (
  id: number,
  data: {
    destinataire_id: number;
    cible?: string;
    manual_vars?: Record<string, string>;
    envoye_par_email?: boolean;
  },
): Promise<{ message_id: number }> => {
  const response = await apiClient.post<ApiResponse<{ message_id: number }>>(
    `/templates/${id}/send`,
    data,
  );
  return response.data.data!;
};
