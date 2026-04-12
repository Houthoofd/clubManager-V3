/**
 * IArticleRepository
 * Interface du repository articles (Domain Layer)
 * Contrat pour les opérations sur les articles et leurs images
 */

// ==================== ROW / INPUT TYPES ====================

export interface ArticleRow {
  id: number;
  nom: string;
  description: string | null;
  prix: number;
  image_url: string | null; // Champ virtuel (JOIN avec images table)
  categorie_id: number | null;
  categorie_nom: string | null;
  actif: boolean;
  created_at: Date;
  updated_at: Date | null;
}

export interface ArticleImageRow {
  id: number;
  article_id: number;
  url: string;
  ordre: number;
  created_at: Date;
}

export interface ArticleWithImages extends ArticleRow {
  images: ArticleImageRow[];
}

export interface ArticleQuery {
  search?: string;
  categorie_id?: number;
  actif?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedArticles {
  articles: ArticleRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateArticleInput {
  nom: string;
  description?: string | null;
  prix: number;
  categorie_id?: number | null;
  actif?: boolean;
}

export interface UpdateArticleInput {
  nom?: string;
  description?: string | null;
  prix?: number;
  categorie_id?: number | null;
  actif?: boolean;
}

// ==================== REPOSITORY INTERFACE ====================

export interface IArticleRepository {
  /** Retourne la liste paginée des articles avec filtres dynamiques */
  findAll(query: ArticleQuery): Promise<PaginatedArticles>;

  /** Retourne un article par son ID avec toutes ses images */
  findById(id: number): Promise<ArticleWithImages | null>;

  /** Crée un nouvel article et retourne son ID généré */
  create(data: CreateArticleInput): Promise<number>;

  /** Met à jour un article existant */
  update(id: number, data: UpdateArticleInput): Promise<void>;

  /** Supprime un article (cascade sur les images via FK) */
  delete(id: number): Promise<void>;

  /** Inverse le statut actif/inactif d'un article */
  toggleActive(id: number): Promise<void>;

  /** Ajoute une image à un article et retourne l'ID de l'image créée */
  addImage(articleId: number, url: string, ordre: number): Promise<number>;

  /** Supprime une image et retourne son URL (pour nettoyage storage) */
  deleteImage(imageId: number): Promise<string | null>;

  /** Récupère toutes les images d'un article triées par ordre */
  getImages(articleId: number): Promise<ArticleImageRow[]>;
}
