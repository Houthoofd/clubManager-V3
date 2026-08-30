import { RequestPasswordResetUseCase } from '../../../../../../src/modules/auth/application/use-cases/RequestPasswordResetUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';
import { EmailService } from '../../../../../../src/modules/auth/application/services/EmailService';
import { TokenService } from '../../../../../../src/shared/services/TokenService';
import { UserRole } from '@clubmanager/types';

jest.mock('../../../../../../src/modules/auth/application/services/EmailService');
jest.mock('../../../../../../src/shared/services/TokenService');

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
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
    password: 'pwd',
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
      findUserByEmail: jest.fn(),
      storePasswordResetToken: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    mockEmailService = {
      sendPasswordResetEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    (EmailService as jest.Mock).mockImplementation(() => mockEmailService);
    
    (TokenService.generatePasswordResetToken as jest.Mock).mockReturnValue({
      token: 'reset-token',
      expiresAt: new Date()
    });

    useCase = new RequestPasswordResetUseCase(mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return success if user not found (anti-enumeration)', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.storePasswordResetToken).not.toHaveBeenCalled();
    expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should return success if user is inactive (anti-enumeration)', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue({ ...mockUser, active: false });

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.storePasswordResetToken).not.toHaveBeenCalled();
    expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should process password reset for valid user', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
    mockEmailService.sendPasswordResetEmail.mockResolvedValue({ success: true, messageId: '123' });

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.success).toBe(true);
    expect(mockAuthRepository.storePasswordResetToken).toHaveBeenCalledWith(1, 'reset-token', expect.any(Date));
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      'John',
      expect.stringContaining('reset-token')
    );
  });

  it('should throw if email service fails', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
    mockEmailService.sendPasswordResetEmail.mockResolvedValue({ success: false, error: 'API Error' });

    await expect(useCase.execute({ email: 'test@example.com' })).rejects.toThrow('Failed to send password reset email');
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
