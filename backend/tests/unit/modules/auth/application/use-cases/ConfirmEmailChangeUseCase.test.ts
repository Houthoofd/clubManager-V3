import { ConfirmEmailChangeUseCase } from '../../../../../../src/modules/auth/application/use-cases/ConfirmEmailChangeUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';

describe('ConfirmEmailChangeUseCase', () => {
  let useCase: ConfirmEmailChangeUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      validateEmailChangeToken: jest.fn(),
      updateEmail: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new ConfirmEmailChangeUseCase(mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully confirm email change and update email', async () => {
    mockAuthRepository.validateEmailChangeToken.mockResolvedValue({ userId: 1, newEmail: 'new@example.com' });

    const result = await useCase.execute('valid-token');

    expect(result).toEqual({ userId: 1, newEmail: 'new@example.com' });
    expect(mockAuthRepository.validateEmailChangeToken).toHaveBeenCalledWith('valid-token');
    expect(mockAuthRepository.updateEmail).toHaveBeenCalledWith(1, 'new@example.com');
  });

  it('should throw error if token is invalid or expired', async () => {
    mockAuthRepository.validateEmailChangeToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token')).rejects.toThrow('TOKEN_INVALID_OR_EXPIRED');
    expect(mockAuthRepository.updateEmail).not.toHaveBeenCalled();
  });
});
