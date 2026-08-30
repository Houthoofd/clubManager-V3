import { pool } from "@/core/database/connection.js";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { UserRequest, UserRequestRow } from "../../domain/UserRequest.js";
import { IUserRequestRepository, CreateUserRequestDto } from "../../domain/repositories/IUserRequestRepository.js";

interface MySQLUserRequestRow extends RowDataPacket, UserRequestRow {}

export class MySQLUserRequestRepository implements IUserRequestRepository {
  async create(data: CreateUserRequestDto): Promise<UserRequest> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO user_requests (user_id, type, message, status, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
      [data.user_id, data.type, data.message || null]
    );

    return (await this.findById(result.insertId))!;
  }

  async findByUserId(user_id: number): Promise<UserRequest[]> {
    const [rows] = await pool.execute<MySQLUserRequestRow[]>(
      `SELECT * FROM user_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    return rows.map(UserRequest.fromRow);
  }

  async findPending(): Promise<UserRequest[]> {
    const [rows] = await pool.execute<MySQLUserRequestRow[]>(
      `SELECT * FROM user_requests WHERE status = 'pending' ORDER BY created_at DESC`
    );
    return rows.map(UserRequest.fromRow);
  }

  async findAll(): Promise<UserRequest[]> {
    const [rows] = await pool.execute<MySQLUserRequestRow[]>(
      `SELECT * FROM user_requests ORDER BY created_at DESC`
    );
    return rows.map(UserRequest.fromRow);
  }

  async findById(id: number): Promise<UserRequest | null> {
    const [rows] = await pool.execute<MySQLUserRequestRow[]>(
      `SELECT * FROM user_requests WHERE id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return UserRequest.fromRow(rows[0] as MySQLUserRequestRow);
  }

  async updateStatus(id: number, status: 'approved' | 'rejected', admin_comment?: string): Promise<UserRequest> {
    await pool.execute(
      `UPDATE user_requests SET status = ?, admin_comment = ?, updated_at = NOW() WHERE id = ?`,
      [status, admin_comment || null, id]
    );
    return (await this.findById(id))!;
  }
}
