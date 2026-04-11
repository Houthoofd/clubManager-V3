/**
 * UpdateCourseRecurrentUseCase
 * Application Layer — met à jour un cours récurrent existant.
 *
 * Vérifie les conflits de créneau avant toute mise à jour.
 * Comme le DTO est partiel (tous les champs sauf `id` sont optionnels),
 * le use case charge d'abord les valeurs actuelles pour reconstituer
 * le créneau final avant d'interroger hasTimeConflict.
 */

import type {
  UpdateCourseRecurrentDto,
  CourseRecurrentResponseDto,
} from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

export class UpdateCourseRecurrentUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * @param dto - Données de mise à jour (id obligatoire, autres champs optionnels)
   * @throws {Error} Si le cours récurrent n'existe pas
   * @throws {Error} Si l'heure de fin est antérieure ou égale à l'heure de début
   * @throws {Error} Si un autre cours récurrent occupe déjà ce créneau
   */
  async execute(
    dto: UpdateCourseRecurrentDto,
  ): Promise<CourseRecurrentResponseDto> {
    // ── 1. Charger le cours actuel ────────────────────────────────────────────
    // Nécessaire pour reconstituer le créneau complet quand le DTO est partiel.
    const current = await this.repo.getCourseRecurrentById(dto.id);
    if (!current) {
      throw new Error("Cours récurrent introuvable");
    }

    // ── 2. Reconstituer le créneau final (fusion dto + valeurs actuelles) ─────
    const finalJour = dto.jour_semaine ?? current.jour_semaine;
    const finalDebut = dto.heure_debut ?? current.heure_debut;
    const finalFin = dto.heure_fin ?? current.heure_fin;

    // ── 3. Valider la cohérence horaire ───────────────────────────────────────
    if (finalFin <= finalDebut) {
      throw new Error(
        "L'heure de fin doit être postérieure à l'heure de début",
      );
    }

    // ── 4. Vérifier les conflits de créneau ───────────────────────────────────
    // On exclut le cours lui-même (excludeId = dto.id) pour ne pas le détecter
    // comme son propre conflit quand seul le type_cours ou les professeurs changent.
    const conflict = await this.repo.hasTimeConflict(
      finalJour,
      finalDebut,
      finalFin,
      dto.id,
    );

    if (conflict) {
      throw new Error(
        `Ce créneau est déjà occupé par le cours "${conflict.type_cours}" ` +
          `(${conflict.heure_debut.slice(0, 5)}–${conflict.heure_fin.slice(0, 5)})`,
      );
    }

    // ── 5. Persister la mise à jour ───────────────────────────────────────────
    return this.repo.updateCourseRecurrent(dto);
  }
}
