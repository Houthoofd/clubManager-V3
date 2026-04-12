/**
 * MySQLSizeRepository
 * Implémentation MySQL du repository tailles (Infrastructure Layer)
 * Gère les opérations sur la table tailles
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  ISizeRepository,
  SizeRow,
  CreateSizeInput,
  UpdateSizeInput,
} from "../../domain/repositories/ISizeRepository.js";

// ==================== DB ROW INTERFACE ====================

interface SizeDbRow extends RowDataPacket {
  id: number;
  nom: string;
  ordre: number;
}

// ==================== REPOSITORY ====================

export class MySQLSizeRepository implements ISizeRepository {
  /**
   * Récupère toutes les tailles triées par ordre puis nom
   */
  async findAll(): Promise<SizeRow[]> {
    const [rows] = await pool.query<SizeDbRow[]>(
      `SELECT id, nom, ordre
       FROM tailles
       ORDER BY ordre ASC, nom ASC`,
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Récupère une taille par son ID
   */
  async findById(id: number): Promise<SizeRow | null> {
    const [rows] = await pool.query<SizeDbRow[]>(
      `SELECT id, nom, ordre
       FROM tailles
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Crée une nouvelle taille et retourne l'ID généré
   */
  async create(data: CreateSizeInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tailles (nom, ordre)
       VALUES (?, ?)`,
      [data.nom, data.ordre ?? 0],
    );

    return result.insertId;
  }

  /**
   * Met à jour une taille existante
   * Construit dynamiquement la clause SET avec seulement les champs fournis
   */
  async update(id: number, data: UpdateSizeInput): Promise<void> {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }
    if (data.ordre !== undefined) {
      fields.push("ordre = ?");
      values.push(data.ordre);
    }

    if (fields.length === 0) {
      return; // Rien à mettre à jour
    }

    values.push(id);

    await pool.query(
      `UPDATE tailles SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  /**
   * Supprime une taille
   */
  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM tailles WHERE id = ?", [id]);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet SizeRow typé
   */
  private mapRow(row: SizeDbRow): SizeRow {
    return {
      id: row.id,
      nom: row.nom,
      ordre: row.ordre,
    };
  }
}
