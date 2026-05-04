/**
 * ICourseRepository
 * Interface du repository courses (Domain Layer)
 * Contrat pour toutes les opérations de gestion des cours, professeurs et inscriptions
 */

import type {
  CourseRecurrentResponseDto,
  CourseRecurrentListItemDto,
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
  CourseResponseDto,
  CourseListItemDto,
  CreateCourseDto,
  SearchCourseDto,
  GenerateCoursesDto,
  ProfessorResponseDto,
  ProfessorListItemDto,
  CreateProfessorDto,
  UpdateProfessorDto,
  CreateInscriptionDto,
  BulkUpdatePresenceDto,
  AttendanceSheetDto,
} from "@clubmanager/types";

export interface ICourseRepository {
  // ==================== COURS RÉCURRENTS ====================

  /**
   * Récupère tous les cours récurrents avec leurs professeurs associés
   */
  getCourseRecurrents(): Promise<CourseRecurrentListItemDto[]>;

  /**
   * Récupère un cours récurrent par son ID avec le détail complet des professeurs
   * @returns null si introuvable
   */
  getCourseRecurrentById(
    id: number,
  ): Promise<CourseRecurrentResponseDto | null>;

  /**
   * Crée un nouveau cours récurrent et assigne optionnellement des professeurs
   */
  createCourseRecurrent(
    dto: CreateCourseRecurrentDto,
  ): Promise<CourseRecurrentResponseDto>;

  /**
   * Met à jour un cours récurrent existant
   * Si `professeur_ids` est fourni, remplace intégralement la liste des professeurs
   */
  updateCourseRecurrent(
    dto: UpdateCourseRecurrentDto,
  ): Promise<CourseRecurrentResponseDto>;

  /**
   * Supprime un cours récurrent (la cascade gère la table de liaison)
   */
  deleteCourseRecurrent(id: number): Promise<void>;

  /**
   * Vérifie s'il existe un cours récurrent sur le même créneau horaire.
   * Deux cours sont en conflit si : existing.heure_debut < new.heure_fin AND existing.heure_fin > new.heure_debut
   *
   * @param jour_semaine  Jour de la semaine (1=Lundi … 7=Dimanche)
   * @param heure_debut   Heure de début du nouveau cours (format HH:MM ou HH:MM:SS)
   * @param heure_fin     Heure de fin du nouveau cours (format HH:MM ou HH:MM:SS)
   * @param excludeId     ID à exclure de la vérification (indispensable lors d'un update)
   * @returns             Le cours en conflit (id, type_cours, heure_debut, heure_fin) ou null
   */
  hasTimeConflict(
    jour_semaine: number,
    heure_debut: string,
    heure_fin: string,
    excludeId?: number,
  ): Promise<{
    id: number;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
  } | null>;

  /**
   * Assigne un professeur à un cours récurrent
   */
  assignProfessor(
    cours_recurrent_id: number,
    professeur_id: number,
  ): Promise<void>;

  /**
   * Désassigne un professeur d'un cours récurrent
   */
  unassignProfessor(
    cours_recurrent_id: number,
    professeur_id: number,
  ): Promise<void>;

  // ==================== PROFESSEURS ====================

  /**
   * Récupère tous les professeurs avec leur grade et nombre de cours assignés
   */
  getProfessors(): Promise<ProfessorListItemDto[]>;

  /**
   * Récupère un professeur par son ID avec ses cours récurrents et statistiques
   * @returns null si introuvable
   */
  getProfessorById(id: number): Promise<ProfessorResponseDto | null>;

  /**
   * Crée un nouveau professeur
   */
  createProfessor(dto: CreateProfessorDto): Promise<ProfessorResponseDto>;

  /**
   * Met à jour un professeur existant
   */
  updateProfessor(dto: UpdateProfessorDto): Promise<ProfessorResponseDto>;
  deleteProfessor(id: number): Promise<void>;

  // ==================== COURS (INSTANCES) ====================

  /**
   * Récupère la liste des cours avec filtres optionnels
   * (date_debut, date_fin, type_cours, cours_recurrent_id)
   */
  getCourses(filters: SearchCourseDto): Promise<CourseListItemDto[]>;

  /**
   * Récupère un cours par son ID avec le détail complet
   * @returns null si introuvable
   */
  getCourseById(id: number): Promise<CourseResponseDto | null>;

  /**
   * Crée un cours (instance ponctuelle ou liée à un cours récurrent)
   */
  createCourse(dto: CreateCourseDto): Promise<CourseResponseDto>;

  /**
   * Génère automatiquement des instances de cours à partir d'un cours récurrent
   * sur une plage de dates donnée, en excluant les dates indiquées
   */
  generateCourses(dto: GenerateCoursesDto): Promise<{
    generated: number;
    cours: CourseListItemDto[];
  }>;

  // ==================== INSCRIPTIONS ====================

  /**
   * Récupère la feuille de présence complète d'un cours
   * (infos du cours, liste des professeurs, inscriptions avec statuts)
   */
  getCourseInscriptions(cours_id: number): Promise<AttendanceSheetDto>;

  /**
   * Inscrit un utilisateur à un cours
   */
  createInscription(dto: CreateInscriptionDto): Promise<void>;

  /**
   * Met à jour en masse les statuts de présence pour un cours
   */
  bulkUpdatePresence(dto: BulkUpdatePresenceDto): Promise<void>;

  /**
   * Supprime une inscription par son ID
   */
  deleteInscription(id: number): Promise<void>;

  /**
   * Récupère toutes les inscriptions d'un utilisateur avec les détails du cours
   * Retourne les inscriptions triées par date de cours décroissante
   */
  getMyEnrollments(userId: number): Promise<
    Array<{
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
    }>
  >;
}
