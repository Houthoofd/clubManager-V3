/**
 * MySQLTemplateRepository
 * Implémentation MySQL du repository templates (Infrastructure Layer)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  ITemplateRepository,
  Template,
  TemplateType,
} from "../../domain/repositories/ITemplateRepository.js";
import { TemplateEngineService } from "../../application/services/TemplateEngineService.js";

// ==================== ROW INTERFACES ====================

interface TemplateTypeRow extends RowDataPacket {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean | number;
  templates_count: number;
}

interface TemplateRow extends RowDataPacket {
  id: number;
  type_id: number;
  type_nom: string | null;
  titre: string;
  contenu: string;
  actif: boolean | number;
  created_at: Date;
  updated_at: Date | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== REPOSITORY ====================

export class MySQLTemplateRepository implements ITemplateRepository {
  // ===================================================================
  // TYPES
  // ===================================================================

  /**
   * Retourne tous les types de templates avec le nombre de templates associés
   */
  async getTypes(): Promise<TemplateType[]> {
    const [rows] = await pool.query<TemplateTypeRow[]>(
      `SELECT
         t.id,
         t.nom,
         t.description,
         t.actif,
         (
           SELECT COUNT(*)
           FROM messages_personnalises mp
           WHERE mp.type_id = t.id
         ) AS templates_count
       FROM types_messages_personnalises t
       ORDER BY t.nom ASC`,
    );

    return rows.map((row) => this.mapRowToType(row));
  }

  /**
   * Crée un nouveau type de template
   */
  async createType(data: {
    nom: string;
    description?: string;
  }): Promise<TemplateType> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO types_messages_personnalises (nom, description, actif)
       VALUES (?, ?, TRUE)`,
      [data.nom, data.description ?? null],
    );

    const insertId = result.insertId;

    // Récupérer le type créé avec son compteur
    const [rows] = await pool.query<TemplateTypeRow[]>(
      `SELECT
         t.id,
         t.nom,
         t.description,
         t.actif,
         (
           SELECT COUNT(*)
           FROM messages_personnalises mp
           WHERE mp.type_id = t.id
         ) AS templates_count
       FROM types_messages_personnalises t
       WHERE t.id = ?
       LIMIT 1`,
      [insertId],
    );

    if (rows.length === 0) {
      throw new Error("Erreur lors de la création du type de template");
    }

    return this.mapRowToType(rows[0]!);
  }

  /**
   * Met à jour un type existant (nom, description et/ou actif)
   */
  async updateType(
    id: number,
    data: { nom?: string; description?: string; actif?: boolean },
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }

    if (data.actif !== undefined) {
      fields.push("actif = ?");
      values.push(data.actif);
    }

    if (fields.length === 0) {
      return; // Rien à mettre à jour
    }

    values.push(id);

    await pool.query(
      `UPDATE types_messages_personnalises
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values,
    );
  }

  /**
   * Supprime un type de template
   * Vérifie préalablement qu'aucun template n'y est rattaché
   */
  async deleteType(id: number): Promise<void> {
    // Vérifier qu'aucun template n'est rattaché à ce type
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM messages_personnalises
       WHERE type_id = ?`,
      [id],
    );

    const total = countRows[0]?.total ?? 0;

    if (total > 0) {
      throw new Error(
        `Impossible de supprimer ce type : ${total} template(s) y sont rattachés. ` +
          `Supprimez d'abord les templates associés.`,
      );
    }

    await pool.query(
      `DELETE FROM types_messages_personnalises WHERE id = ?`,
      [id],
    );
  }

  // ===================================================================
  // TEMPLATES
  // ===================================================================

  /**
   * Retourne tous les templates avec filtres optionnels
   * Inclut le nom du type via LEFT JOIN
   */
  async getAll(typeId?: number, actifOnly?: boolean): Promise<Template[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (typeId !== undefined) {
      conditions.push("mp.type_id = ?");
      params.push(typeId);
    }

    if (actifOnly === true) {
      conditions.push("mp.actif = TRUE");
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query<TemplateRow[]>(
      `SELECT
         mp.id,
         mp.type_id,
         t.nom     AS type_nom,
         mp.titre,
         mp.contenu,
         mp.actif,
         mp.created_at,
         mp.updated_at
       FROM messages_personnalises mp
       LEFT JOIN types_messages_personnalises t ON mp.type_id = t.id
       ${whereClause}
       ORDER BY mp.created_at DESC`,
      params,
    );

    return rows.map((row) => this.mapRowToTemplate(row));
  }

  /**
   * Retourne un template par son id (avec le nom du type)
   * Retourne null si introuvable
   */
  async getById(id: number): Promise<Template | null> {
    const [rows] = await pool.query<TemplateRow[]>(
      `SELECT
         mp.id,
         mp.type_id,
         t.nom     AS type_nom,
         mp.titre,
         mp.contenu,
         mp.actif,
         mp.created_at,
         mp.updated_at
       FROM messages_personnalises mp
       LEFT JOIN types_messages_personnalises t ON mp.type_id = t.id
       WHERE mp.id = ?
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToTemplate(rows[0]!);
  }

  /**
   * Crée un nouveau template et retourne l'entité complète créée
   */
  async create(data: {
    type_id: number;
    titre: string;
    contenu: string;
    actif?: boolean;
  }): Promise<Template> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO messages_personnalises (type_id, titre, contenu, actif)
       VALUES (?, ?, ?, ?)`,
      [data.type_id, data.titre, data.contenu, data.actif ?? true],
    );

    const insertId = result.insertId;

    // Récupérer le template créé avec le JOIN
    const created = await this.getById(insertId);

    if (!created) {
      throw new Error("Erreur lors de la création du template");
    }

    return created;
  }

  /**
   * Met à jour les champs fournis d'un template existant
   * Met automatiquement à jour updated_at
   */
  async update(
    id: number,
    data: {
      type_id?: number;
      titre?: string;
      contenu?: string;
      actif?: boolean;
    },
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.type_id !== undefined) {
      fields.push("type_id = ?");
      values.push(data.type_id);
    }

    if (data.titre !== undefined) {
      fields.push("titre = ?");
      values.push(data.titre);
    }

    if (data.contenu !== undefined) {
      fields.push("contenu = ?");
      values.push(data.contenu);
    }

    if (data.actif !== undefined) {
      fields.push("actif = ?");
      values.push(data.actif);
    }

    if (fields.length === 0) {
      return; // Rien à mettre à jour
    }

    // Mettre à jour updated_at
    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.query(
      `UPDATE messages_personnalises
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values,
    );
  }

  /**
   * Supprime définitivement un template
   */
  async delete(id: number): Promise<void> {
    await pool.query(
      `DELETE FROM messages_personnalises WHERE id = ?`,
      [id],
    );
  }

  /**
   * Active ou désactive un template
   */
  async toggle(id: number, actif: boolean): Promise<void> {
    await pool.query(
      `UPDATE messages_personnalises
       SET actif = ?, updated_at = NOW()
       WHERE id = ?`,
      [actif, id],
    );
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  /**
   * Convertit une row MySQL en objet TemplateType typé
   */
  private mapRowToType(row: TemplateTypeRow): TemplateType {
    return {
      id: row.id,
      nom: row.nom,
      description: row.description,
      actif: Boolean(row.actif),
      templates_count: row.templates_count ?? 0,
    };
  }

  /**
   * Convertit une row MySQL en objet Template typé
   * Extrait les variables {{variable}} côté application
   */
  private mapRowToTemplate(row: TemplateRow): Template {
    // Extraire les variables détectées dans le titre ET le contenu
    const variables = TemplateEngineService.extractVariables(
      `${row.titre} ${row.contenu}`,
    );

    return {
      id: row.id,
      type_id: row.type_id,
      type_nom: row.type_nom ?? undefined,
      titre: row.titre,
      contenu: row.contenu,
      actif: Boolean(row.actif),
      variables,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : null,
    };
  }
}
