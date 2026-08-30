import { GetActiveSessionsUseCase } from '../../../../../../src/modules/auth/application/use-cases/GetActiveSessionsUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';

describe('GetActiveSessionsUseCase', () => {
  let useCase: GetActiveSessionsUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      getActiveSessions: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new GetActiveSessionsUseCase(mockAuthRepository);
  });

  it('should return active sessions for user', async () => {
    const mockSessions = [
      { id: '1', user_id: 1, expires_at: new Date(), ip_address: '1.1.1.1', user_agent: 'Chrome', is_revoked: false }
    ];
    mockAuthRepository.getActiveSessions.mockResolvedValue(mockSessions);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockSessions);
    expect(mockAuthRepository.getActiveSessions).toHaveBeenCalledWith(1);
  });
});
