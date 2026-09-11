import { IAuditLogRepository } from "../domain/IAuditLogRepository.js";
import { AuditLog } from "../domain/AuditLog.js";

export class LogActionUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(params: {
    action: string;
    club_id?: number | null;
    user_id?: number | null;
    entity_type?: string | null;
    entity_id?: string | null;
    metadata?: any;
    severity?: 'info' | 'warning' | 'critical';
  }): Promise<AuditLog> {
    return this.auditLogRepository.create({
      action: params.action,
      club_id: params.club_id,
      user_id: params.user_id,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      metadata: params.metadata,
      severity: params.severity || 'info',
    });
  }
}
