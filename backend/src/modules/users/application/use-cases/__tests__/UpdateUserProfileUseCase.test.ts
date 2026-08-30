import { UpdateUserProfileUseCase } from "../UpdateUserProfileUseCase.js";
import type { IUserRepository, UpdateUserProfileDto } from "../../../domain/repositories/IUserRepository.js";

describe("UpdateUserProfileUseCase", () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let useCase: UpdateUserProfileUseCase;

  beforeEach(() => {
    mockRepo = {
      updateProfile: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new UpdateUserProfileUseCase(mockRepo);
  });

  it("should throw an error if requester is not target and not admin", async () => {
    await expect(
      useCase.execute(1, 2, "user", {})
    ).rejects.toThrow("Accès refusé : vous ne pouvez modifier que votre propre profil");
  });

  it("should throw an error if first_name is less than 2 characters", async () => {
    await expect(
      useCase.execute(1, 1, "user", { first_name: " a " })
    ).rejects.toThrow("Le prénom doit contenir au moins 2 caractères");
  });

  it("should throw an error if last_name is less than 2 characters", async () => {
    await expect(
      useCase.execute(1, 1, "user", { last_name: " b " })
    ).rejects.toThrow("Le nom doit contenir au moins 2 caractères");
  });

  it("should sanitize fields and update profile successfully for same user", async () => {
    const input: UpdateUserProfileDto = {
      first_name: " John ",
      last_name: " Doe ",
      telephone: " 123 ",
      adresse: " street "
    };
    mockRepo.updateProfile.mockResolvedValue({ id: 1 } as any);

    const result = await useCase.execute(1, 1, "user", input);

    expect(mockRepo.updateProfile).toHaveBeenCalledWith(1, {
      first_name: "John",
      last_name: "Doe",
      telephone: "123",
      adresse: "street"
    });
    expect(result).toEqual({ id: 1 });
  });

  it("should sanitize fields turning empty to null and keeping undefined", async () => {
    const input: UpdateUserProfileDto = {
      first_name: undefined,
      last_name: "Doe",
      telephone: "  ",
      adresse: ""
    };
    mockRepo.updateProfile.mockResolvedValue({ id: 2 } as any);

    await useCase.execute(2, 1, "admin", input); // admin can change other profile

    expect(mockRepo.updateProfile).toHaveBeenCalledWith(2, {
      first_name: undefined,
      last_name: "Doe",
      telephone: null,
      adresse: null
    });
  });
});
