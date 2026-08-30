
import { VerifyEmailUseCase } from "../VerifyEmailUseCase.js";

describe("VerifyEmailUseCase", () => {
  let useCase: VerifyEmailUseCase;
  let authRepositoryMock: any;

  beforeEach(() => {
    authRepositoryMock = {
      validateEmailVerificationToken: jest.fn(),
      markEmailAsVerified: jest.fn(),
    };

    useCase = new VerifyEmailUseCase(authRepositoryMock);
  });

  describe("Validation", () => {
    it("should throw error if token is missing", async () => {
      await expect(useCase.execute({ token: "" })).rejects.toThrow("Verification token is required");
      await expect(useCase.execute({ token: "   " })).rejects.toThrow("Verification token is required");
    });

    it("should throw error if token is too long", async () => {
      const longToken = "a".repeat(501);
      await expect(useCase.execute({ token: longToken })).rejects.toThrow("Invalid verification token");
    });
  });

  describe("Execution", () => {
    const validInput = { token: "valid-token" };

    it("should throw error if token is invalid or expired", async () => {
      authRepositoryMock.validateEmailVerificationToken.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow("Invalid or expired verification token. Please request a new verification email.");
    });

    it("should mark email as verified and return success if token is valid", async () => {
      authRepositoryMock.validateEmailVerificationToken.mockResolvedValue("user-id");

      const result = await useCase.execute(validInput);

      expect(authRepositoryMock.validateEmailVerificationToken).toHaveBeenCalledWith("valid-token");
      expect(authRepositoryMock.markEmailAsVerified).toHaveBeenCalledWith("user-id");
      expect(result.success).toBe(true);
      expect(result.message).toBe("Email verified successfully. You can now log in.");
    });
  });
});
