/**
 * MySQLNotificationRepository
 * Implémentation MySQL du repository notifications (Infrastructure Layer)
 * Gère les opérations CRUD sur la table notifications
 */

import { pool } from '@/core/database/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { NotificationDto, CreateNotificationDto, NotificationKind } from '../../domain/types.js';

// ==================== DB ROW INTERFACE ====================

interface NotificationDbRow extends RowDataPacket {
  id: number;
  user_id: number;
  type: NotificationKind;
  titre: string;
  contenu: string;
  lu: number | boolean; // MySQL BOOLEAN returns 0/1
  created_at: Date | string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== REPOSITORY ====================

export class MySQLNotificationRepository implements INotificationRepository {
  /**
   * Récupère les notifications d'un utilisateur, triées par date décroissante
   * Filtre optionnel sur les non-lues uniquement
   */
  async findByUserId(userId: number, onlyUnread?: boolean): Promise<NotificationDto[]> {
    const sql = onlyUnread
      ? `SELECT * FROM notifications WHERE user_id = ? AND lu = FALSE ORDER BY created_at DESC LIMIT 50`
      : `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`;

    const [rows] = await pool.query<NotificationDbRow[]>(sql, [userId]);

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Retourne le nombre de notifications non lues pour un utilisateur
   */
  async getUnreadCount(userId: number): Promise<number> {
    const [rows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND lu = FALSE`,
      [userId],
    );

    return rows[0]?.total ?? 0;
  }

  /**
   * Marque une notification spécifique comme lue
   * La clause user_id garantit qu'un utilisateur ne peut marquer que ses propres notifications
   */
  async markAsRead(id: number, userId: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE notifications SET lu = TRUE WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
  }

  /**
   * Marque toutes les notifications non lues d'un utilisateur comme lues
   */
  async markAllAsRead(userId: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE notifications SET lu = TRUE WHERE user_id = ? AND lu = FALSE`,
      [userId],
    );
  }

  /**
   * Crée une nouvelle notification et retourne l'objet complet créé
   */
  async create(data: CreateNotificationDto): Promise<NotificationDto> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO notifications (user_id, type, titre, contenu) VALUES (?, ?, ?, ?)`,
      [data.user_id, data.type, data.titre, data.contenu],
    );

    const insertId = result.insertId;

    const [rows] = await pool.query<NotificationDbRow[]>(
      `SELECT * FROM notifications WHERE id = ? LIMIT 1`,
      [insertId],
    );

    if (rows.length === 0) {
      throw new Error(`Failed to retrieve notification after insert (id: ${insertId})`);
    }

    return this.mapRow(rows[0]!);
  }

  /**
   * Supprime les notifications plus anciennes que N jours
   * Retourne le nombre de lignes supprimées
   */
  async deleteOld(olderThanDays: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [olderThanDays],
    );

    return result.affectedRows;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en NotificationDto typé
   * - lu: MySQL BOOLEAN retourne 0/1, on force en boolean
   * - created_at: converti en ISO string
   */
  private mapRow(row: NotificationDbRow): NotificationDto {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      titre: row.titre,
      contenu: row.contenu,
      lu: Boolean(row.lu),
      created_at: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    };
  }
}
