/**
 * MySQLOrderRepository
 * Implémentation MySQL du repository commandes (Infrastructure Layer)
 * Gère les opérations sur les tables commandes et commande_articles
 *
 * IMPORTANT : La table commandes utilise user_id (PAS utilisateur_id)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { randomUUID } from "crypto";
import type { OrderStatus } from "@clubmanager/types";
import type {
  IOrderRepository,
  OrderRow,
  OrderItemRow,
  OrderWithItems,
  CreateOrderInput,
  OrderQuery,
  PaginatedOrders,
} from "../../domain/repositories/IOrderRepository.js";

// ==================== DB ROW INTERFACES ====================

interface OrderDbRow extends RowDataPacket {
  id: number;
  unique_id: string;
  numero_commande: string;
  user_id: number;
  total: string; // DECIMAL retourné en string par MySQL
  date_commande: Date;
  statut: OrderStatus;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs
  user_first_name: string | null;
  user_last_name: string | null;
  user_email: string | null;
}

interface OrderItemDbRow extends RowDataPacket {
  id: number;
  commande_id: number;
  article_id: number;
  taille_id: number | null;
  quantite: number;
  prix: string; // DECIMAL
  created_at: Date;
  article_nom: string | null;
  article_image_url: string | null;
  taille_nom: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== BASE SELECT ====================

const BASE_SELECT = `
  SELECT
    c.id,
    c.unique_id,
    c.numero_commande,
    c.user_id,
    c.total,
    c.date_commande,
    c.statut,
    c.ip_address,
    c.user_agent,
    c.created_at,
    c.updated_at,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    u.email AS user_email
  FROM commandes c
  LEFT JOIN utilisateurs u ON u.id = c.user_id
`;

// ==================== REPOSITORY ====================

export class MySQLOrderRepository implements IOrderRepository {
  /**
   * Récupère la liste paginée des commandes avec filtres dynamiques
   */
  async findAll(query: OrderQuery): Promise<PaginatedOrders> {
    const {
      user_id,
      statut,
      page = 1,
      limit = 20,
    } = query;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (user_id !== undefined) {
      conditions.push("c.user_id = ?");
      params.push(user_id);
    }

    if (statut) {
      conditions.push("c.statut = ?");
      params.push(statut);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM commandes c ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    // Requête de données avec pagination
    const [rows] = await pool.query<OrderDbRow[]>(
      `${BASE_SELECT} ${whereClause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      orders: rows.map((row) => this.mapRow(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère une commande par son ID avec tous ses items
   */
  async findById(id: number): Promise<OrderWithItems | null> {
    // Récupérer la commande
    const [rows] = await pool.query<OrderDbRow[]>(
      `${BASE_SELECT} WHERE c.id = ? LIMIT 1`,
      [id],
    );

    if (rows.length === 0 || rows[0] === undefined) return null;

    const order = this.mapRow(rows[0]);

    // Récupérer les items de la commande avec infos articles/tailles
    const [itemRows] = await pool.query<OrderItemDbRow[]>(
      `SELECT
        ca.id,
        ca.commande_id,
        ca.article_id,
        ca.taille_id,
        ca.quantite,
        ca.prix,
        ca.created_at,
        a.nom AS article_nom,
        (SELECT url FROM images WHERE article_id = a.id ORDER BY ordre ASC LIMIT 1) AS article_image_url,
        t.nom AS taille_nom
      FROM commande_articles ca
      LEFT JOIN articles a ON a.id = ca.article_id
      LEFT JOIN tailles t ON t.id = ca.taille_id
      WHERE ca.commande_id = ?
      ORDER BY ca.id ASC`,
      [id],
    );

    return {
      ...order,
      items: itemRows.map((row) => this.mapItemRow(row)),
    };
  }

  /**
   * Récupère toutes les commandes d'un utilisateur
   */
  async findByUserId(userId: number): Promise<OrderRow[]> {
    const [rows] = await pool.query<OrderDbRow[]>(
      `${BASE_SELECT} WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [userId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Crée une nouvelle commande avec ses items en transaction
   * Génère automatiquement unique_id et numero_commande
   */
  async create(data: CreateOrderInput): Promise<number> {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Générer unique_id (UUID)
      const uniqueId = randomUUID();

      // Générer numero_commande (format: CMD-YYYYMMDD-XXXXX)
      const dateStr = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      const numeroCommande = `CMD-${dateStr}-${randomPart}`;

      // Calculer le total
      const total = data.items.reduce(
        (sum, item) => sum + item.prix * item.quantite,
        0,
      );

      // Insérer la commande
      const [commandeResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO commandes
          (unique_id, numero_commande, user_id, total, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uniqueId,
          numeroCommande,
          data.user_id,
          total,
          data.ip_address ?? null,
          data.user_agent ?? null,
        ],
      );

      const commandeId = commandeResult.insertId;

      // Insérer les items
      for (const item of data.items) {
        await conn.query(
          `INSERT INTO commande_articles
            (commande_id, article_id, taille_id, quantite, prix)
           VALUES (?, ?, ?, ?, ?)`,
          [commandeId, item.article_id, item.taille_id, item.quantite, item.prix],
        );
      }

      await conn.commit();
      return commandeId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Met à jour le statut d'une commande
   */
  async updateStatus(id: number, statut: OrderStatus): Promise<void> {
    await pool.query(
      "UPDATE commandes SET statut = ?, updated_at = NOW() WHERE id = ?",
      [statut, id],
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row commande MySQL en objet OrderRow typé
   */
  private mapRow(row: OrderDbRow): OrderRow {
    return {
      id: row.id,
      unique_id: row.unique_id,
      numero_commande: row.numero_commande,
      user_id: row.user_id,
      total: Number(row.total),
      date_commande: new Date(row.date_commande),
      statut: row.statut,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      user_first_name: row.user_first_name ?? undefined,
      user_last_name: row.user_last_name ?? undefined,
      user_email: row.user_email ?? undefined,
    };
  }

  /**
   * Convertit une row item MySQL en objet OrderItemRow typé
   */
  private mapItemRow(row: OrderItemDbRow): OrderItemRow {
    return {
      id: row.id,
      commande_id: row.commande_id,
      article_id: row.article_id,
      taille_id: row.taille_id,
      quantite: row.quantite,
      prix: Number(row.prix),
      created_at: new Date(row.created_at),
      article_nom: row.article_nom ?? undefined,
      article_image_url: row.article_image_url ?? undefined,
      taille_nom: row.taille_nom ?? undefined,
    };
  }
}
