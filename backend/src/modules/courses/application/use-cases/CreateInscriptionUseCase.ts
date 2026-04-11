import type { CreateInscriptionDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * CreateInscriptionUseCase
 * Inscrit un utilisateur à un cours donné
 */
export class CreateInscriptionUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute l'inscription
   * @param dto - Données de l'inscription (utilisateur_id, cours_id, status_id optionnel, commentaire optionnel)
   * @throws Error en cas de doublon (UNIQUE KEY violation gérée au niveau controller)
   */
  async execute(dto: CreateInscriptionDto): Promise<void> {
    await this.repo.createInscription(dto);
  }
}
