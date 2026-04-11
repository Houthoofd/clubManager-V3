import type { AttendanceSheetDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetCourseInscriptionsUseCase
 * Récupère la feuille de présence complète d'un cours :
 * informations du cours, liste des professeurs, inscriptions avec statuts
 * et statistiques de présence calculées.
 */
export class GetCourseInscriptionsUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute le cas d'usage
   * @param cours_id - Identifiant du cours (instance)
   * @returns Feuille de présence complète avec statistiques
   * @throws Error si le cours est introuvable
   */
  async execute(cours_id: number): Promise<AttendanceSheetDto> {
    return this.repo.getCourseInscriptions(cours_id);
  }
}
