import { UpdateUserRoleUseCase } from "../UpdateUserRoleUseCase.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { UserRole } from "@clubmanager/types";

describe("UpdateUserRoleUseCase", () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let useCase: UpdateUserRoleUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      updateRole: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new UpdateUserRoleUseCase(mockRepo);
  });

  it("should throw an error if target is requester", async () => {
    await expect(
      useCase.execute(1, UserRole.ADMIN, 1)
    ).rejects.toThrow("Vous ne pouvez pas modifier votre propre rôle");
  });

  it("should throw an error if role is invalid", async () => {
    await expect(
      useCase.execute(2, "superadmin", 1)
    ).rejects.toThrow("Rôle invalide: superadmin");
  });

  it("should throw an error if target user is not found", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute(2, UserRole.ADMIN, 1)
    ).rejects.toThrow("Utilisateur introuvable");
  });

  it("should update role successfully", async () => {
    mockRepo.findById.mockResolvedValue({ id: 2 } as any);
    mockRepo.updateRole.mockResolvedValue();

    await useCase.execute(2, UserRole.ADMIN, 1);

    expect(mockRepo.findById).toHaveBeenCalledWith(2);
    expect(mockRepo.updateRole).toHaveBeenCalledWith(2, UserRole.ADMIN);
  });
});
