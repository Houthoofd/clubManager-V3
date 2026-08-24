
import { ResetPasswordUseCase } from "../ResetPasswordUseCase.js";
import { EmailService } from "../../services/EmailService.js";
import { PasswordService } from "@/shared/services/PasswordService.js";

jest.mock("../../services/EmailService.js");
jest.mock("@/shared/services/PasswordService.js");

describe("ResetPasswordUseCase", () => {
  let useCase: ResetPasswordUseCase;
  let authRepositoryMock: any;
  let emailServiceMock: any;

  beforeEach(() => {
    authRepositoryMock = {
      validatePasswordResetToken: jest.fn(),
      findUserById: jest.fn(),
      updatePassword: jest.fn(),
      deletePasswordResetToken: jest.fn(),
      deleteAllPasswordResetTokens: jest.fn(),
      deleteAllRefreshTokens: jest.fn(),
    };

    emailServiceMock = {
      sendPasswordChangedEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    (EmailService as any).mockImplementation(() => emailServiceMock);

    jest.spyOn(PasswordService, "validatePasswordStrength").mockReturnValue({
      isValid: true,
      errors: [],
    });
    jest.spyOn(PasswordService, "hash").mockResolvedValue("hashed-password");

    useCase = new ResetPasswordUseCase(authRepositoryMock);
  });

  describe("Validation", () => {
    it("should throw error if token is missing", async () => {
      const input = { token: "", newPassword: "Password123!", confirmPassword: "Password123!" };
      await expect(useCase.execute(input)).rejects.toThrow("Reset token is required");
      input.token = "   ";
      await expect(useCase.execute(input)).rejects.toThrow("Reset token is required");
    });

    it("should throw error if token is too long", async () => {
      const input = { token: "a".repeat(501), newPassword: "Password123!", confirmPassword: "Password123!" };
      await expect(useCase.execute(input)).rejects.toThrow("Invalid reset token");
    });

    it("should throw error if newPassword is missing", async () => {
      const input = { token: "token", newPassword: "", confirmPassword: "Password123!" };
      await expect(useCase.execute(input)).rejects.toThrow("New password is required");
    });

    it("should throw error if newPassword is too short", async () => {
      const input = { token: "token", newPassword: "short", confirmPassword: "short" };
      await expect(useCase.execute(input)).rejects.toThrow("Password must be at least 8 characters long");
    });

    it("should throw error if newPassword is too long", async () => {
      const longPass = "a".repeat(73);
      const input = { token: "token", newPassword: longPass, confirmPassword: longPass };
      await expect(useCase.execute(input)).rejects.toThrow("Password cannot exceed 72 characters");
    });

    it("should throw error if confirmPassword is missing", async () => {
      const input = { token: "token", newPassword: "Password123!", confirmPassword: "" };
      await expect(useCase.execute(input)).rejects.toThrow("Password confirmation is required");
    });

    it("should throw error if passwords do not match", async () => {
      const input = { token: "token", newPassword: "Password123!", confirmPassword: "Password321!" };
      await expect(useCase.execute(input)).rejects.toThrow("Passwords do not match");
    });
  });

  describe("Execution", () => {
    const validInput = {
      token: "valid-token",
      newPassword: "Password123!",
      confirmPassword: "Password123!",
    };

    it("should throw error if token is invalid or expired", async () => {
      authRepositoryMock.validatePasswordResetToken.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow("Invalid or expired password reset token");
    });

    it("should throw error if user is not found", async () => {
      authRepositoryMock.validatePasswordResetToken.mockResolvedValue("user-id");
      authRepositoryMock.findUserById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow("User not found");
    });

    it("should throw error if user is inactive, deleted, or anonymized", async () => {
      authRepositoryMock.validatePasswordResetToken.mockResolvedValue("user-id");
      
      authRepositoryMock.findUserById.mockResolvedValueOnce({ active: false });
      await expect(useCase.execute(validInput)).rejects.toThrow("Account is disabled or deleted");

      authRepositoryMock.findUserById.mockResolvedValueOnce({ active: true, deleted_at: new Date() });
      await expect(useCase.execute(validInput)).rejects.toThrow("Account is disabled or deleted");

      authRepositoryMock.findUserById.mockResolvedValueOnce({ active: true, anonymized: true });
      await expect(useCase.execute(validInput)).rejects.toThrow("Account is disabled or deleted");
    });

    it("should throw error if password strength validation fails", async () => {
      authRepositoryMock.validatePasswordResetToken.mockResolvedValue("user-id");
      authRepositoryMock.findUserById.mockResolvedValue({ active: true });
      
      jest.spyOn(PasswordService, "validatePasswordStrength").mockReturnValue({
        isValid: false,
        errors: ["Too weak"],
      });

      await expect(useCase.execute(validInput)).rejects.toThrow("Password validation failed: Too weak");
    });

    it("should update password, clear tokens and send email successfully", async () => {
      authRepositoryMock.validatePasswordResetToken.mockResolvedValue("user-id");
      authRepositoryMock.findUserById.mockResolvedValue({ 
        id: "user-id",
        email: "test@example.com",
        first_name: "Test",
        active: true 
      });

      const result = await useCase.execute(validInput);

      expect(authRepositoryMock.updatePassword).toHaveBeenCalledWith("user-id", "hashed-password");
      expect(authRepositoryMock.deletePasswordResetToken).toHaveBeenCalledWith("valid-token");
      expect(authRepositoryMock.deleteAllPasswordResetTokens).toHaveBeenCalledWith("user-id");
      expect(authRepositoryMock.deleteAllRefreshTokens).toHaveBeenCalledWith("user-id");
      
      expect(emailServiceMock.sendPasswordChangedEmail).toHaveBeenCalledWith("test@example.com", "Test");
      
      expect(result.success).toBe(true);
      expect(result.message).toContain("Password reset successfully");
    });

    it("should succeed even if sending email fails", async () => {
      authRepositoryMock.validatePasswordResetToken.mockResolvedValue("user-id");
      authRepositoryMock.findUserById.mockResolvedValue({ 
        id: "user-id",
        email: "test@example.com",
        first_name: "Test",
        active: true 
      });

      emailServiceMock.sendPasswordChangedEmail.mockResolvedValue({ success: false, error: "SMTP error" });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await useCase.execute(validInput);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Failed to send password changed confirmation email:", "SMTP error");

      consoleSpy.mockRestore();
    });
  });
});
