/**
 * IPricingPlanRepository
 * Interface du repository plans tarifaires (Domain Layer)
 * Contrat pour les opérations CRUD sur les plans d'abonnement et de tarification
 */

// ==================== ROW / INPUT TYPES ====================

export interface PricingPlanRow {
  id: number;
  nom: string;
  description: string | null;
  prix: number;
  duree_mois: number;
  actif: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePricingPlanInput {
  nom: string;
  description?: string | null;
  prix: number;
  duree_mois: number;
}

export interface UpdatePricingPlanInput {
  nom?: string;
  description?: string | null;
  prix?: number;
  duree_mois?: number;
}

// ==================== REPOSITORY INTERFACE ====================

export interface IPricingPlanRepository {
  /** Retourne tous les plans tarifaires, avec filtre optionnel sur le statut actif */
  findAll(actif?: boolean): Promise<PricingPlanRow[]>;

  /** Retourne un plan tarifaire par son ID, ou null s'il n'existe pas */
  findById(id: number): Promise<PricingPlanRow | null>;

  /** Crée un nouveau plan tarifaire et retourne son ID généré */
  create(data: CreatePricingPlanInput): Promise<number>;

  /** Met à jour les champs fournis d'un plan tarifaire existant */
  update(id: number, data: UpdatePricingPlanInput): Promise<void>;

  /** Active ou désactive un plan tarifaire */
  toggleActive(id: number, actif: boolean): Promise<void>;

  /** Supprime définitivement un plan tarifaire */
  delete(id: number): Promise<void>;
}
