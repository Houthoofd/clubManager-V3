import { Request, Response, NextFunction } from "express";
import { GetAuditLogsUseCase } from "../application/GetAuditLogsUseCase.js";
import { MySQLAuditLogRepository } from "../infrastructure/MySQLAuditLogRepository.js";

// Dependency Injection manually for controller
const repository = new MySQLAuditLogRepository();
const getAuditLogsUseCase = new GetAuditLogsUseCase(repository);

export class AuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        severity: req.query.severity as string,
        action: req.query.action as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        club_id: req.query.club_id ? parseInt(req.query.club_id as string, 10) : undefined,
        date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
        date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
      };

      const logs = await getAuditLogsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
