/**
 * MySQLArticleRepository
 * Implémentation MySQL du repository articles (Infrastructure Layer)
 * Gère les opérations sur les tables articles et images
 *
 * IMPORTANT : La colonne image_url n'existe PAS dans la table articles.
 * C'est un champ virtuel calculé par subquery (première image par ordre).
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  IArticleRepository,
  ArticleRow,
  ArticleImageRow,
  ArticleWithImages,
  ArticleQuery,
  PaginatedArticles,
  CreateArticleInput,
  UpdateArticleInput,
} from "../../domain/repositories/IArticleRepository.js";

// ==================== DB ROW INTERFACES ====================

interface ArticleDbRow extends RowDataPacket {
  id: number;
  nom: string;
  description: string | null;
  prix: string; // DECIMAL retourné en string par MySQL
  image_url: string | null; // Champ virtuel (subquery)
  categorie_id: number | null;
  categorie_nom: string | null;
  actif: boolean | number;
  created_at: Date;
  updated_at: Date | null;
}

interface ImageDbRow extends RowDataPacket {
  id: number;
  article_id: number;
  url: string;
  ordre: number;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== BASE QUERIES ====================

/**
 * Subquery pour obtenir l'URL de la première image d'un article
 */
const IMAGE_URL_SUBQUERY = `(
  SELECT url
  FROM images
  WHERE article_id = a.id
  ORDER BY ordre ASC
  LIMIT 1
)`;

/**
 * SELECT de base pour les articles avec image_url virtuelle et catégorie
 */
const BASE_SELECT = `
  SELECT
    a.id,
    a.nom,
    a.description,
    a.prix,
    ${IMAGE_URL_SUBQUERY} AS image_url,
    a.categorie_id,
    c.nom AS categorie_nom,
    a.actif,
    a.created_at,
    a.updated_at
  FROM articles a
  LEFT JOIN categories c ON c.id = a.categorie_id
`;

// ==================== REPOSITORY ====================

export class MySQLArticleRepository implements IArticleRepository {
  /**
   * Récupère la liste paginée des articles avec filtres dynamiques
   */
  async findAll(query: ArticleQuery): Promise<PaginatedArticles> {
    const {
      search,
      categorie_id,
      actif,
      page = 1,
      limit = 20,
    } = query;

    const conditions: string[] = [];
    const params: (string | number | boolean)[] = [];

    if (search) {
      conditions.push("(a.nom LIKE ? OR a.description LIKE ?)");
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (categorie_id !== undefined) {
      conditions.push("a.categorie_id = ?");
      params.push(categorie_id);
    }

    if (actif !== undefined) {
      conditions.push("a.actif = ?");
      params.push(actif ? 1 : 0);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM articles a ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    // Requête de données avec pagination
    const [rows] = await pool.query<ArticleDbRow[]>(
      `${BASE_SELECT} ${whereClause} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      articles: rows.map((row) => this.mapRow(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un article par son ID avec toutes ses images
   */
  async findById(id: number): Promise<ArticleWithImages | null> {
    // Récupérer l'article
    const [rows] = await pool.query<ArticleDbRow[]>(
      `${BASE_SELECT} WHERE a.id = ? LIMIT 1`,
      [id],
    );

    if (rows.length === 0 || rows[0] === undefined) return null;

    const article = this.mapRow(rows[0]);

    // Récupérer toutes les images de l'article
    const images = await this.getImages(id);

    return {
      ...article,
      images,
    };
  }

  /**
   * Crée un nouvel article et retourne son ID généré
   */
  async create(data: CreateArticleInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO articles (nom, description, prix, categorie_id, actif)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.nom,
        data.description ?? null,
        data.prix,
        data.categorie_id ?? null,
        data.actif ?? true,
      ],
    );

    return result.insertId;
  }

  /**
   * Met à jour un article existant
   */
  async update(id: number, data: UpdateArticleInput): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description ?? null);
    }
    if (data.prix !== undefined) {
      fields.push("prix = ?");
      values.push(data.prix);
    }
    if (data.categorie_id !== undefined) {
      fields.push("categorie_id = ?");
      values.push(data.categorie_id ?? null);
    }
    if (data.actif !== undefined) {
      fields.push("actif = ?");
      values.push(data.actif ? 1 : 0);
    }

    if (fields.length === 0) {
      return; // Rien à mettre à jour
    }

    // Ajouter updated_at automatique
    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.query(
      `UPDATE articles SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  /**
   * Supprime un article
   * Les images sont supprimées en cascade via FK ON DELETE CASCADE
   */
  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM articles WHERE id = ?", [id]);
  }

  /**
   * Inverse le statut actif/inactif d'un article
   */
  async toggleActive(id: number): Promise<void> {
    await pool.query(
      "UPDATE articles SET actif = NOT actif, updated_at = NOW() WHERE id = ?",
      [id],
    );
  }

  /**
   * Ajoute une image à un article et retourne l'ID de l'image créée
   */
  async addImage(
    articleId: number,
    url: string,
    ordre: number,
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO images (article_id, url, ordre)
       VALUES (?, ?, ?)`,
      [articleId, url, ordre],
    );

    return result.insertId;
  }

  /**
   * Supprime une image et retourne son URL (pour nettoyage du storage)
   */
  async deleteImage(imageId: number): Promise<string | null> {
    // D'abord récupérer l'URL avant suppression
    const [rows] = await pool.query<ImageDbRow[]>(
      "SELECT url FROM images WHERE id = ? LIMIT 1",
      [imageId],
    );

    if (rows.length === 0 || rows[0] === undefined) {
      return null;
    }

    const url = rows[0].url;

    // Puis supprimer l'image
    await pool.query("DELETE FROM images WHERE id = ?", [imageId]);

    return url;
  }

  /**
   * Récupère toutes les images d'un article triées par ordre
   */
  async getImages(articleId: number): Promise<ArticleImageRow[]> {
    const [rows] = await pool.query<ImageDbRow[]>(
      `SELECT id, article_id, url, ordre, created_at
       FROM images
       WHERE article_id = ?
       ORDER BY ordre ASC`,
      [articleId],
    );

    return rows.map((row) => this.mapImageRow(row));
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet ArticleRow typé
   * Cast DECIMAL prix en number
   */
  private mapRow(row: ArticleDbRow): ArticleRow {
    return {
      id: row.id,
      nom: row.nom,
      description: row.description,
      prix: Number(row.prix),
      image_url: row.image_url,
      categorie_id: row.categorie_id,
      categorie_nom: row.categorie_nom,
      actif: Boolean(row.actif),
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : null,
    };
  }

  /**
   * Convertit une row image MySQL en objet ArticleImageRow typé
   */
  private mapImageRow(row: ImageDbRow): ArticleImageRow {
    return {
      id: row.id,
      article_id: row.article_id,
      url: row.url,
      ordre: row.ordre,
      created_at: new Date(row.created_at),
    };
  }
}
