import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLUserRequestRepository } from "../../infrastructure/repositories/MySQLUserRequestRepository.js";
import { CreateUserRequestUseCase } from "../../application/use-cases/CreateUserRequestUseCase.js";
import { GetMyUserRequestsUseCase } from "../../application/use-cases/GetMyUserRequestsUseCase.js";
import { GetPendingUserRequestsUseCase } from "../../application/use-cases/GetPendingUserRequestsUseCase.js";
import { UpdateUserRequestStatusUseCase } from "../../application/use-cases/UpdateUserRequestStatusUseCase.js";

const repo = new MySQLUserRequestRepository();
const createRequestUC = new CreateUserRequestUseCase(repo);
const getMyRequestsUC = new GetMyUserRequestsUseCase(repo);
const getPendingRequestsUC = new GetPendingUserRequestsUseCase(repo);
const updateRequestStatusUC = new UpdateUserRequestStatusUseCase(repo);

export class UserRequestController {
  /**
   * POST /api/users/requests
   * Member creates a request
   */
  async createRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      
      const { type, message } = req.body;
      const result = await createRequestUC.execute({
        user_id: Number(req.user.userId),
        type,
        message
      });
      
      res.status(201).json({ success: true, message: "Request created", data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/users/requests/me
   * Member gets their history
   */
  async getMyRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      
      const result = await getMyRequestsUC.execute(Number(req.user.userId));
      res.json({ success: true, message: "My requests retrieved", data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/users/requests
   * Admin gets all requests
   */
  async getAllRequests(_req: AuthRequest, res: Response): Promise<void> {
    try {
      // Pass true to get all (not just pending)
      const result = await getPendingRequestsUC.execute(true);
      res.json({ success: true, message: "All requests retrieved", data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/users/requests/:requestId/status
   * Admin approves/rejects
   */
  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const requestId = Number(req.params.requestId);
      const { status, admin_comment } = req.body;
      
      const result = await updateRequestStatusUC.execute({
        request_id: requestId,
        status,
        admin_comment
      });
      
      res.json({ success: true, message: "Request updated", data: result });
    } catch (error: any) {
      const statusCode = error.message === "User request not found" ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}
