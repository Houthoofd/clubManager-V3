/**
 * ICategoryRepository
 * Interface du repository catégories (Domain Layer)
 * Contrat pour les opérations sur les catégories en base de données
 */

// ==================== ROW / INPUT TYPES ====================

export interface CategoryRow {
  id: number;
  nom: string;
  description: string | null;
  ordre: number;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs / agrégations
  nombre_articles?: number;
  nombre_articles_actifs?: number;
}

export interface CreateCategoryInput {
  nom: string;
  description?: string | null;
  ordre?: number;
}

export interface UpdateCategoryInput {
  nom?: string;
  description?: string | null;
  ordre?: number;
}

// ==================== REPOSITORY INTERFACE ====================

export interface ICategoryRepository {
  /** Retourne toutes les catégories triées par ordre puis nom */
  findAll(): Promise<CategoryRow[]>;

  /** Retourne une catégorie par son ID avec les compteurs d'articles */
  findById(id: number): Promise<CategoryRow | null>;

  /** Crée une nouvelle catégorie et retourne son ID généré */
  create(data: CreateCategoryInput): Promise<number>;

  /** Met à jour une catégorie existante */
  update(id: number, data: UpdateCategoryInput): Promise<void>;

  /** Supprime une catégorie (les articles liés passeront à categorie_id = NULL) */
  delete(id: number): Promise<void>;

  /** Réorganise l'ordre des catégories en masse */
  reorder(categories: { id: number; ordre: number }[]): Promise<void>;
}
