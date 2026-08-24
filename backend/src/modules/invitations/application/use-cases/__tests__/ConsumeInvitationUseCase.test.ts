import crypto from "crypto";
import { ConsumeInvitationUseCase } from "../ConsumeInvitationUseCase.js";
import type { IInvitationRepository } from "../../../domain/repositories/IInvitationRepository.js";

describe("ConsumeInvitationUseCase", () => {
  let useCase: ConsumeInvitationUseCase;
  let mockRepo: jest.Mocked<IInvitationRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTokenHash: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      markAsUsed: jest.fn(),
      revoke: jest.fn(),
    } as any;
    useCase = new ConsumeInvitationUseCase(mockRepo);
  });

  it("should successfully mark invitation as used", async () => {
    const token = "valid-token";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    mockRepo.findByTokenHash.mockResolvedValue({
      id: 1,
      status: "pending",
      expires_at: new Date(Date.now() + 100000),
    } as any);

    await useCase.execute({ token });

    expect(mockRepo.findByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(mockRepo.markAsUsed).toHaveBeenCalledWith(1);
  });

  it("should throw error if invitation is not found", async () => {
    mockRepo.findByTokenHash.mockResolvedValue(null);

    await expect(useCase.execute({ token: "invalid" })).rejects.toThrow("Invitation introuvable.");
  });

  it("should throw error if invitation is not pending", async () => {
    mockRepo.findByTokenHash.mockResolvedValue({
      id: 1,
      status: "used",
      expires_at: new Date(Date.now() + 100000),
    } as any);

    await expect(useCase.execute({ token: "used-token" })).rejects.toThrow("Cette invitation a déjà été utilisée ou révoquée.");
  });

  it("should throw error if invitation is expired", async () => {
    mockRepo.findByTokenHash.mockResolvedValue({
      id: 1,
      status: "pending",
      expires_at: new Date(Date.now() - 100000), // past
    } as any);

    await expect(useCase.execute({ token: "expired-token" })).rejects.toThrow("Cette invitation a expiré.");
  });
});
