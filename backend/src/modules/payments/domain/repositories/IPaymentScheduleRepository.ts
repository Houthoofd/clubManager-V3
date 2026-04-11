/**
 * IPaymentScheduleRepository
 * Interface du repository échéances de paiement (Domain Layer)
 * Contrat pour les opérations sur les échéances en base de données
 */

// ==================== ROW / INPUT TYPES ====================

export interface ScheduleRow {
  id: number;
  user_id: number;
  plan_tarifaire_id: number | null;
  montant: number;
  date_echeance: Date;
  statut: "en_attente" | "paye" | "en_retard" | "annule";
  paiement_id: number | null;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs avec utilisateurs et plans_tarifaires
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  plan_nom?: string;
  // Nombre de jours de retard calculé côté SQL (DATEDIFF)
  jours_retard?: number;
}

export interface CreateScheduleInput {
  user_id: number;
  plan_tarifaire_id?: number | null;
  montant: number;
  date_echeance: string;
  statut?: string;
  paiement_id?: number | null;
}

export interface ScheduleQuery {
  user_id?: number;
  statut?: string;
  /** Si true, filtre uniquement les échéances dont la date est dépassée */
  overdue?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedSchedules {
  schedules: ScheduleRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== REPOSITORY INTERFACE ====================

export interface IPaymentScheduleRepository {
  /** Retourne la liste paginée des échéances avec filtres dynamiques */
  findAll(query: ScheduleQuery): Promise<PaginatedSchedules>;

  /** Retourne une échéance par son ID (avec infos user et plan), ou null */
  findById(id: number): Promise<ScheduleRow | null>;

  /** Retourne toutes les échéances d'un utilisateur donné */
  findByUserId(userId: number): Promise<ScheduleRow[]>;

  /** Retourne toutes les échéances dont la date est dépassée et le statut est 'en_attente' */
  findOverdue(): Promise<ScheduleRow[]>;

  /** Marque une échéance comme payée et lui associe un paiement */
  markAsPaid(id: number, paiementId: number): Promise<void>;

  /** Met à jour le statut d'une échéance */
  updateStatut(id: number, statut: string): Promise<void>;

  /** Crée une nouvelle échéance et retourne son ID généré */
  create(data: CreateScheduleInput): Promise<number>;
}
