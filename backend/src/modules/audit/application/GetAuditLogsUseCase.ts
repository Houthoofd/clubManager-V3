import { IAuditLogRepository, AuditLogFilters } from "../domain/IAuditLogRepository.js";
import { AuditLog } from "../domain/AuditLog.js";

export class GetAuditLogsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(filters?: AuditLogFilters): Promise<AuditLog[]> {
    return this.auditLogRepository.findAll(filters);
  }
}
