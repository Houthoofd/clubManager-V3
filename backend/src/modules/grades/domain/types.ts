/**
 * Grade Domain Types
 * Représente la table `grades` (ceintures) de la base de données
 */

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
  id: number;
  nom?: string;
  ordre?: number;
  couleur?: string | null;
}
