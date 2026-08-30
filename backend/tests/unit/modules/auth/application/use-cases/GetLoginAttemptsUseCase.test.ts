import { GetLoginAttemptsUseCase } from '../../../../../../src/modules/auth/application/use-cases/GetLoginAttemptsUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';

describe('GetLoginAttemptsUseCase', () => {
  let useCase: GetLoginAttemptsUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      getLoginAttempts: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new GetLoginAttemptsUseCase(mockAuthRepository);
  });

  it('should return paginated login attempts', async () => {
    const mockAttempts = [
      { id: 1, email: 'test@example.com', ip_address: '1.1.1.1', success: true, timestamp: new Date() }
    ];
    mockAuthRepository.getLoginAttempts.mockResolvedValue({ attempts: mockAttempts, total: 15 });

    const result = await useCase.execute({ page: 2, limit: 10 });

    expect(result).toEqual({
      attempts: mockAttempts,
      total: 15,
      page: 2,
      limit: 10,
      totalPages: 2
    });
    expect(mockAuthRepository.getLoginAttempts).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });
});
