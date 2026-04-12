import type { BulkUpdatePresenceDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * BulkUpdatePresenceUseCase
 * Met à jour en masse les statuts de présence pour un cours donné.
 * Délègue directement au repository sans logique métier supplémentaire.
 */
export class BulkUpdatePresenceUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute la mise à jour groupée des présences
   * @param dto - Tableau de mises à jour { inscription_id, status_id }
   */
  async execute(dto: BulkUpdatePresenceDto): Promise<void> {
    await this.repo.bulkUpdatePresence(dto);
  }
}
