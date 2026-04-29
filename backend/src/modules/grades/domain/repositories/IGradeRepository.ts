/**
 * IGradeRepository
 * Interface du repository grades (Domain Layer)
 * Contrat pour les opérations CRUD sur les ceintures/grades
 */

import type { Grade, CreateGradeDto, UpdateGradeDto } from "../types.js";

export interface IGradeRepository {
  /**
   * Retourne tous les grades triés par ordre croissant
   */
  findAll(): Promise<Grade[]>;

  /**
   * Trouve un grade par son ID, ou null si inexistant
   */
  findById(id: number): Promise<Grade | null>;

  /**
   * Crée un nouveau grade et retourne l'entité persistée
   */
  create(data: CreateGradeDto): Promise<Grade>;

  /**
   * Met à jour partiellement un grade et retourne l'entité mise à jour
   */
  update(data: UpdateGradeDto): Promise<Grade>;

  /**
   * Supprime un grade par son ID.
   * Lance une erreur si le grade est référencé par des utilisateurs ou des professeurs.
   */
  delete(id: number): Promise<void>;
}
