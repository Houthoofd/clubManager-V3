import { GetAuthAttemptsUseCase } from '../../../../../../src/modules/auth/application/use-cases/GetAuthAttemptsUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';

describe('GetAuthAttemptsUseCase', () => {
  let useCase: GetAuthAttemptsUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      getAuthAttempts: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new GetAuthAttemptsUseCase(mockAuthRepository);
  });

  it('should return paginated auth attempts', async () => {
    const mockAttempts = [
      { id: 1, email: 'test@example.com', ip_address: '1.1.1.1', success: true, timestamp: new Date() }
    ];
    mockAuthRepository.getAuthAttempts.mockResolvedValue({ attempts: mockAttempts, total: 15 });

    const result = await useCase.execute({ page: 2, limit: 10 });

    expect(result).toEqual({
      attempts: mockAttempts,
      total: 15,
      page: 2,
      limit: 10,
      totalPages: 2
    });
    expect(mockAuthRepository.getAuthAttempts).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });
});
