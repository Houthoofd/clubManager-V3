import { ResendVerificationEmailUseCase } from '../../../../../../src/modules/auth/application/use-cases/ResendVerificationEmailUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';
import { EmailService } from '../../../../../../src/modules/auth/application/services/EmailService';
import { TokenService } from '../../../../../../src/shared/services/TokenService';
import { UserRole } from '@clubmanager/types';

jest.mock('../../../../../../src/modules/auth/application/services/EmailService');
jest.mock('../../../../../../src/shared/services/TokenService');

describe('ResendVerificationEmailUseCase', () => {
  let useCase: ResendVerificationEmailUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    userId: 'U-123',
    email_verified: false,
    active: true,
    deleted_at: null,
    anonymized: false,
    last_name: 'Doe',
    nom_utilisateur: 'jdoe',
    password: 'pwd',
    date_of_birth: new Date(),
    genre_id: 1,
    status_id: 1,
    est_mineur: false,
    peut_se_connecter: true,
    role_app: UserRole.MEMBER,
    date_inscription: new Date(),
    created_at: new Date()
  };

  beforeEach(() => {
    mockAuthRepository = {
      findUserByEmail: jest.fn(),
      storeEmailVerificationToken: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    mockEmailService = {
      sendVerificationEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    (EmailService as jest.Mock).mockImplementation(() => mockEmailService);
    
    (TokenService.generateEmailVerificationToken as jest.Mock).mockReturnValue({
      token: 'verify-token',
      expiresAt: new Date()
    });

    useCase = new ResendVerificationEmailUseCase(mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return success if user not found (anti-enumeration)', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.storeEmailVerificationToken).not.toHaveBeenCalled();
    expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should throw error if email is already verified', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue({ ...mockUser, email_verified: true });

    await expect(useCase.execute({ email: 'test@example.com' })).rejects.toThrow('Email is already verified');
  });

  it('should send verification email for valid user', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
    mockEmailService.sendVerificationEmail.mockResolvedValue({ success: true, messageId: '123' });

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.storeEmailVerificationToken).toHaveBeenCalledWith(
      1, 'verify-token', expect.any(Date), 'test@example.com'
    );
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      'John',
      expect.stringContaining('verify-token'),
      'U-123'
    );
  });

  it('should throw error if email service fails', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
    mockEmailService.sendVerificationEmail.mockResolvedValue({ success: false, error: 'API error' });

    await expect(useCase.execute({ email: 'test@example.com' })).rejects.toThrow('Failed to send verification email');
  });

  describe('Validation', () => {
    it('should throw if email is missing', async () => {
      await expect(useCase.execute({ email: '' })).rejects.toThrow('Email is required');
    });

    it('should throw if email format is invalid', async () => {
      await expect(useCase.execute({ email: 'invalid-email' })).rejects.toThrow('Invalid email format');
    });

    it('should throw if email is too long', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      await expect(useCase.execute({ email: longEmail })).rejects.toThrow('Email is too long');
    });
  });
});
