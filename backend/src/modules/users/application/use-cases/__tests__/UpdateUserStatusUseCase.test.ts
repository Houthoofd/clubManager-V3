import { UpdateUserStatusUseCase } from "../UpdateUserStatusUseCase.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

describe("UpdateUserStatusUseCase", () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let useCase: UpdateUserStatusUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new UpdateUserStatusUseCase(mockRepo);
  });

  it("should throw an error if target is requester", async () => {
    await expect(
      useCase.execute(1, 2, 1)
    ).rejects.toThrow("Vous ne pouvez pas modifier votre propre statut");
  });

  it("should throw an error if target user is not found", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute(2, 2, 1)
    ).rejects.toThrow("Utilisateur introuvable");
  });

  it("should update status successfully", async () => {
    mockRepo.findById.mockResolvedValue({ id: 2 } as any);
    mockRepo.updateStatus.mockResolvedValue();

    await useCase.execute(2, 3, 1);

    expect(mockRepo.findById).toHaveBeenCalledWith(2);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith(2, 3);
  });
});
