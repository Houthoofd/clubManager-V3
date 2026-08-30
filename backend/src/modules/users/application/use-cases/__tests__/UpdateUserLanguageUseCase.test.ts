import { UpdateUserLanguageUseCase } from "../UpdateUserLanguageUseCase.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

describe("UpdateUserLanguageUseCase", () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let useCase: UpdateUserLanguageUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      updateLanguage: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new UpdateUserLanguageUseCase(mockRepo);
  });

  it("should throw an error if language is not allowed", async () => {
    await expect(
      useCase.execute({ userId: 1, langue_preferee: "it" })
    ).rejects.toThrow("Langue non autorisée. Valeurs acceptées : fr, en, nl, de, es");
  });

  it("should throw an error if user is not found", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: 1, langue_preferee: "fr" })
    ).rejects.toThrow("Utilisateur introuvable");
  });

  it("should update the user language successfully", async () => {
    mockRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockRepo.updateLanguage.mockResolvedValue();

    await useCase.execute({ userId: 1, langue_preferee: "en" });

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.updateLanguage).toHaveBeenCalledWith(1, "en");
  });
});
