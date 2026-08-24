
import { ResendVerificationEmailUseCase } from "../ResendVerificationEmailUseCase.js";
import { EmailService } from "../../services/EmailService.js";
import { TokenService } from "@/shared/services/TokenService.js";

jest.mock("../../services/EmailService.js");
jest.mock("@/shared/services/TokenService.js");

describe("ResendVerificationEmailUseCase", () => {
  let useCase: ResendVerificationEmailUseCase;
  let authRepositoryMock: any;
  let emailServiceMock: any;

  beforeEach(() => {
    authRepositoryMock = {
      findUserByEmail: jest.fn(),
      storeEmailVerificationToken: jest.fn(),
    };

    emailServiceMock = {
      sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
    };

    (EmailService as any).mockImplementation(() => emailServiceMock);

    jest.spyOn(TokenService, "generateEmailVerificationToken").mockReturnValue({
      token: "verify-token-123",
      expiresAt: new Date(Date.now() + 3600000),
    });

    useCase = new ResendVerificationEmailUseCase(authRepositoryMock);
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
      expect(result.message).toContain("If an account exists");
      expect(emailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should throw error if email is already verified", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        email: validInput.email,
        email_verified: true,
      });

      await expect(useCase.execute(validInput)).rejects.toThrow("Email is already verified. You can log in.");
    });

    it("should send verification email and return success for valid unverified user", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        userId: "ext-user-id",
        email: validInput.email,
        first_name: "Test",
        email_verified: false,
      });

      const result = await useCase.execute(validInput);

      expect(authRepositoryMock.storeEmailVerificationToken).toHaveBeenCalledWith(
        "user-id",
        "verify-token-123",
        expect.any(Date),
        validInput.email
      );
      expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
        validInput.email,
        "Test",
        expect.stringContaining("verify-token-123"),
        "ext-user-id"
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain("Verification email sent successfully");
    });

    it("should throw error if email sending fails", async () => {
      authRepositoryMock.findUserByEmail.mockResolvedValue({
        id: "user-id",
        userId: "ext-user-id",
        email: validInput.email,
        first_name: "Test",
        email_verified: false,
      });

      emailServiceMock.sendVerificationEmail.mockResolvedValue({
        success: false,
        error: new Error("SMTP error"),
      });

      await expect(useCase.execute(validInput)).rejects.toThrow("Failed to send verification email. Please try again later.");
    });
  });
});
