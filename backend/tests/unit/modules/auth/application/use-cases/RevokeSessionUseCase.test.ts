import { RevokeSessionUseCase } from '../../../../../../src/modules/auth/application/use-cases/RevokeSessionUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';

describe('RevokeSessionUseCase', () => {
  let useCase: RevokeSessionUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      revokeSession: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new RevokeSessionUseCase(mockAuthRepository);
  });

  it('should revoke a session', async () => {
    mockAuthRepository.revokeSession.mockResolvedValue(true);

    const result = await useCase.execute(1, 42);

    expect(result).toBe(true);
    expect(mockAuthRepository.revokeSession).toHaveBeenCalledWith(1, 42);
  });
});
