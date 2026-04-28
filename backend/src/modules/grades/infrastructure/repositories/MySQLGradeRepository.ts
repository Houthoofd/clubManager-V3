/**
 * MySQLGradeRepository
 * Implémentation MySQL du repository grades (Infrastructure Layer)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { Grade, CreateGradeDto, UpdateGradeDto } from "../../domain/types.js";
import type { IGradeRepository } from "../../domain/repositories/IGradeRepository.js";

// ==================== ROW INTERFACES ====================

interface GradeRow extends RowDataPacket {
  id: number;
  nom: string;
  ordre: number;
  couleur: string | null;
}

interface CountRow extends RowDataPacket {
  cnt: number;
}

// ==================== REPOSITORY ====================

export class MySQLGradeRepository implements IGradeRepository {
  /**
   * Retourne tous les grades triés par ordre croissant
   */
  async findAll(): Promise<Grade[]> {
    const [rows] = await pool.query<GradeRow[]>(
      `SELECT id, nom, ordre, couleur
       FROM grades
       ORDER BY ordre ASC`,
    );

    return rows.map((row) => this.mapRowToGrade(row));
  }

  /**
   * Trouve un grade par son ID, ou null si inexistant
   */
  async findById(id: number): Promise<Grade | null> {
    const [rows] = await pool.query<GradeRow[]>(
      `SELECT id, nom, ordre, couleur
       FROM grades
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToGrade(rows[0]!);
  }

  /**
   * Crée un nouveau grade et retourne l'entité persistée
   */
  async create(data: CreateGradeDto): Promise<Grade> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO grades (nom, ordre, couleur)
       VALUES (?, ?, ?)`,
      [data.nom, data.ordre, data.couleur ?? null],
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error("Erreur lors de la création du grade");
    }

    return created;
  }

  /**
   * Met à jour partiellement un grade et retourne l'entité mise à jour.
   * Seuls les champs présents dans UpdateGradeDto (hors id) sont modifiés.
   */
  async update(data: UpdateGradeDto): Promise<Grade> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }

    if (data.ordre !== undefined) {
      fields.push("ordre = ?");
      values.push(data.ordre);
    }

    // couleur peut être null (suppression de la couleur) ou une string
    // On vérifie !== undefined pour distinguer "non fourni" de "explicitement null"
    if (data.couleur !== undefined) {
      fields.push("couleur = ?");
      values.push(data.couleur ?? null);
    }

    if (fields.length === 0) {
      // Aucun champ à mettre à jour : on retourne l'entité existante
      const existing = await this.findById(data.id);
      if (!existing) {
        throw new Error("Grade introuvable");
      }
      return existing;
    }

    values.push(data.id);

    await pool.query<ResultSetHeader>(
      `UPDATE grades SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await this.findById(data.id);
    if (!updated) {
      throw new Error("Grade introuvable");
    }

    return updated;
  }

  /**
   * Supprime un grade par son ID.
   * Vérifie d'abord qu'aucun utilisateur actif ou professeur actif n'utilise ce grade.
   * Lance une erreur descriptive si des références existent.
   */
  async delete(id: number): Promise<void> {
    // Vérification des membres actifs (utilisateurs non supprimés)
    const [membresRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS cnt
       FROM utilisateurs
       WHERE grade_id = ? AND deleted_at IS NULL`,
      [id],
    );
    const membresCnt = membresRows[0]?.cnt ?? 0;

    // Vérification des professeurs actifs
    const [profsRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS cnt
       FROM professeurs
       WHERE grade_id = ? AND actif = TRUE`,
      [id],
    );
    const profsCnt = profsRows[0]?.cnt ?? 0;

    if (membresCnt > 0 || profsCnt > 0) {
      const parts: string[] = [];
      if (membresCnt > 0) parts.push(`${membresCnt} membre(s)`);
      if (profsCnt > 0) parts.push(`${profsCnt} professeur(s)`);
      throw new Error(
        `Ce grade est utilisé par ${parts.join(" et ")} et ne peut pas être supprimé`,
      );
    }

    await pool.query<ResultSetHeader>(
      `DELETE FROM grades WHERE id = ?`,
      [id],
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL en objet Grade
   */
  private mapRowToGrade(row: GradeRow): Grade {
    return {
      id: row.id,
      nom: row.nom,
      ordre: row.ordre,
      couleur: row.couleur ?? null,
    };
  }
}
