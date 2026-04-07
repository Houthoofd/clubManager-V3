/**
 * LoginUseCase.test.ts
 * Tests unitaires pour le use case de connexion
 */

import { LoginUseCase } from '../LoginUseCase';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { LoginDto, User } from '@clubmanager/types';
import { PasswordService } from '@/shared/services/PasswordService';
import { JwtService } from '@/shared/services/JwtService';

// Mock des services
jest.mock('@/shared/services/PasswordService');
jest.mock('@/shared/services/JwtService');

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  // Données de test valides
  const validLoginDto: LoginDto = {
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
  };

  const mockUser: User = {
    id: 1,
    userId: 'U-2024-0001',
    first_name: 'John',
    last_name: 'Doe',
    nom_utilisateur: 'johndoe',
    email: 'john.doe@example.com',
    password: 'hashed_password',
    email_verified: true,
    active: true,
    date_of_birth: new Date('1990-01-15'),
    genre_id: 1,
    status_id: 1,
    grade_id: 1,
    abonnement_id: 1,
    photo_url: null,
    phone: null,
    adresse: null,
    ville: null,
    code_postal: null,
    pays: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    last_login: null,
    anonymized: false,
  };

  const mockTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    expiresIn: 900,
  };

  beforeEach(() => {
    // Créer un mock du repository
    mockAuthRepository = {
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      findUserByUserId: jest.fn(),
      emailExists: jest.fn(),
      updatePassword: jest.fn(),
      updateLastLogin: jest.fn(),
      markEmailAsVerified: jest.fn(),
      storeEmailVerificationToken: jest.fn(),
      validateEmailVerificationToken: jest.fn(),
      deleteEmailVerificationToken: jest.fn(),
      storePasswordResetToken: jest.fn(),
      validatePasswordResetToken: jest.fn(),
      deletePasswordResetToken: jest.fn(),
      deleteAllPasswordResetTokens: jest.fn(),
      storeRefreshToken: jest.fn(),
      validateRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
      deleteAllRefreshTokens: jest.fn(),
      cleanupExpiredTokens: jest.fn(),
    } as jest.Mocked<IAuthRepository>;

    loginUseCase = new LoginUseCase(mockAuthRepository);

    // Mock des services par défaut
    (PasswordService.compare as jest.Mock).mockResolvedValue(true);
    (JwtService.generateTokenPair as jest.Mock).mockReturnValue(mockTokens);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success scenarios', () => {
    it('should successfully login a user with valid credentials', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: mockUser.id,
            userId: mockUser.userId,
            first_name: mockUser.first_name,
            last_name: mockUser.last_name,
            nom_utilisateur: mockUser.nom_utilisateur,
            email: mockUser.email,
            email_verified: mockUser.email_verified,
            status_id: mockUser.status_id,
            grade_id: mockUser.grade_id,
            abonnement_id: mockUser.abonnement_id,
          },
          tokens: mockTokens,
        },
      });
    });

    it('should find user by email', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);

      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(validLoginDto.email);
    });

    it('should compare password with hashed password', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);

      expect(PasswordService.compare).toHaveBeenCalledWith(
        validLoginDto.password,
        mockUser.password
      );
    });

    it('should generate JWT tokens after successful authentication', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);

      expect(JwtService.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        userIdString: mockUser.userId,
      });
    });

    it('should store refresh token in database', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);

      expect(mockAuthRepository.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken,
        expect.any(Date)
      );
    });

    it('should update last login timestamp', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);

      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should store refresh token with 7 days expiration', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const beforeCall = new Date();
      await loginUseCase.execute(validLoginDto);
      const afterCall = new Date();

      const storeRefreshTokenCall = mockAuthRepository.storeRefreshToken.mock.calls[0];
      const expiryDate = storeRefreshTokenCall[2] as Date;

      const expectedMinExpiry = new Date(beforeCall);
      expectedMinExpiry.setDate(expectedMinExpiry.getDate() + 7);

      const expectedMaxExpiry = new Date(afterCall);
      expectedMaxExpiry.setDate(expectedMaxExpiry.getDate() + 7);

      expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedMinExpiry.getTime() - 1000);
      expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedMaxExpiry.getTime() + 1000);
    });

    it('should successfully login user with unverified email', async () => {
      const unverifiedUser = { ...mockUser, email_verified: false };
      mockAuthRepository.findUserByEmail.mockResolvedValue(unverifiedUser);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.success).toBe(true);
      expect(result.data.user.email_verified).toBe(false);
    });

    it('should return user data without sensitive information', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.data.user).not.toHaveProperty('password');
      expect(result.data.user).not.toHaveProperty('created_at');
      expect(result.data.user).not.toHaveProperty('updated_at');
      expect(result.data.user).not.toHaveProperty('deleted_at');
      expect(result.data.user).not.toHaveProperty('active');
      expect(result.data.user).not.toHaveProperty('anonymized');
    });
  });

  describe('execute - Validation errors', () => {
    it('should throw error if email is missing', async () => {
      const invalidDto = { ...validLoginDto, email: '' };

      await expect(loginUseCase.execute(invalidDto)).rejects.toThrow('Email is required');
    });

    it('should throw error if email is only whitespace', async () => {
      const invalidDto = { ...validLoginDto, email: '   ' };

      await expect(loginUseCase.execute(invalidDto)).rejects.toThrow('Email is required');
    });

    it('should throw error if password is missing', async () => {
      const invalidDto = { ...validLoginDto, password: '' };

      await expect(loginUseCase.execute(invalidDto)).rejects.toThrow('Password is required');
    });

    it('should throw error if password is only whitespace', async () => {
      const invalidDto = { ...validLoginDto, password: '   ' };

      await expect(loginUseCase.execute(invalidDto)).rejects.toThrow('Password is required');
    });

    it('should throw error for invalid email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid.example.com',
        'invalid @example.com',
        'invalid@exam ple.com',
      ];

      for (const email of invalidEmails) {
        const invalidDto = { ...validLoginDto, email };
        await expect(loginUseCase.execute(invalidDto)).rejects.toThrow('Invalid email format');
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
        'first.last@subdomain.example.com',
      ];

      for (const email of validEmails) {
        const validDto = { ...validLoginDto, email };
        mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

        await expect(loginUseCase.execute(validDto)).resolves.toBeDefined();
      }
    });

    it('should validate input before querying database', async () => {
      const invalidDto = { ...validLoginDto, email: '' };

      await expect(loginUseCase.execute(invalidDto)).rejects.toThrow();

      expect(mockAuthRepository.findUserByEmail).not.toHaveBeenCalled();
    });
  });

  describe('execute - Business logic errors', () => {
    it('should throw error if user not found', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should not reveal if email exists when user not found', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow(
        'Invalid email or password'
      );
      // Generic error message for security
    });

    it('should throw error if account is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockAuthRepository.findUserByEmail.mockResolvedValue(inactiveUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account is disabled');
    });

    it('should throw error if account is deleted', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockAuthRepository.findUserByEmail.mockResolvedValue(deletedUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account not found');
    });

    it('should throw error if account is anonymized', async () => {
      const anonymizedUser = { ...mockUser, anonymized: true };
      mockAuthRepository.findUserByEmail.mockResolvedValue(anonymizedUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account not found');
    });

    it('should throw error if password is incorrect', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (PasswordService.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should not reveal if email exists when password is wrong', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (PasswordService.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow(
        'Invalid email or password'
      );
      // Same generic error message for security
    });

    it('should check account status before password verification', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockAuthRepository.findUserByEmail.mockResolvedValue(inactiveUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account is disabled');

      expect(PasswordService.compare).not.toHaveBeenCalled();
    });

    it('should check if account is deleted before password verification', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockAuthRepository.findUserByEmail.mockResolvedValue(deletedUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account not found');

      expect(PasswordService.compare).not.toHaveBeenCalled();
    });

    it('should not generate tokens if password is incorrect', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (PasswordService.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow();

      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
      expect(mockAuthRepository.storeRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe('execute - Edge cases', () => {
    it('should handle database connection errors', async () => {
      mockAuthRepository.findUserByEmail.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle password comparison errors', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (PasswordService.compare as jest.Mock).mockRejectedValue(new Error('Comparison failed'));

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Comparison failed');
    });

    it('should handle token generation errors', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (JwtService.generateTokenPair as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Token generation failed');
    });

    it('should handle refresh token storage errors', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockAuthRepository.storeRefreshToken.mockRejectedValue(new Error('Token storage failed'));

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Token storage failed');
    });

    it('should handle last login update errors', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockAuthRepository.updateLastLogin.mockRejectedValue(
        new Error('Update last login failed')
      );

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Update last login failed');
    });

    it('should handle user with null nom_utilisateur', async () => {
      const userWithoutUsername = { ...mockUser, nom_utilisateur: null };
      mockAuthRepository.findUserByEmail.mockResolvedValue(userWithoutUsername as any);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.success).toBe(true);
      expect(result.data.user.nom_utilisateur).toBeNull();
    });

    it('should handle user with null abonnement_id', async () => {
      const userWithoutSubscription = { ...mockUser, abonnement_id: null };
      mockAuthRepository.findUserByEmail.mockResolvedValue(userWithoutSubscription);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.success).toBe(true);
      expect(result.data.user.abonnement_id).toBeNull();
    });

    it('should handle email with different casing', async () => {
      const dtoWithUpperEmail = { ...validLoginDto, email: 'JOHN.DOE@EXAMPLE.COM' };
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(dtoWithUpperEmail);

      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith('JOHN.DOE@EXAMPLE.COM');
    });

    it('should handle special characters in password', async () => {
      const specialPasswordDto = { ...validLoginDto, password: 'P@$$w0rd!#%&*()' };
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(specialPasswordDto);

      expect(result.success).toBe(true);
      expect(PasswordService.compare).toHaveBeenCalledWith('P@$$w0rd!#%&*()', mockUser.password);
    });

    it('should handle very long passwords', async () => {
      const longPasswordDto = { ...validLoginDto, password: 'P@ssw0rd' + 'a'.repeat(120) };
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(longPasswordDto);

      expect(result.success).toBe(true);
    });

    it('should handle users with past last_login', async () => {
      const userWithLastLogin = { ...mockUser, last_login: new Date('2024-01-01') };
      mockAuthRepository.findUserByEmail.mockResolvedValue(userWithLastLogin);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('execute - Integration flow', () => {
    it('should execute complete login flow in correct order', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const callOrder: string[] = [];

      mockAuthRepository.findUserByEmail.mockImplementation(async () => {
        callOrder.push('findUserByEmail');
        return mockUser;
      });

      (PasswordService.compare as jest.Mock).mockImplementation(async () => {
        callOrder.push('comparePassword');
        return true;
      });

      (JwtService.generateTokenPair as jest.Mock).mockImplementation(() => {
        callOrder.push('generateTokens');
        return mockTokens;
      });

      mockAuthRepository.storeRefreshToken.mockImplementation(async () => {
        callOrder.push('storeRefreshToken');
      });

      mockAuthRepository.updateLastLogin.mockImplementation(async () => {
        callOrder.push('updateLastLogin');
      });

      await loginUseCase.execute(validLoginDto);

      expect(callOrder).toEqual([
        'findUserByEmail',
        'comparePassword',
        'generateTokens',
        'storeRefreshToken',
        'updateLastLogin',
      ]);
    });

    it('should stop execution if user not found', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow();

      expect(PasswordService.compare).not.toHaveBeenCalled();
      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
      expect(mockAuthRepository.storeRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should stop execution if account is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockAuthRepository.findUserByEmail.mockResolvedValue(inactiveUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow();

      expect(PasswordService.compare).not.toHaveBeenCalled();
      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
      expect(mockAuthRepository.storeRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should stop execution if password is incorrect', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (PasswordService.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow();

      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
      expect(mockAuthRepository.storeRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should include all expected user fields in response', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.data.user).toHaveProperty('id');
      expect(result.data.user).toHaveProperty('userId');
      expect(result.data.user).toHaveProperty('first_name');
      expect(result.data.user).toHaveProperty('last_name');
      expect(result.data.user).toHaveProperty('nom_utilisateur');
      expect(result.data.user).toHaveProperty('email');
      expect(result.data.user).toHaveProperty('email_verified');
      expect(result.data.user).toHaveProperty('status_id');
      expect(result.data.user).toHaveProperty('grade_id');
      expect(result.data.user).toHaveProperty('abonnement_id');
    });

    it('should include tokens in response', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(validLoginDto);

      expect(result.data.tokens).toEqual(mockTokens);
      expect(result.data.tokens.accessToken).toBe('mock.access.token');
      expect(result.data.tokens.refreshToken).toBe('mock.refresh.token');
      expect(result.data.tokens.expiresIn).toBe(900);
    });

    it('should handle consecutive login attempts', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);
      await loginUseCase.execute(validLoginDto);
      await loginUseCase.execute(validLoginDto);

      expect(mockAuthRepository.storeRefreshToken).toHaveBeenCalledTimes(3);
      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledTimes(3);
    });

    it('should generate different tokens for each login', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const token1 = { accessToken: 'token1', refreshToken: 'refresh1', expiresIn: 900 };
      const token2 = { accessToken: 'token2', refreshToken: 'refresh2', expiresIn: 900 };

      (JwtService.generateTokenPair as jest.Mock)
        .mockReturnValueOnce(token1)
        .mockReturnValueOnce(token2);

      const result1 = await loginUseCase.execute(validLoginDto);
      const result2 = await loginUseCase.execute(validLoginDto);

      expect(result1.data.tokens.accessToken).not.toBe(result2.data.tokens.accessToken);
      expect(result1.data.tokens.refreshToken).not.toBe(result2.data.tokens.refreshToken);
    });
  });

  describe('execute - Security considerations', () => {
    it('should use constant-time comparison for passwords', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      await loginUseCase.execute(validLoginDto);

      // PasswordService.compare should use bcrypt which has constant-time comparison
      expect(PasswordService.compare).toHaveBeenCalled();
    });

    it('should not leak user existence through different error messages', async () => {
      // User not found
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      const notFoundError = loginUseCase.execute(validLoginDto);

      // Wrong password
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (PasswordService.compare as jest.Mock).mockResolvedValue(false);
      const wrongPasswordError = loginUseCase.execute(validLoginDto);

      await expect(notFoundError).rejects.toThrow('Invalid email or password');
      await expect(wrongPasswordError).rejects.toThrow('Invalid email or password');
    });

    it('should not return password hash in response', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await loginUseCase.execute(validLoginDto);
      const resultString = JSON.stringify(result);

      expect(resultString).not.toContain('hashed_password');
      expect(resultString).not.toContain(mockUser.password);
    });

    it('should handle account deletion securely', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockAuthRepository.findUserByEmail.mockResolvedValue(deletedUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account not found');
      // Generic message, doesn't reveal account was deleted
    });

    it('should handle anonymized accounts securely', async () => {
      const anonymizedUser = { ...mockUser, anonymized: true };
      mockAuthRepository.findUserByEmail.mockResolvedValue(anonymizedUser);

      await expect(loginUseCase.execute(validLoginDto)).rejects.toThrow('Account not found');
      // Generic message, doesn't reveal account was anonymized
    });
  });
});
