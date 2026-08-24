import type { Request, Response } from "express";
import { InvitationController } from "../InvitationController.js";
import { SendInvitationUseCase } from "../../../application/use-cases/SendInvitationUseCase.js";
import { ValidateInvitationUseCase } from "../../../application/use-cases/ValidateInvitationUseCase.js";
import { GetInvitationsUseCase } from "../../../application/use-cases/GetInvitationsUseCase.js";
import { RevokeInvitationUseCase } from "../../../application/use-cases/RevokeInvitationUseCase.js";
import { EmailService } from "@/modules/auth/application/services/EmailService.js";

jest.mock("../../../infrastructure/repositories/MySQLInvitationRepository.js");
jest.mock("../../../application/use-cases/SendInvitationUseCase.js");
jest.mock("../../../application/use-cases/ValidateInvitationUseCase.js");
jest.mock("../../../application/use-cases/GetInvitationsUseCase.js");
jest.mock("../../../application/use-cases/RevokeInvitationUseCase.js");
jest.mock("@/modules/auth/application/services/EmailService.js");

describe("InvitationController", () => {
  let controller: InvitationController;
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new InvitationController();
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { userId: 1, email: "admin@example.com" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("sendInvitation", () => {
    it("should successfully send an invitation", async () => {
      mockReq.body = { email: "test@example.com" };
      const mockResult = {
        token: "token123",
        invitation: {
          id: 1,
          email: "test@example.com",
          expires_at: new Date("2024-01-08"),
          status: "pending",
          invited_by_name: "Admin User",
        },
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: true });

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(SendInvitationUseCase.prototype.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        invited_by: 1,
      });
      expect(EmailService.prototype.sendInvitationEmail).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("should use user email if invited_by_name is missing", async () => {
      mockReq.body = { email: "test@example.com" };
      const mockResult = {
        token: "token123",
        invitation: {
          id: 1,
          email: "test@example.com",
          expires_at: new Date("2024-01-08"),
          status: "pending",
        },
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: true });

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(EmailService.prototype.sendInvitationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "admin@example.com",
        expect.any(String),
        expect.any(Date)
      );
    });

    it("should handle email service failure gracefully in dev", async () => {
      mockReq.body = { email: "test@example.com" };
      const mockResult = {
        token: "token123",
        invitation: { id: 1, email: "test@example.com", expires_at: new Date(), status: "pending" },
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: false });
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[InvitationController][DEV]"));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should return 400 for invalid email", async () => {
      mockReq.body = { email: "invalid" };
      await controller.sendInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Email invalide." });
    });

    it("should use FRONTEND_URL if provided", async () => {
      const originalEnv = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = "http://my-frontend.com";
      mockReq.body = { email: "test@example.com" };
      const mockResult = {
        token: "token123",
        invitation: { id: 1, email: "test@example.com", expires_at: new Date(), status: "pending", invited_by_name: "Admin User" },
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: true });

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(EmailService.prototype.sendInvitationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Admin User",
        "http://my-frontend.com/register?token=token123",
        expect.any(Date)
      );
      if (originalEnv === undefined) {
        delete process.env.FRONTEND_URL;
      } else {
        process.env.FRONTEND_URL = originalEnv;
      }
    });

    it("should fallback to localhost if FRONTEND_URL is undefined", async () => {
      const originalEnv = process.env.FRONTEND_URL;
      delete process.env.FRONTEND_URL;
      mockReq.body = { email: "test@example.com" };
      const mockResult = {
        token: "token123",
        invitation: { id: 1, email: "test@example.com", expires_at: new Date(), status: "pending", invited_by_name: "Admin User" },
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: true });

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(EmailService.prototype.sendInvitationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Admin User",
        "http://localhost:5173/register?token=token123",
        expect.any(Date)
      );

      if (originalEnv !== undefined) {
        process.env.FRONTEND_URL = originalEnv;
      }
    });

    it("should fallback to L'administrateur if user and invited_by_name are missing", async () => {
      mockReq.body = { email: "test@example.com" };
      mockReq.user = { userId: 1 } as any; // mockReq.user.email will be undefined
      const mockResult = {
        token: "token123",
        invitation: { id: 1, email: "test@example.com", expires_at: new Date(), status: "pending" }, // missing invited_by_name
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: true });

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(EmailService.prototype.sendInvitationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "L'administrateur",
        expect.any(String),
        expect.any(Date)
      );
    });

    it("should hide dev details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      mockReq.body = { email: "test@example.com" };
      const mockResult = {
        token: "token123",
        invitation: { id: 1, email: "test@example.com", expires_at: new Date(), status: "pending" },
      };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);
      (EmailService.prototype.sendInvitationEmail as jest.Mock).mockResolvedValue({ success: false });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await controller.sendInvitation(mockReq as any, mockRes as any);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      
      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.data).not.toHaveProperty("_dev_registration_url");

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should return 400 if email is missing or not a string", async () => {
      mockReq.body = {};
      await controller.sendInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      mockReq.body = { email: 123 };
      await controller.sendInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 409 if invitation already pending", async () => {
      mockReq.body = { email: "test@example.com" };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Une invitation est déjà en attente pour cet email."));
      await controller.sendInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it("should return 500 on other errors", async () => {
      mockReq.body = { email: "test@example.com" };
      (SendInvitationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Some error"));
      await controller.sendInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("validateToken", () => {
    it("should return valid result for valid token", async () => {
      mockReq.query = { token: "token123" };
      (ValidateInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue({ valid: true, email: "test@example.com" });

      await controller.validateToken(mockReq as any, mockRes as any);

      expect(ValidateInvitationUseCase.prototype.execute).toHaveBeenCalledWith({ token: "token123" });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { valid: true, email: "test@example.com" } });
    });

    it("should return 400 for missing token", async () => {
      await controller.validateToken(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Token manquant." });
    });

    it("should return 500 on error", async () => {
      mockReq.query = { token: "token123" };
      (ValidateInvitationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Some error"));
      await controller.validateToken(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getInvitations", () => {
    it("should return paginated invitations", async () => {
      mockReq.query = { page: "2", limit: "5" };
      const mockResult = { data: [], total: 0 };
      (GetInvitationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getInvitations(mockReq as any, mockRes as any);

      expect(GetInvitationsUseCase.prototype.execute).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it("should use default pagination", async () => {
      const mockResult = { data: [], total: 0 };
      (GetInvitationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getInvitations(mockReq as any, mockRes as any);

      expect(GetInvitationsUseCase.prototype.execute).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it("should return 500 on error", async () => {
      (GetInvitationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Some error"));
      await controller.getInvitations(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("revokeInvitation", () => {
    it("should revoke invitation successfully", async () => {
      mockReq.params = { id: "1" };
      (RevokeInvitationUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.revokeInvitation(mockReq as any, mockRes as any);

      expect(RevokeInvitationUseCase.prototype.execute).toHaveBeenCalledWith({ id: 1 });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: "Invitation révoquée." });
    });

    it("should return 400 for invalid id", async () => {
      mockReq.params = { id: "invalid" };
      await controller.revokeInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      mockReq.params = { id: "0" };
      await controller.revokeInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      
      mockReq.params = { id: "-1" };
      await controller.revokeInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if invitation not found", async () => {
      mockReq.params = { id: "1" };
      (RevokeInvitationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Invitation introuvable."));
      await controller.revokeInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 409 if invitation cannot be revoked", async () => {
      mockReq.params = { id: "1" };
      (RevokeInvitationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Impossible de révoquer une invitation déjà utilisée ou révoquée."));
      await controller.revokeInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it("should return 500 on other errors", async () => {
      mockReq.params = { id: "1" };
      (RevokeInvitationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error("Other error"));
      await controller.revokeInvitation(mockReq as any, mockRes as any);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
