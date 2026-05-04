/**
 * GetMyEnrollmentsUseCase
 * Cas d'usage pour récupérer les inscriptions de l'utilisateur connecté
 * avec les détails de chaque cours (date, type, horaires, statut)
 */

import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

export interface MyEnrollmentDto {
  inscription_id: number;
  cours_id: number;
  date_cours: string;
  type_cours: string;
  heure_debut: string;
  heure_fin: string;
  status_id: number;
  status_nom?: string;
  presence: boolean | null;
  commentaire: string | null;
  created_at: string;
}

export class GetMyEnrollmentsUseCase {
  constructor(private repo: ICourseRepository) {}

  async execute(userId: number): Promise<MyEnrollmentDto[]> {
    return this.repo.getMyEnrollments(userId);
  }
}
