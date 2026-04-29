/**
 * Grades API Service
 * Service pour gérer les appels API du module grades / ceintures
 */

import apiClient from '../../../shared/api/apiClient';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Grade {
  id: number;
  nom: string;
  ordre: number;
  couleur: string | null;
}

export interface CreateGradeDto {
  nom: string;
  ordre: number;
  couleur?: string | null;
}

export interface UpdateGradeDto {
  nom?: string;
  ordre?: number;
  couleur?: string | null;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const gradesApi = {
  /**
   * Récupère tous les grades
   */
  getGrades: async (): Promise<Grade[]> => {
    const res = await apiClient.get('/grades');
    return res.data.data ?? [];
  },

  /**
   * Récupère un grade par son ID
   */
  getGrade: async (id: number): Promise<Grade> => {
    const res = await apiClient.get(`/grades/${id}`);
    return res.data.data!;
  },

  /**
   * Crée un nouveau grade (admin seulement)
   */
  createGrade: async (data: CreateGradeDto): Promise<Grade> => {
    const res = await apiClient.post('/grades', data);
    return res.data.data!;
  },

  /**
   * Met à jour un grade existant (admin seulement)
   */
  updateGrade: async (id: number, data: UpdateGradeDto): Promise<Grade> => {
    const res = await apiClient.put(`/grades/${id}`, data);
    return res.data.data!;
  },

  /**
   * Supprime un grade (admin seulement)
   * Peut échouer si le grade est utilisé par des membres
   */
  deleteGrade: async (id: number): Promise<void> => {
    await apiClient.delete(`/grades/${id}`);
  },
};

export default gradesApi;
