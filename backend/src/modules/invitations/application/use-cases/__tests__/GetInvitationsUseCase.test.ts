import { GetInvitationsUseCase } from "../GetInvitationsUseCase.js";
import type { IInvitationRepository } from "../../../domain/repositories/IInvitationRepository.js";

describe("GetInvitationsUseCase", () => {
  let useCase: GetInvitationsUseCase;
  let mockRepo: jest.Mocked<IInvitationRepository>;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
    } as any;
    useCase = new GetInvitationsUseCase(mockRepo);
  });

  it("should return paginated invitations", async () => {
    const mockData = [{ id: 1, email: "test@example.com" }];
    const mockTotal = 1;
    mockRepo.findAll.mockResolvedValue({ data: mockData as any, total: mockTotal });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(mockRepo.findAll).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual({ data: mockData, total: mockTotal });
  });
});
