import { SendInvitationUseCase } from "../SendInvitationUseCase.js";
import type { IInvitationRepository } from "../../../domain/repositories/IInvitationRepository.js";
import crypto from "crypto";

describe("SendInvitationUseCase", () => {
  let useCase: SendInvitationUseCase;
  let mockRepo: jest.Mocked<IInvitationRepository>;
  let randomBytesSpy: jest.SpyInstance;

  beforeEach(() => {
    randomBytesSpy = jest.spyOn(crypto, "randomBytes").mockReturnValue(Buffer.from("mocked-random-bytes") as any);
    mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    useCase = new SendInvitationUseCase(mockRepo);
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should successfully create and return an invitation with a token", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    const mockCreatedInvitation = { id: 1, email: "test@example.com" } as any;
    mockRepo.create.mockResolvedValue(mockCreatedInvitation);

    const result = await useCase.execute({ email: "test@example.com", invited_by: 1 });

    const expectedToken = Buffer.from("mocked-random-bytes").toString("hex");
    const expectedTokenHash = crypto.createHash("sha256").update(expectedToken).digest("hex");
    
    expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockRepo.create).toHaveBeenCalledWith({
      email: "test@example.com",
      invited_by: 1,
      token_hash: expectedTokenHash,
      expires_at: new Date("2024-01-08T00:00:00Z"), // +7 days
    });
    expect(result).toEqual({ token: expectedToken, invitation: mockCreatedInvitation });
  });

  it("should throw error if invitation is already pending for email", async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 1, email: "test@example.com" } as any);

    await expect(useCase.execute({ email: "test@example.com", invited_by: 1 })).rejects.toThrow("Une invitation est déjà en attente pour cet email.");
  });
});
