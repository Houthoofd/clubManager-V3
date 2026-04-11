/**
 * MySQLPricingPlanRepository
 * Implémentation MySQL du repository plans tarifaires (Infrastructure Layer)
 * Gère toutes les opérations CRUD sur la table plans_tarifaires
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  IPricingPlanRepository,
  PricingPlanRow,
  CreatePricingPlanInput,
  UpdatePricingPlanInput,
} from "../../domain/repositories/IPricingPlanRepository.js";

// ==================== DB ROW INTERFACE ====================

interface PricingPlanDbRow extends RowDataPacket {
  id: number;
  nom: string;
  description: string | null;
  prix: string; // DECIMAL retourné en string par MySQL
  duree_mois: number;
  actif: number; // BOOLEAN retourné en 0/1 par MySQL
  created_at: Date;
  updated_at: Date;
}

// ==================== REPOSITORY ====================

export class MySQLPricingPlanRepository implements IPricingPlanRepository {
  /**
   * Récupère tous les plans tarifaires, avec filtre optionnel sur le statut actif
   */
  async findAll(actif?: boolean): Promise<PricingPlanRow[]> {
    const conditions: string[] = [];
    const params: boolean[] = [];

    if (actif !== undefined) {
      conditions.push("actif = ?");
      params.push(actif);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query<PricingPlanDbRow[]>(
      `SELECT * FROM plans_tarifaires ${where} ORDER BY nom ASC`,
      params,
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Récupère un plan tarifaire par son ID
   */
  async findById(id: number): Promise<PricingPlanRow | null> {
    const [rows] = await pool.query<PricingPlanDbRow[]>(
      "SELECT * FROM plans_tarifaires WHERE id = ? LIMIT 1",
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Crée un nouveau plan tarifaire et retourne l'ID généré
   */
  async create(data: CreatePricingPlanInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO plans_tarifaires (nom, description, prix, duree_mois)
       VALUES (?, ?, ?, ?)`,
      [data.nom, data.description ?? null, data.prix, data.duree_mois],
    );

    return result.insertId;
  }

  /**
   * Met à jour les champs fournis d'un plan tarifaire (mise à jour partielle)
   */
  async update(id: number, data: UpdatePricingPlanInput): Promise<void> {
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      params.push(data.nom);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      params.push(data.description ?? null);
    }
    if (data.prix !== undefined) {
      fields.push("prix = ?");
      params.push(data.prix);
    }
    if (data.duree_mois !== undefined) {
      fields.push("duree_mois = ?");
      params.push(data.duree_mois);
    }

    if (fields.length === 0) return;

    params.push(id);

    await pool.query(
      `UPDATE plans_tarifaires SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params,
    );
  }

  /**
   * Active ou désactive un plan tarifaire
   */
  async toggleActive(id: number, actif: boolean): Promise<void> {
    await pool.query(
      "UPDATE plans_tarifaires SET actif = ?, updated_at = NOW() WHERE id = ?",
      [actif, id],
    );
  }

  /**
   * Supprime définitivement un plan tarifaire
   */
  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM plans_tarifaires WHERE id = ?", [id]);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet PricingPlanRow typé
   * Cast DECIMAL (string) → number et TINYINT (0/1) → boolean
   */
  private mapRow(row: PricingPlanDbRow): PricingPlanRow {
    return {
      id: row.id,
      nom: row.nom,
      description: row.description,
      prix: Number(row.prix),
      duree_mois: row.duree_mois,
      actif: Boolean(row.actif),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
