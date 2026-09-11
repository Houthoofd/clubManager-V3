import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { AuditLog } from "../domain/AuditLog.js";
import { IAuditLogRepository, AuditLogFilters } from "../domain/IAuditLogRepository.js";

export class MySQLAuditLogRepository implements IAuditLogRepository {
  async create(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const id = uuidv4();
    const query = `
      INSERT INTO audit_logs (
        id, club_id, user_id, action, entity_type, entity_id, metadata, severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      log.club_id ?? null,
      log.user_id ?? null,
      log.action,
      log.entity_type ?? null,
      log.entity_id ?? null,
      log.metadata ? JSON.stringify(log.metadata) : null,
      log.severity ?? "info"
    ];

    await pool.execute<ResultSetHeader>(query, params);

    // Return the newly created log (fetch from DB to get created_at)
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM audit_logs WHERE id = ?",
      [id]
    );
    const row = rows[0];
    return {
      id: row.id,
      club_id: row.club_id,
      user_id: row.user_id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      metadata: row.metadata,
      severity: row.severity,
      created_at: row.created_at
    };
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    let query = "SELECT * FROM audit_logs WHERE 1=1";
    const params: any[] = [];

    if (filters?.severity) {
      query += " AND severity = ?";
      params.push(filters.severity);
    }
    if (filters?.action) {
      query += " AND action = ?";
      params.push(filters.action);
    }
    if (filters?.club_id) {
      query += " AND club_id = ?";
      params.push(filters.club_id);
    }
    if (filters?.date_from) {
      query += " AND created_at >= ?";
      params.push(filters.date_from);
    }
    if (filters?.date_to) {
      query += " AND created_at <= ?";
      params.push(filters.date_to);
    }

    query += " ORDER BY created_at DESC";

    if (filters?.limit) {
      query += " LIMIT ?";
      params.push(Number(filters.limit));
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as AuditLog[];
  }
}
