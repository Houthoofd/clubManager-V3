/**
 * MySQLInformationRepository
 * Implémentation MySQL du repository informations (Infrastructure Layer)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  Information,
  CreateInformation,
  UpdateInformation,
  InformationsListResponse,
  ListInformationsQuery,
} from "@clubmanager/types";
import type { IInformationRepository } from "../../domain/repositories/IInformationRepository.js";

// ==================== ROW INTERFACES ====================

interface InformationRow extends RowDataPacket {
  id: number;
  cle: string;
  valeur: string;
  description: string | null;
  updated_at: Date | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== REPOSITORY ====================

export class MySQLInformationRepository implements IInformationRepository {
  /**
   * Récupère la liste paginée des paramètres avec filtres dynamiques
   */
  async findAll(query: ListInformationsQuery): Promise<InformationsListResponse> {
    const {
      search,
      cle,
      sort_by = "cle",
      sort_order = "asc",
      page = 1,
      limit = 20,
    } = query;

    // Construction dynamique des conditions WHERE
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      const like = `%${search}%`;
      conditions.push(
        "(i.cle LIKE ? OR i.valeur LIKE ? OR i.description LIKE ?)",
      );
      params.push(like, like, like);
    }

    if (cle) {
      conditions.push("i.cle = ?");
      params.push(cle);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Whitelist des colonnes de tri pour prévenir les injections SQL
    const sortColumn =
      sort_by === "updated_at" ? "i.updated_at" : "i.cle";
    const sortDir = sort_order === "desc" ? "DESC" : "ASC";

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM informations i ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;

    // Requête de données avec pagination LIMIT / OFFSET
    const offset = (page - 1) * limit;
    const dataParams: (string | number)[] = [...params, limit, offset];

    const [rows] = await pool.query<InformationRow[]>(
      `SELECT
         i.id,
         i.cle,
         i.valeur,
         i.description,
         i.updated_at
       FROM informations i
       ${whereClause}
       ORDER BY ${sortColumn} ${sortDir}
       LIMIT ? OFFSET ?`,
      dataParams,
    );

    return {
      data: rows.map((row) => this.mapRowToInformation(row)),
      pagination: {
        page,
        page_size: limit,
        total,
        total_pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  /**
   * Trouve un paramètre par sa clé unique
   */
  async findByKey(cle: string): Promise<Information | null> {
    const [rows] = await pool.query<InformationRow[]>(
      `SELECT id, cle, valeur, description, updated_at
       FROM informations
       WHERE cle = ?
       LIMIT 1`,
      [cle],
    );

    if (rows.length === 0) return null;
    return this.mapRowToInformation(rows[0]!);
  }

  /**
   * Trouve un paramètre par son ID numérique
   */
  async findById(id: number): Promise<Information | null> {
    const [rows] = await pool.query<InformationRow[]>(
      `SELECT id, cle, valeur, description, updated_at
       FROM informations
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRowToInformation(rows[0]!);
  }

  /**
   * Crée un nouveau paramètre
   */
  async create(data: CreateInformation): Promise<Information> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO informations (cle, valeur, description)
       VALUES (?, ?, ?)`,
      [data.cle, data.valeur, data.description ?? null],
    );

    const created = await this.findById(result.insertId);
    if (!created) throw new Error("Erreur lors de la création du paramètre");
    return created;
  }

  /**
   * Met à jour un paramètre existant par son ID
   */
  async update(id: number, data: UpdateInformation): Promise<Information> {
    await pool.query(
      `UPDATE informations
       SET
         valeur      = COALESCE(?, valeur),
         description = ?,
         updated_at  = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [data.valeur ?? null, data.description ?? null, id],
    );

    const updated = await this.findById(id);
    if (!updated) throw new Error("Paramètre introuvable après mise à jour");
    return updated;
  }

  /**
   * Upsert d'un paramètre (INSERT ON DUPLICATE KEY UPDATE)
   * Si la clé existe déjà, met à jour valeur et description
   */
  async upsert(data: CreateInformation): Promise<Information> {
    await pool.query(
      `INSERT INTO informations (cle, valeur, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         valeur      = VALUES(valeur),
         description = VALUES(description),
         updated_at  = CURRENT_TIMESTAMP`,
      [data.cle, data.valeur, data.description ?? null],
    );

    const result = await this.findByKey(data.cle);
    if (!result) throw new Error("Erreur lors de l'upsert du paramètre");
    return result;
  }

  /**
   * Upsert en masse de plusieurs paramètres dans une transaction
   */
  async bulkUpsert(informations: CreateInformation[]): Promise<Information[]> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const info of informations) {
        await connection.query(
          `INSERT INTO informations (cle, valeur, description)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             valeur      = VALUES(valeur),
             description = VALUES(description),
             updated_at  = CURRENT_TIMESTAMP`,
          [info.cle, info.valeur, info.description ?? null],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    // Récupérer toutes les entrées créées/mises à jour
    const keys = informations.map((i) => i.cle);
    const placeholders = keys.map(() => "?").join(", ");

    const [rows] = await pool.query<InformationRow[]>(
      `SELECT id, cle, valeur, description, updated_at
       FROM informations
       WHERE cle IN (${placeholders})
       ORDER BY cle ASC`,
      keys,
    );

    return rows.map((row) => this.mapRowToInformation(row));
  }

  /**
   * Supprime un paramètre par son ID
   */
  async delete(id: number): Promise<void> {
    await pool.query(`DELETE FROM informations WHERE id = ?`, [id]);
  }

  /**
   * Vérifie si une clé existe déjà en base
   */
  async keyExists(cle: string): Promise<boolean> {
    const [rows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM informations WHERE cle = ?`,
      [cle],
    );
    return (rows[0]?.total ?? 0) > 0;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL en objet Information
   */
  private mapRowToInformation(row: InformationRow): Information {
    return {
      id: row.id,
      cle: row.cle,
      valeur: row.valeur,
      description: row.description ?? null,
      updated_at: row.updated_at ? new Date(row.updated_at) : null,
    };
  }
}
