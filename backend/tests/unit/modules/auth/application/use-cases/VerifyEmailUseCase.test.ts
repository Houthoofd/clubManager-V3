import { VerifyEmailUseCase } from '../../../../../../src/modules/auth/application/use-cases/VerifyEmailUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockAuthRepository = {
      validateEmailVerificationToken: jest.fn(),
      markEmailAsVerified: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    useCase = new VerifyEmailUseCase(mockAuthRepository);
  });

  it('should verify email successfully', async () => {
    mockAuthRepository.validateEmailVerificationToken.mockResolvedValue(1);

    const result = await useCase.execute({ token: 'valid-token' });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.validateEmailVerificationToken).toHaveBeenCalledWith('valid-token');
    expect(mockAuthRepository.markEmailAsVerified).toHaveBeenCalledWith(1);
  });

  it('should throw if token is missing', async () => {
    await expect(useCase.execute({ token: '' })).rejects.toThrow('Verification token is required');
  });

  it('should throw if token is too long', async () => {
    const longToken = 'a'.repeat(501);
    await expect(useCase.execute({ token: longToken })).rejects.toThrow('Invalid verification token');
  });

  it('should throw if token is invalid or expired', async () => {
    mockAuthRepository.validateEmailVerificationToken.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'invalid-token' })).rejects.toThrow('Invalid or expired verification token');
  });
});
