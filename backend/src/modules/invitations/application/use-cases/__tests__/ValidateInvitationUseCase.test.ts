import crypto from "crypto";
import { ValidateInvitationUseCase } from "../ValidateInvitationUseCase.js";
import type { IInvitationRepository } from "../../../domain/repositories/IInvitationRepository.js";

describe("ValidateInvitationUseCase", () => {
  let useCase: ValidateInvitationUseCase;
  let mockRepo: jest.Mocked<IInvitationRepository>;

  beforeEach(() => {
    mockRepo = {
      findByTokenHash: jest.fn(),
    } as any;
    useCase = new ValidateInvitationUseCase(mockRepo);
  });

  it("should successfully validate token", async () => {
    const token = "valid-token";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    mockRepo.findByTokenHash.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      status: "pending",
      expires_at: new Date(Date.now() + 100000),
    } as any);

    const result = await useCase.execute({ token });

    expect(mockRepo.findByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(result).toEqual({ valid: true, email: "test@example.com" });
  });

  it("should return invalid if invitation not found", async () => {
    mockRepo.findByTokenHash.mockResolvedValue(null);

    const result = await useCase.execute({ token: "invalid" });
    expect(result).toEqual({ valid: false, error: "Invitation introuvable." });
  });

  it("should return invalid if invitation is not pending", async () => {
    mockRepo.findByTokenHash.mockResolvedValue({
      id: 1,
      status: "used",
      expires_at: new Date(Date.now() + 100000),
    } as any);

    const result = await useCase.execute({ token: "used-token" });
    expect(result).toEqual({ valid: false, error: "Cette invitation a déjà été utilisée ou révoquée." });
  });

  it("should return invalid if invitation is expired", async () => {
    mockRepo.findByTokenHash.mockResolvedValue({
      id: 1,
      status: "pending",
      expires_at: new Date(Date.now() - 100000), // past
    } as any);

    const result = await useCase.execute({ token: "expired-token" });
    expect(result).toEqual({ valid: false, error: "Cette invitation a expiré." });
  });
});
