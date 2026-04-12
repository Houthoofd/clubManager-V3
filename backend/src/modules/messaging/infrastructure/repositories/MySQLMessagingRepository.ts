/**
 * MySQLMessagingRepository
 * Implémentation MySQL du repository messaging (Infrastructure Layer)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  IMessagingRepository,
  MessageWithDetails,
  PaginatedMessages,
  SendMessageParams,
  BroadcastParams,
  RecipientInfo,
} from "../../domain/repositories/IMessagingRepository.js";

// ==================== ROW INTERFACES ====================

interface MessageRow extends RowDataPacket {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  sujet: string | null;
  contenu: string;
  lu: boolean | number;
  date_lecture: Date | null;
  envoye_par_email: boolean | number;
  broadcast_id: number | null;
  created_at: Date;
  expediteur_nom: string;
  expediteur_userId: string;
  destinataire_nom: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface RecipientRow extends RowDataPacket {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

// ==================== REPOSITORY ====================

export class MySQLMessagingRepository implements IMessagingRepository {
  /**
   * Insère un message individuel en base de données
   */
  async sendToUser(params: SendMessageParams): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO messages
         (expediteur_id, destinataire_id, sujet, contenu, broadcast_id, envoye_par_email, lu)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [
        params.expediteur_id,
        params.destinataire_id,
        params.sujet ?? null,
        params.contenu,
        params.broadcast_id ?? null,
        params.envoye_par_email ?? false,
      ],
    );

    return result.insertId;
  }

  /**
   * Crée un enregistrement de broadcast (envoi groupé)
   */
  async createBroadcast(params: BroadcastParams): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO broadcasts
         (expediteur_id, sujet, contenu, cible, envoye_par_email)
       VALUES (?, ?, ?, ?, ?)`,
      [
        params.expediteur_id,
        params.sujet ?? null,
        params.contenu,
        params.cible,
        params.envoye_par_email,
      ],
    );

    return result.insertId;
  }

  /**
   * Met à jour le compteur de destinataires d'un broadcast
   */
  async updateBroadcastCount(broadcastId: number, count: number): Promise<void> {
    await pool.query(
      `UPDATE broadcasts SET destinataires_count = ? WHERE id = ?`,
      [count, broadcastId],
    );
  }

  /**
   * Retourne la boîte de réception paginée d'un utilisateur
   * Filtre optionnel sur l'état de lecture (lu / non lu)
   */
  async getInbox(
    userId: number,
    page: number,
    limit: number,
    lu?: boolean,
  ): Promise<PaginatedMessages> {
    const conditions: string[] = ["m.destinataire_id = ?"];
    const params: (number | boolean)[] = [userId];

    if (lu !== undefined) {
      conditions.push("m.lu = ?");
      params.push(lu);
    }

    const whereClause = conditions.join(" AND ");

    // Compter le total pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM messages m
       WHERE ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    // Récupérer les messages avec les infos expéditeur / destinataire
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT
         m.id,
         m.expediteur_id,
         m.destinataire_id,
         m.sujet,
         m.contenu,
         m.lu,
         m.date_lecture,
         m.envoye_par_email,
         m.broadcast_id,
         m.created_at,
         CONCAT(u_exp.first_name, ' ', u_exp.last_name)  AS expediteur_nom,
         u_exp.userId                                     AS expediteur_userId,
         CONCAT(u_dest.first_name, ' ', u_dest.last_name) AS destinataire_nom
       FROM messages m
       JOIN utilisateurs u_exp  ON m.expediteur_id   = u_exp.id
       JOIN utilisateurs u_dest ON m.destinataire_id = u_dest.id
       WHERE ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      messages: rows.map((row) => this.mapRowToMessage(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retourne la boîte d'envoi paginée d'un utilisateur
   */
  async getSent(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedMessages> {
    // Compter le total
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM messages m
       WHERE m.expediteur_id = ?`,
      [userId],
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query<MessageRow[]>(
      `SELECT
         m.id,
         m.expediteur_id,
         m.destinataire_id,
         m.sujet,
         m.contenu,
         m.lu,
         m.date_lecture,
         m.envoye_par_email,
         m.broadcast_id,
         m.created_at,
         CONCAT(u_exp.first_name, ' ', u_exp.last_name)  AS expediteur_nom,
         u_exp.userId                                     AS expediteur_userId,
         CONCAT(u_dest.first_name, ' ', u_dest.last_name) AS destinataire_nom
       FROM messages m
       JOIN utilisateurs u_exp  ON m.expediteur_id   = u_exp.id
       JOIN utilisateurs u_dest ON m.destinataire_id = u_dest.id
       WHERE m.expediteur_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    return {
      messages: rows.map((row) => this.mapRowToMessage(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retourne un message par son ID, uniquement si l'utilisateur est expéditeur ou destinataire
   */
  async getById(
    messageId: number,
    userId: number,
  ): Promise<MessageWithDetails | null> {
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT
         m.id,
         m.expediteur_id,
         m.destinataire_id,
         m.sujet,
         m.contenu,
         m.lu,
         m.date_lecture,
         m.envoye_par_email,
         m.broadcast_id,
         m.created_at,
         CONCAT(u_exp.first_name, ' ', u_exp.last_name)  AS expediteur_nom,
         u_exp.userId                                     AS expediteur_userId,
         CONCAT(u_dest.first_name, ' ', u_dest.last_name) AS destinataire_nom
       FROM messages m
       JOIN utilisateurs u_exp  ON m.expediteur_id   = u_exp.id
       JOIN utilisateurs u_dest ON m.destinataire_id = u_dest.id
       WHERE m.id = ?
         AND (m.expediteur_id = ? OR m.destinataire_id = ?)
       LIMIT 1`,
      [messageId, userId, userId],
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToMessage(rows[0]!);
  }

  /**
   * Marque un message comme lu (destinataire uniquement)
   */
  async markAsRead(messageId: number, userId: number): Promise<void> {
    await pool.query(
      `UPDATE messages
       SET lu = TRUE, date_lecture = NOW()
       WHERE id = ? AND destinataire_id = ?`,
      [messageId, userId],
    );
  }

  /**
   * Supprime définitivement un message pour le destinataire
   * (l'expéditeur conserve son exemplaire dans la boîte d'envoi)
   */
  async deleteForUser(messageId: number, userId: number): Promise<void> {
    await pool.query(
      `DELETE FROM messages
       WHERE id = ? AND destinataire_id = ?`,
      [messageId, userId],
    );
  }

  /**
   * Compte les messages non lus pour un utilisateur
   */
  async getUnreadCount(userId: number): Promise<number> {
    const [rows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM messages
       WHERE destinataire_id = ? AND lu = FALSE`,
      [userId],
    );

    return rows[0]?.total ?? 0;
  }

  /**
   * Retourne les destinataires éligibles à un broadcast
   * cible = 'tous'                       → tous les utilisateurs actifs non supprimés
   * cible = 'admin'|'professor'|'member' → filtre par role_app
   */
  async getRecipientsForBroadcast(cible: string): Promise<RecipientInfo[]> {
    let rows: RecipientRow[];

    if (cible === "tous") {
      [rows] = await pool.query<RecipientRow[]>(
        `SELECT id, email, first_name, last_name
         FROM utilisateurs
         WHERE deleted_at IS NULL
           AND anonymized = FALSE
           AND active     = TRUE
           AND email IS NOT NULL
           AND email != ''`,
      );
    } else {
      [rows] = await pool.query<RecipientRow[]>(
        `SELECT id, email, first_name, last_name
         FROM utilisateurs
         WHERE deleted_at IS NULL
           AND anonymized = FALSE
           AND active     = TRUE
           AND role_app   = ?
           AND email IS NOT NULL
           AND email != ''`,
        [cible],
      );
    }

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
    }));
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL en objet MessageWithDetails typé
   */
  private mapRowToMessage(row: MessageRow): MessageWithDetails {
    return {
      id: row.id,
      expediteur_id: row.expediteur_id,
      expediteur_nom: row.expediteur_nom,
      expediteur_userId: row.expediteur_userId,
      destinataire_id: row.destinataire_id,
      destinataire_nom: row.destinataire_nom,
      sujet: row.sujet,
      contenu: row.contenu,
      lu: Boolean(row.lu),
      date_lecture: row.date_lecture ? new Date(row.date_lecture) : null,
      envoye_par_email: Boolean(row.envoye_par_email),
      broadcast_id: row.broadcast_id,
      created_at: new Date(row.created_at),
    };
  }
}
