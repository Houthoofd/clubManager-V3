/**
 * MySQLStockRepository
 * Implémentation MySQL du repository stocks (Infrastructure Layer)
 * Gère les opérations sur les tables stocks et mouvements_stock
 *
 * IMPORTANT : La table mouvements_stock utilise taille VARCHAR (nom de la taille)
 * et user_id (PAS utilisateur_id)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// ==================== ROW TYPES ====================

export interface StockRow {
  id: number;
  article_id: number;
  taille_id: number;
  quantite: number;
  quantite_minimum: number;
  stock_physique: number;
  stock_reserve: number;
  stock_disponible: number;
  created_at: Date;
  updated_at: Date | null;
  // Champs issus des JOINs
  article_nom?: string;
  article_prix?: number;
  taille_nom?: string;
  en_rupture?: boolean;
  stock_bas?: boolean;
}

export interface UpdateStockInput {
  quantite?: number;
  quantite_minimum?: number;
}

// ==================== REPOSITORY INTERFACE ====================

export interface IStockRepository {
  findAll(articleId?: number): Promise<StockRow[]>;
  findById(id: number): Promise<StockRow | null>;
  findByArticleId(articleId: number): Promise<StockRow[]>;
  findByArticleAndSize(articleId: number, tailleId: number): Promise<StockRow | null>;
  findLowStock(): Promise<StockRow[]>;
  upsert(articleId: number, tailleId: number, quantite: number, quantiteMinimum?: number): Promise<number>;
  update(id: number, data: UpdateStockInput): Promise<void>;
  adjustQuantity(id: number, delta: number, motif: string, userId: number | null, commandeId?: number | null): Promise<void>;
  decreaseForOrder(items: { article_id: number; taille_id: number; quantite: number }[], commandeId: number, userId: number): Promise<void>;
  restoreForCancellation(commandeId: number, userId: number): Promise<void>;
}

// ==================== DB ROW INTERFACES ====================

interface StockDbRow extends RowDataPacket {
  id: number;
  article_id: number;
  taille_id: number;
  quantite: number;
  quantite_minimum: number;
  stock_physique: number;
  stock_reserve: number;
  stock_disponible: number;
  created_at: Date;
  updated_at: Date | null;
  article_nom: string | null;
  article_prix: string | null; // DECIMAL
  taille_nom: string | null;
  en_rupture: boolean | number;
  stock_bas: boolean | number;
}

interface TailleRow extends RowDataPacket {
  nom: string;
}

interface OrderItemRow extends RowDataPacket {
  article_id: number;
  taille_id: number;
  quantite: number;
}

// ==================== BASE SELECT ====================

const BASE_SELECT = `
  SELECT
    s.id,
    s.article_id,
    s.taille_id,
    s.quantite,
    s.quantite_minimum,
    s.stock_physique,
    s.stock_reserve,
    s.stock_disponible,
    s.created_at,
    s.updated_at,
    a.nom AS article_nom,
    a.prix AS article_prix,
    t.nom AS taille_nom,
    (s.quantite <= 0) AS en_rupture,
    (s.quantite > 0 AND s.quantite <= s.quantite_minimum) AS stock_bas
  FROM stocks s
  JOIN articles a ON a.id = s.article_id
  JOIN tailles t ON t.id = s.taille_id
`;

// ==================== REPOSITORY ====================

export class MySQLStockRepository implements IStockRepository {
  /**
   * Récupère tous les stocks avec infos enrichies
   * Optionnellement filtré par article_id
   */
  async findAll(articleId?: number): Promise<StockRow[]> {
    let query = BASE_SELECT;
    const params: number[] = [];

    if (articleId !== undefined) {
      query += " WHERE s.article_id = ?";
      params.push(articleId);
    }

    query += " ORDER BY a.nom ASC, t.ordre ASC";

    const [rows] = await pool.query<StockDbRow[]>(query, params);

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Récupère un stock par son ID
   */
  async findById(id: number): Promise<StockRow | null> {
    const [rows] = await pool.query<StockDbRow[]>(
      `${BASE_SELECT} WHERE s.id = ? LIMIT 1`,
      [id],
    );

    if (rows.length === 0 || rows[0] === undefined) return null;
    return this.mapRow(rows[0]);
  }

  /**
   * Récupère tous les stocks d'un article
   */
  async findByArticleId(articleId: number): Promise<StockRow[]> {
    const [rows] = await pool.query<StockDbRow[]>(
      `${BASE_SELECT} WHERE s.article_id = ? ORDER BY t.ordre ASC`,
      [articleId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Récupère un stock par article_id et taille_id
   */
  async findByArticleAndSize(articleId: number, tailleId: number): Promise<StockRow | null> {
    const [rows] = await pool.query<StockDbRow[]>(
      `${BASE_SELECT} WHERE s.article_id = ? AND s.taille_id = ? LIMIT 1`,
      [articleId, tailleId],
    );

    if (rows.length === 0 || rows[0] === undefined) return null;
    return this.mapRow(rows[0]);
  }

  /**
   * Récupère les stocks bas (quantite <= quantite_minimum)
   */
  async findLowStock(): Promise<StockRow[]> {
    const [rows] = await pool.query<StockDbRow[]>(
      `${BASE_SELECT} WHERE s.quantite <= s.quantite_minimum ORDER BY s.quantite ASC`,
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Insère ou met à jour un stock (upsert)
   * Retourne l'ID du stock (existant ou nouvellement créé)
   */
  async upsert(
    articleId: number,
    tailleId: number,
    quantite: number,
    quantiteMinimum: number = 0,
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO stocks
        (article_id, taille_id, quantite, quantite_minimum, stock_physique, stock_disponible)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        quantite = VALUES(quantite),
        quantite_minimum = VALUES(quantite_minimum),
        stock_physique = VALUES(quantite),
        stock_disponible = VALUES(quantite),
        updated_at = NOW()`,
      [articleId, tailleId, quantite, quantiteMinimum, quantite, quantite],
    );

    // Si c'est un INSERT, insertId est l'ID du nouveau stock
    // Si c'est un UPDATE, insertId vaut 0 — on doit récupérer l'ID existant
    if (result.insertId > 0) {
      return result.insertId;
    }

    // Récupérer l'ID du stock existant
    const stock = await this.findByArticleAndSize(articleId, tailleId);
    if (!stock) {
      throw new Error("Impossible de récupérer le stock après upsert");
    }
    return stock.id;
  }

  /**
   * Met à jour un stock existant
   */
  async update(id: number, data: UpdateStockInput): Promise<void> {
    const fields: string[] = [];
    const values: number[] = [];

    if (data.quantite !== undefined) {
      fields.push("quantite = ?");
      fields.push("stock_physique = ?");
      fields.push("stock_disponible = ?");
      values.push(data.quantite, data.quantite, data.quantite);
    }

    if (data.quantite_minimum !== undefined) {
      fields.push("quantite_minimum = ?");
      values.push(data.quantite_minimum);
    }

    if (fields.length === 0) {
      return; // Rien à mettre à jour
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.query(
      `UPDATE stocks SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  /**
   * Ajuste la quantité d'un stock (+ ou -)
   * Enregistre un mouvement dans mouvements_stock
   */
  async adjustQuantity(
    id: number,
    delta: number,
    motif: string,
    userId: number | null,
    commandeId?: number | null,
  ): Promise<void> {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Récupérer le stock actuel avec le nom de la taille
      const [stockRows] = await conn.query<StockDbRow[]>(
        `${BASE_SELECT} WHERE s.id = ? LIMIT 1`,
        [id],
      );

      if (stockRows.length === 0 || stockRows[0] === undefined) {
        throw new Error(`Stock introuvable : ID ${id}`);
      }

      const stock = this.mapRow(stockRows[0]);
      const quantiteAvant = stock.quantite;
      const quantiteApres = quantiteAvant + delta;

      // Déterminer le type de mouvement
      let typeMouvement: string;
      if (commandeId) {
        typeMouvement = delta < 0 ? "commande" : "annulation";
      } else {
        typeMouvement = "ajustement";
      }

      // Mettre à jour le stock
      await conn.query(
        `UPDATE stocks
         SET quantite = ?,
             stock_physique = ?,
             stock_disponible = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [quantiteApres, quantiteApres, quantiteApres, id],
      );

      // Enregistrer le mouvement
      await conn.query(
        `INSERT INTO mouvements_stock
          (article_id, taille, type_mouvement, quantite_avant, quantite_apres, quantite_mouvement, commande_id, user_id, motif)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stock.article_id,
          stock.taille_nom ?? "N/A",
          typeMouvement,
          quantiteAvant,
          quantiteApres,
          delta,
          commandeId ?? null,
          userId,
          motif,
        ],
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Diminue les stocks pour une commande (transaction)
   * Enregistre des mouvements de type "commande"
   */
  async decreaseForOrder(
    items: { article_id: number; taille_id: number; quantite: number }[],
    commandeId: number,
    userId: number,
  ): Promise<void> {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      for (const item of items) {
        // Récupérer le stock existant
        const [stockRows] = await conn.query<StockDbRow[]>(
          `${BASE_SELECT} WHERE s.article_id = ? AND s.taille_id = ? LIMIT 1`,
          [item.article_id, item.taille_id],
        );

        if (stockRows.length === 0 || stockRows[0] === undefined) {
          throw new Error(
            `Stock introuvable pour article ${item.article_id} taille ${item.taille_id}`,
          );
        }

        const stock = this.mapRow(stockRows[0]);
        const quantiteAvant = stock.quantite;
        const quantiteApres = quantiteAvant - item.quantite;

        if (quantiteApres < 0) {
          throw new Error(
            `Stock insuffisant pour ${stock.article_nom ?? "article"} taille ${stock.taille_nom ?? "N/A"}`,
          );
        }

        // Mettre à jour le stock
        await conn.query(
          `UPDATE stocks
           SET quantite = ?,
               stock_physique = ?,
               stock_disponible = ?,
               updated_at = NOW()
           WHERE id = ?`,
          [quantiteApres, quantiteApres, quantiteApres, stock.id],
        );

        // Enregistrer le mouvement
        await conn.query(
          `INSERT INTO mouvements_stock
            (article_id, taille, type_mouvement, quantite_avant, quantite_apres, quantite_mouvement, commande_id, user_id, motif)
           VALUES (?, ?, 'commande', ?, ?, ?, ?, ?, ?)`,
          [
            stock.article_id,
            stock.taille_nom ?? "N/A",
            quantiteAvant,
            quantiteApres,
            -item.quantite,
            commandeId,
            userId,
            `Commande #${commandeId}`,
          ],
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

  /**
   * Restaure les stocks pour une commande annulée (transaction)
   * Enregistre des mouvements de type "annulation"
   */
  async restoreForCancellation(commandeId: number, userId: number): Promise<void> {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Récupérer les items de la commande
      const [itemRows] = await conn.query<OrderItemRow[]>(
        `SELECT article_id, taille_id, quantite
         FROM commande_articles
         WHERE commande_id = ?`,
        [commandeId],
      );

      for (const item of itemRows) {
        // Récupérer le stock existant
        const [stockRows] = await conn.query<StockDbRow[]>(
          `${BASE_SELECT} WHERE s.article_id = ? AND s.taille_id = ? LIMIT 1`,
          [item.article_id, item.taille_id],
        );

        if (stockRows.length === 0 || stockRows[0] === undefined) {
          // Si le stock n'existe pas, on le crée
          await conn.query(
            `INSERT INTO stocks (article_id, taille_id, quantite, stock_physique, stock_disponible)
             VALUES (?, ?, ?, ?, ?)`,
            [item.article_id, item.taille_id, item.quantite, item.quantite, item.quantite],
          );

          // Récupérer le nom de la taille pour le mouvement
          const [tailleRows] = await conn.query<TailleRow[]>(
            "SELECT nom FROM tailles WHERE id = ? LIMIT 1",
            [item.taille_id],
          );
          const tailleNom = tailleRows[0]?.nom ?? "N/A";

          // Enregistrer le mouvement
          await conn.query(
            `INSERT INTO mouvements_stock
              (article_id, taille, type_mouvement, quantite_avant, quantite_apres, quantite_mouvement, commande_id, user_id, motif)
             VALUES (?, ?, 'annulation', 0, ?, ?, ?, ?, ?)`,
            [
              item.article_id,
              tailleNom,
              item.quantite,
              item.quantite,
              commandeId,
              userId,
              `Annulation commande #${commandeId}`,
            ],
          );
        } else {
          const stock = this.mapRow(stockRows[0]);
          const quantiteAvant = stock.quantite;
          const quantiteApres = quantiteAvant + item.quantite;

          // Mettre à jour le stock
          await conn.query(
            `UPDATE stocks
             SET quantite = ?,
                 stock_physique = ?,
                 stock_disponible = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [quantiteApres, quantiteApres, quantiteApres, stock.id],
          );

          // Enregistrer le mouvement
          await conn.query(
            `INSERT INTO mouvements_stock
              (article_id, taille, type_mouvement, quantite_avant, quantite_apres, quantite_mouvement, commande_id, user_id, motif)
             VALUES (?, ?, 'annulation', ?, ?, ?, ?, ?, ?)`,
            [
              stock.article_id,
              stock.taille_nom ?? "N/A",
              quantiteAvant,
              quantiteApres,
              item.quantite,
              commandeId,
              userId,
              `Annulation commande #${commandeId}`,
            ],
          );
        }
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
   * Convertit une row MySQL brute en objet StockRow typé
   */
  private mapRow(row: StockDbRow): StockRow {
    return {
      id: row.id,
      article_id: row.article_id,
      taille_id: row.taille_id,
      quantite: row.quantite,
      quantite_minimum: row.quantite_minimum,
      stock_physique: row.stock_physique,
      stock_reserve: row.stock_reserve,
      stock_disponible: row.stock_disponible,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : null,
      article_nom: row.article_nom ?? undefined,
      article_prix: row.article_prix ? Number(row.article_prix) : undefined,
      taille_nom: row.taille_nom ?? undefined,
      en_rupture: Boolean(row.en_rupture),
      stock_bas: Boolean(row.stock_bas),
    };
  }
}
