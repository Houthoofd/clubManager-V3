import { RevokeInvitationUseCase } from "../RevokeInvitationUseCase.js";
import type { IInvitationRepository } from "../../../domain/repositories/IInvitationRepository.js";

describe("RevokeInvitationUseCase", () => {
  let useCase: RevokeInvitationUseCase;
  let mockRepo: jest.Mocked<IInvitationRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      revoke: jest.fn(),
    } as any;
    useCase = new RevokeInvitationUseCase(mockRepo);
  });

  it("should successfully revoke an invitation", async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, status: "pending" } as any);

    await useCase.execute({ id: 1 });

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.revoke).toHaveBeenCalledWith(1);
  });

  it("should throw error if invitation is not found", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 1 })).rejects.toThrow("Invitation introuvable.");
  });

  it("should throw error if invitation is not pending", async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, status: "used" } as any);

    await expect(useCase.execute({ id: 1 })).rejects.toThrow("Impossible de révoquer une invitation déjà utilisée ou révoquée.");
  });
});
