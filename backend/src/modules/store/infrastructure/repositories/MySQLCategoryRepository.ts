/**
 * MySQLCategoryRepository
 * Implémentation MySQL du repository catégories (Infrastructure Layer)
 * Gère les opérations sur la table categories avec compteurs d'articles
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  ICategoryRepository,
  CategoryRow,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../domain/repositories/ICategoryRepository.js";

// ==================== DB ROW INTERFACE ====================

interface CategoryDbRow extends RowDataPacket {
  id: number;
  nom: string;
  description: string | null;
  ordre: number;
  created_at: Date;
  updated_at: Date;
  nombre_articles: string | number;
  nombre_articles_actifs: string | number;
}

// ==================== REPOSITORY ====================

export class MySQLCategoryRepository implements ICategoryRepository {
  /**
   * Récupère toutes les catégories avec compteurs d'articles
   * Triées par ordre puis nom
   */
  async findAll(): Promise<CategoryRow[]> {
    const [rows] = await pool.query<CategoryDbRow[]>(
      `SELECT
        c.id,
        c.nom,
        c.description,
        c.ordre,
        c.created_at,
        c.updated_at,
        COUNT(a.id) as nombre_articles,
        COUNT(CASE WHEN a.actif = 1 THEN 1 END) as nombre_articles_actifs
      FROM categories c
      LEFT JOIN articles a ON a.categorie_id = c.id
      GROUP BY c.id
      ORDER BY c.ordre ASC, c.nom ASC`,
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Récupère une catégorie par son ID avec compteurs d'articles
   */
  async findById(id: number): Promise<CategoryRow | null> {
    const [rows] = await pool.query<CategoryDbRow[]>(
      `SELECT
        c.id,
        c.nom,
        c.description,
        c.ordre,
        c.created_at,
        c.updated_at,
        COUNT(a.id) as nombre_articles,
        COUNT(CASE WHEN a.actif = 1 THEN 1 END) as nombre_articles_actifs
      FROM categories c
      LEFT JOIN articles a ON a.categorie_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
      LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Crée une nouvelle catégorie et retourne l'ID généré
   */
  async create(data: CreateCategoryInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO categories (nom, description, ordre)
       VALUES (?, ?, ?)`,
      [data.nom, data.description ?? null, data.ordre ?? 0],
    );

    return result.insertId;
  }

  /**
   * Met à jour une catégorie existante
   * Construit dynamiquement la clause SET avec seulement les champs fournis
   */
  async update(id: number, data: UpdateCategoryInput): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description ?? null);
    }
    if (data.ordre !== undefined) {
      fields.push("ordre = ?");
      values.push(data.ordre);
    }

    if (fields.length === 0) {
      return; // Rien à mettre à jour
    }

    // Ajouter updated_at automatique
    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  /**
   * Supprime une catégorie
   * Les articles liés verront leur categorie_id passer à NULL (ON DELETE SET NULL)
   */
  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  }

  /**
   * Réorganise l'ordre des catégories en masse
   */
  async reorder(categories: { id: number; ordre: number }[]): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const cat of categories) {
        await conn.query(
          "UPDATE categories SET ordre = ?, updated_at = NOW() WHERE id = ?",
          [cat.ordre, cat.id],
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet CategoryRow typé
   * Cast les compteurs (peuvent être string ou number selon MySQL driver)
   */
  private mapRow(row: CategoryDbRow): CategoryRow {
    return {
      id: row.id,
      nom: row.nom,
      description: row.description,
      ordre: row.ordre,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      nombre_articles: Number(row.nombre_articles ?? 0),
      nombre_articles_actifs: Number(row.nombre_articles_actifs ?? 0),
    };
  }
}
