import { ResetPasswordUseCase } from '../../../../../../src/modules/auth/application/use-cases/ResetPasswordUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';
import { EmailService } from '../../../../../../src/modules/auth/application/services/EmailService';
import { PasswordService } from '../../../../../../src/shared/services/PasswordService';
import { UserRole } from '@clubmanager/types';

jest.mock('../../../../../../src/modules/auth/application/services/EmailService');
jest.mock('../../../../../../src/shared/services/PasswordService');

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    active: true,
    deleted_at: null,
    anonymized: false,
    userId: 'U-123',
    last_name: 'Doe',
    nom_utilisateur: 'jdoe',
    password: 'old_hash',
    date_of_birth: new Date(),
    genre_id: 1,
    status_id: 1,
    email_verified: true,
    est_mineur: false,
    peut_se_connecter: true,
    role_app: UserRole.MEMBER,
    date_inscription: new Date(),
    created_at: new Date()
  };

  beforeEach(() => {
    mockAuthRepository = {
      validatePasswordResetToken: jest.fn(),
      findUserById: jest.fn(),
      updatePassword: jest.fn(),
      deletePasswordResetToken: jest.fn(),
      deleteAllPasswordResetTokens: jest.fn(),
      deleteAllRefreshTokens: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    mockEmailService = {
      sendPasswordChangedEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    (EmailService as jest.Mock).mockImplementation(() => mockEmailService);
    
    (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: true,
      errors: []
    });

    (PasswordService.hash as jest.Mock).mockResolvedValue('new_hash');

    useCase = new ResetPasswordUseCase(mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process password reset for valid token and user', async () => {
    mockAuthRepository.validatePasswordResetToken.mockResolvedValue(1);
    mockAuthRepository.findUserById.mockResolvedValue(mockUser);
    mockEmailService.sendPasswordChangedEmail.mockResolvedValue({ success: true, messageId: '123' });

    const result = await useCase.execute({
      token: 'valid-token',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.updatePassword).toHaveBeenCalledWith(1, 'new_hash');
    expect(mockAuthRepository.deletePasswordResetToken).toHaveBeenCalledWith('valid-token');
    expect(mockAuthRepository.deleteAllPasswordResetTokens).toHaveBeenCalledWith(1);
    expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(1);
    expect(mockEmailService.sendPasswordChangedEmail).toHaveBeenCalledWith('test@example.com', 'John');
  });

  it('should throw if token is invalid or expired', async () => {
    mockAuthRepository.validatePasswordResetToken.mockResolvedValue(null);

    await expect(useCase.execute({
      token: 'invalid-token',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    })).rejects.toThrow('Invalid or expired password reset token');
  });

  it('should throw if user not found', async () => {
    mockAuthRepository.validatePasswordResetToken.mockResolvedValue(1);
    mockAuthRepository.findUserById.mockResolvedValue(null);

    await expect(useCase.execute({
      token: 'valid-token',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    })).rejects.toThrow('User not found');
  });

  it('should throw if user is inactive or deleted', async () => {
    mockAuthRepository.validatePasswordResetToken.mockResolvedValue(1);
    mockAuthRepository.findUserById.mockResolvedValue({ ...mockUser, active: false });

    await expect(useCase.execute({
      token: 'valid-token',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    })).rejects.toThrow('Account is disabled or deleted');
  });

  it('should throw if password validation fails', async () => {
    mockAuthRepository.validatePasswordResetToken.mockResolvedValue(1);
    mockAuthRepository.findUserById.mockResolvedValue(mockUser);
    (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Too short']
    });

    await expect(useCase.execute({
      token: 'valid-token',
      newPassword: 'validlength',
      confirmPassword: 'validlength'
    })).rejects.toThrow('Password validation failed: Too short');
  });

  it('should not throw if email service fails', async () => {
    mockAuthRepository.validatePasswordResetToken.mockResolvedValue(1);
    mockAuthRepository.findUserById.mockResolvedValue(mockUser);
    mockEmailService.sendPasswordChangedEmail.mockResolvedValue({ success: false, error: 'API Error' });

    // The method logs the error but does not throw
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await useCase.execute({
      token: 'valid-token',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!'
    });

    expect(result.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to send password changed confirmation email:', 'API Error');
    consoleSpy.mockRestore();
  });

  describe('Validation', () => {
    it('should throw if token is missing', async () => {
      await expect(useCase.execute({
        token: '',
        newPassword: 'pwd',
        confirmPassword: 'pwd'
      })).rejects.toThrow('Reset token is required');
    });

    it('should throw if token is too long', async () => {
      await expect(useCase.execute({
        token: 'a'.repeat(501),
        newPassword: 'pwd',
        confirmPassword: 'pwd'
      })).rejects.toThrow('Invalid reset token');
    });

    it('should throw if new password is missing', async () => {
      await expect(useCase.execute({
        token: 't',
        newPassword: '',
        confirmPassword: 'pwd'
      })).rejects.toThrow('New password is required');
    });

    it('should throw if new password is too short', async () => {
      await expect(useCase.execute({
        token: 't',
        newPassword: 'short',
        confirmPassword: 'pwd'
      })).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should throw if new password is too long', async () => {
      await expect(useCase.execute({
        token: 't',
        newPassword: 'a'.repeat(73),
        confirmPassword: 'pwd'
      })).rejects.toThrow('Password cannot exceed 72 characters');
    });

    it('should throw if confirm password is missing', async () => {
      await expect(useCase.execute({
        token: 't',
        newPassword: 'validpassword1',
        confirmPassword: ''
      })).rejects.toThrow('Password confirmation is required');
    });

    it('should throw if passwords do not match', async () => {
      await expect(useCase.execute({
        token: 't',
        newPassword: 'validpassword1',
        confirmPassword: 'validpassword2'
      })).rejects.toThrow('Passwords do not match');
    });
  });
});
