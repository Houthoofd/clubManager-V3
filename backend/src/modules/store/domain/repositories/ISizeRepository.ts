/**
 * ISizeRepository
 * Interface du repository tailles (Domain Layer)
 * Contrat pour les opérations sur les tailles en base de données
 */

// ==================== ROW / INPUT TYPES ====================

export interface SizeRow {
  id: number;
  nom: string;
  ordre: number;
}

export interface CreateSizeInput {
  nom: string;
  ordre?: number;
}

export interface UpdateSizeInput {
  nom?: string;
  ordre?: number;
}

// ==================== REPOSITORY INTERFACE ====================

export interface ISizeRepository {
  /** Retourne toutes les tailles triées par ordre puis nom */
  findAll(): Promise<SizeRow[]>;

  /** Retourne une taille par son ID */
  findById(id: number): Promise<SizeRow | null>;

  /** Crée une nouvelle taille et retourne son ID généré */
  create(data: CreateSizeInput): Promise<number>;

  /** Met à jour une taille existante */
  update(id: number, data: UpdateSizeInput): Promise<void>;

  /** Supprime une taille */
  delete(id: number): Promise<void>;
}
