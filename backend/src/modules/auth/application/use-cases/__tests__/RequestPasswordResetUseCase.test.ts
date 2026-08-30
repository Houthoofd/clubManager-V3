
import { RequestPasswordResetUseCase } from "../RequestPasswordResetUseCase.js";
import { EmailService } from "../../services/EmailService.js";
import { TokenService } from "@/shared/services/TokenService.js";

jest.mock("../../services/EmailService.js");
jest.mock("@/shared/services/TokenService.js");

describe("RequestPasswordResetUseCase", () => {
  let useCase: RequestPasswordResetUseCase;
  let authRepositoryMock: any;
  let emailServiceMock: any;

  beforeEach(() => {
    authRepositoryMock = {
      findUserByEmail: jest.fn(),
      storePasswordResetToken: jest.fn(),
    };

    emailServiceMock = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    (EmailService as any).mockImplementation(() => emailServiceMock);

    jest.spyOn(TokenService, "generatePasswordResetToken").mockReturnValue({
      token: "reset-token-123",
      expiresAt: new Date(Date.now() + 3600000),
    });

    useCase = new RequestPasswordResetUseCase(authRepositoryMock);
  });

  describe("Validation", () => {
    it("should throw error if email is missing", async () => {
      await expect(useCase.execute({ email: "" })).rejects.toThrow("Email is required");
      await expect(useCase.execute({ email: "   " })).rejects.toThrow("Email is required");
    });

    it("should throw error if email format is invalid", async () => {
      await expect(useCase.execute({ email: "invalid-email" })).rejects.toThrow("Invalid email format");
    });

    it("should throw error if email is too long", async () => {
      const longEmail = "a".repeat(250) + "@test.com";
      await expect(useCase.execute({ email: longEmail })).rejects.toThrow("Email is too long (max 255 characters)");
    });
  });

  describe("Execution", () => {
    const validInput = { email: "test@example.com" };

    it("should return success without sending email if user not found (anti-enumeration)", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue(null);

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Si un compte existe");
      expect(emailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should return success without sending email if user is inactive", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        email: validInput.email,
        active: false,
      });

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Si un compte existe");
      expect(emailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should return success without sending email if user is deleted", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        email: validInput.email,
        active: true,
        deleted_at: new Date(),
      });

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Si un compte existe");
      expect(emailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should return success without sending email if user is anonymized", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        email: validInput.email,
        active: true,
        anonymized: true,
      });

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Si un compte existe");
      expect(emailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should send password reset email and return success for valid active user", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        email: validInput.email,
        first_name: "Test",
        active: true,
      });

      const result = await useCase.execute(validInput, "127.0.0.1", "Test-Agent");

      expect(authRepositoryMock.storePasswordResetToken).toHaveBeenCalledWith(
        "user-id",
        "reset-token-123",
        expect.any(Date)
      );
      expect(emailServiceMock.sendPasswordResetEmail).toHaveBeenCalledWith(
        validInput.email,
        "Test",
        expect.stringContaining("reset-token-123")
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain("If an account exists");
    });

    it("should throw error if email sending fails", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        email: validInput.email,
        first_name: "Test",
        active: true,
      });

      emailServiceMock.sendPasswordResetEmail.mockResolvedValue({
        success: false,
        error: new Error("SMTP error"),
      });

      await expect(useCase.execute(validInput)).rejects.toThrow("Failed to send password reset email. Please try again later.");
    });
  });
});
