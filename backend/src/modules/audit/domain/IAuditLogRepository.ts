import { AuditLog } from './AuditLog.js';

export interface AuditLogFilters {
  severity?: string;
  action?: string;
  limit?: number;
  club_id?: number;
  date_from?: Date;
  date_to?: Date;
}

export interface IAuditLogRepository {
  create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog>;
  findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;
}
