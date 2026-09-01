import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { Event, EventRegistration, CreateEventDto, UpdateEventDto, RegisterToEventDto } from "@clubmanager/types";
import type { IEventRepository } from "../../domain/repositories/IEventRepository.js";

interface EventRow extends RowDataPacket, Event {}
interface EventRegistrationRow extends RowDataPacket, EventRegistration {}

export class MySQLEventRepository implements IEventRepository {
  async createEvent(data: CreateEventDto): Promise<Event> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO events (title, description, location, start_date, end_date, capacity, price, visibility, min_grade_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description || null,
        data.location || null,
        data.start_date,
        data.end_date,
        data.capacity || null,
        data.price || 0.00,
        data.visibility || 'MEMBERS_ONLY',
        data.min_grade_id || null,
        data.image_url || null
      ]
    );

    return this.getEventById(result.insertId) as Promise<Event>;
  }

  async getEventById(id: number): Promise<Event | null> {
    const [rows] = await pool.execute<EventRow[]>("SELECT * FROM events WHERE id = ? AND deleted_at IS NULL", [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async listEvents(filters?: { from_date?: Date; to_date?: Date; visibility?: string }): Promise<Event[]> {
    let query = "SELECT * FROM events WHERE deleted_at IS NULL";
    const params: any[] = [];

    if (filters?.from_date) {
      query += " AND start_date >= ?";
      params.push(filters.from_date);
    }
    if (filters?.to_date) {
      query += " AND start_date <= ?";
      params.push(filters.to_date);
    }
    if (filters?.visibility) {
      query += " AND visibility = ?";
      params.push(filters.visibility);
    }

    query += " ORDER BY start_date ASC";
    const [rows] = await pool.execute<EventRow[]>(query, params);
    return rows;
  }

  async updateEvent(id: number, data: UpdateEventDto): Promise<Event> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.location !== undefined) {
      updates.push("location = ?");
      params.push(data.location);
    }
    if (data.start_date !== undefined) {
      updates.push("start_date = ?");
      params.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      updates.push("end_date = ?");
      params.push(data.end_date);
    }
    if (data.capacity !== undefined) {
      updates.push("capacity = ?");
      params.push(data.capacity);
    }
    if (data.price !== undefined) {
      updates.push("price = ?");
      params.push(data.price);
    }
    if (data.visibility !== undefined) {
      updates.push("visibility = ?");
      params.push(data.visibility);
    }
    if (data.min_grade_id !== undefined) {
      updates.push("min_grade_id = ?");
      params.push(data.min_grade_id);
    }
    if (data.image_url !== undefined) {
      updates.push("image_url = ?");
      params.push(data.image_url);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(`UPDATE events SET ${updates.join(", ")} WHERE id = ?`, params);
    }
    
    return this.getEventById(id) as Promise<Event>;
  }

  async registerToEvent(data: RegisterToEventDto & { price_paid?: number }): Promise<EventRegistration> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO event_registrations (event_id, user_id, status, payment_status, price_paid) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.event_id, 
        data.user_id, 
        data.status || 'CONFIRMED', 
        data.payment_status || 'PENDING',
        data.price_paid !== undefined ? data.price_paid : null
      ]
    );

    const [rows] = await pool.execute<EventRegistrationRow[]>(
      "SELECT * FROM event_registrations WHERE id = ?",
      [result.insertId]
    );

    return rows[0];
  }

  async getRegistrationById(id: number): Promise<EventRegistration | null> {
    const [rows] = await pool.execute<EventRegistrationRow[]>("SELECT * FROM event_registrations WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getRegistration(eventId: number, userId: number): Promise<EventRegistration | null> {
    const [rows] = await pool.execute<EventRegistrationRow[]>(
      "SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );
    return rows[0] || null;
  }

  async listRegistrations(eventId: number): Promise<EventRegistration[]> {
    const [rows] = await pool.execute<EventRegistrationRow[]>(
      "SELECT * FROM event_registrations WHERE event_id = ?",
      [eventId]
    );
    return rows;
  }

  async getUserGradeId(userId: number): Promise<number | null> {
    const [rows] = await pool.execute<any[]>(
      "SELECT grade_id FROM utilisateurs WHERE id = ?",
      [userId]
    );
    return rows.length > 0 ? rows[0].grade_id : null;
  }

  async getUserBasicInfo(userId: number): Promise<{ email: string; first_name: string } | null> {
    const [rows] = await pool.execute<any[]>(
      "SELECT email, first_name FROM utilisateurs WHERE id = ?",
      [userId]
    );
    return rows.length > 0 ? { email: rows[0].email, first_name: rows[0].first_name } : null;
  }

  async deleteEvent(id: number): Promise<void> {
    await pool.execute("UPDATE events SET deleted_at = NOW() WHERE id = ?", [id]);
  }

  async updateRegistrationStatus(registrationId: number, status: string, paymentStatus: string): Promise<void> {
    await pool.execute(
      "UPDATE event_registrations SET status = ?, payment_status = ? WHERE id = ?",
      [status, paymentStatus, registrationId]
    );
  }
}
