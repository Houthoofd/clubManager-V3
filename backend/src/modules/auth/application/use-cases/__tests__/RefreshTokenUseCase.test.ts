/**
 * RefreshTokenUseCase.test.ts
 * Tests unitaires pour le use case de rafraîchissement des tokens
 */

import { RefreshTokenUseCase } from '../RefreshTokenUseCase';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { RefreshTokenDto, User } from '@clubmanager/types';
import { JwtService } from '@/shared/services/JwtService';

// Mock des services
jest.mock('@/shared/services/JwtService');

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  // Données de test valides
  const validRefreshTokenDto: RefreshTokenDto = {
    refreshToken: 'valid.refresh.token',
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
    last_login: new Date(),
    anonymized: false,
  };

  const mockDecodedToken = {
    userId: 1,
    email: 'john.doe@example.com',
    userIdString: 'U-2024-0001',
    type: 'refresh' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const mockNewTokens = {
    accessToken: 'new.access.token',
    refreshToken: 'new.refresh.token',
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

    refreshTokenUseCase = new RefreshTokenUseCase(mockAuthRepository);

    // Mock des services par défaut
    (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(mockDecodedToken);
    (JwtService.generateTokenPair as jest.Mock).mockReturnValue(mockNewTokens);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success scenarios', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result).toEqual({
        success: true,
        message: 'Token refreshed successfully',
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
          tokens: mockNewTokens,
        },
      });
    });

    it('should verify refresh token using JwtService', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(JwtService.verifyRefreshToken).toHaveBeenCalledWith(validRefreshTokenDto.refreshToken);
    });

    it('should validate refresh token in database', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.validateRefreshToken).toHaveBeenCalledWith(
        validRefreshTokenDto.refreshToken
      );
    });

    it('should retrieve user by id from database', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should revoke old refresh token (rotation strategy)', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(
        validRefreshTokenDto.refreshToken
      );
    });

    it('should generate new token pair', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(JwtService.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        userIdString: mockUser.userId,
      });
    });

    it('should store new refresh token in database', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockNewTokens.refreshToken,
        expect.any(Date)
      );
    });

    it('should update last login timestamp', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should store new refresh token with 7 days expiration', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const beforeCall = new Date();
      await refreshTokenUseCase.execute(validRefreshTokenDto);
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

    it('should return user data without sensitive information', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result.data.user).not.toHaveProperty('password');
      expect(result.data.user).not.toHaveProperty('created_at');
      expect(result.data.user).not.toHaveProperty('updated_at');
      expect(result.data.user).not.toHaveProperty('deleted_at');
      expect(result.data.user).not.toHaveProperty('active');
      expect(result.data.user).not.toHaveProperty('anonymized');
    });
  });

  describe('execute - Validation errors', () => {
    it('should throw error if refreshToken is missing', async () => {
      const invalidDto = { refreshToken: '' };

      await expect(refreshTokenUseCase.execute(invalidDto)).rejects.toThrow(
        'Refresh token is required'
      );
    });

    it('should throw error if refreshToken is only whitespace', async () => {
      const invalidDto = { refreshToken: '   ' };

      await expect(refreshTokenUseCase.execute(invalidDto)).rejects.toThrow(
        'Refresh token is required'
      );
    });

    it('should validate input before processing', async () => {
      const invalidDto = { refreshToken: '' };

      await expect(refreshTokenUseCase.execute(invalidDto)).rejects.toThrow();

      expect(JwtService.verifyRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.validateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('execute - Business logic errors', () => {
    it('should throw error if JWT verification fails', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if token is expired', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if token has invalid signature', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if refresh token not found in database', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Refresh token not found or revoked'
      );
    });

    it('should throw error if refresh token was revoked', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Refresh token not found or revoked'
      );
    });

    it('should throw error if userId mismatch between token and database', async () => {
      const mismatchedDecodedToken = { ...mockDecodedToken, userId: 999 };
      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(mismatchedDecodedToken);
      mockAuthRepository.validateRefreshToken.mockResolvedValue(1);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Token user mismatch'
      );
    });

    it('should throw error if user not found', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error if account is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(inactiveUser);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Account is disabled'
      );
    });

    it('should throw error if account is deleted', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(deletedUser);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Account not found'
      );
    });

    it('should throw error if account is anonymized', async () => {
      const anonymizedUser = { ...mockUser, anonymized: true };
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(anonymizedUser);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Account not found'
      );
    });

    it('should not generate new tokens if account is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(inactiveUser);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow();

      expect(mockAuthRepository.deleteRefreshToken).not.toHaveBeenCalled();
      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
      expect(mockAuthRepository.storeRefreshToken).not.toHaveBeenCalled();
    });

    it('should not generate new tokens if user not found', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow();

      expect(mockAuthRepository.deleteRefreshToken).not.toHaveBeenCalled();
      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
      expect(mockAuthRepository.storeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('execute - Edge cases', () => {
    it('should handle database connection errors', async () => {
      mockAuthRepository.validateRefreshToken.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle token deletion errors', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.deleteRefreshToken.mockRejectedValue(new Error('Deletion failed'));

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Deletion failed'
      );
    });

    it('should handle token generation errors', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      (JwtService.generateTokenPair as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Token generation failed'
      );
    });

    it('should handle new token storage errors', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.storeRefreshToken.mockRejectedValue(new Error('Storage failed'));

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Storage failed'
      );
    });

    it('should handle last login update errors', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.updateLastLogin.mockRejectedValue(new Error('Update failed'));

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Update failed'
      );
    });

    it('should handle very long refresh tokens', async () => {
      const longToken = 'a'.repeat(1000);
      const longTokenDto = { refreshToken: longToken };

      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(mockDecodedToken);
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(longTokenDto);

      expect(result.success).toBe(true);
      expect(JwtService.verifyRefreshToken).toHaveBeenCalledWith(longToken);
    });

    it('should handle user with null nom_utilisateur', async () => {
      const userWithoutUsername = { ...mockUser, nom_utilisateur: null };
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(userWithoutUsername as any);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result.success).toBe(true);
      expect(result.data.user.nom_utilisateur).toBeNull();
    });

    it('should handle user with null abonnement_id', async () => {
      const userWithoutSubscription = { ...mockUser, abonnement_id: null };
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(userWithoutSubscription);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result.success).toBe(true);
      expect(result.data.user.abonnement_id).toBeNull();
    });

    it('should handle tokens with special characters', async () => {
      const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.abc-def_ghi';
      const specialTokenDto = { refreshToken: specialToken };

      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(specialTokenDto);

      expect(result.success).toBe(true);
    });

    it('should handle concurrent refresh requests', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const promise1 = refreshTokenUseCase.execute(validRefreshTokenDto);
      const promise2 = refreshTokenUseCase.execute(validRefreshTokenDto);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('execute - Integration flow', () => {
    it('should execute complete refresh flow in correct order', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const callOrder: string[] = [];

      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        callOrder.push('verifyRefreshToken');
        return mockDecodedToken;
      });

      mockAuthRepository.validateRefreshToken.mockImplementation(async () => {
        callOrder.push('validateRefreshToken');
        return mockUser.id;
      });

      mockAuthRepository.findUserById.mockImplementation(async () => {
        callOrder.push('findUserById');
        return mockUser;
      });

      mockAuthRepository.deleteRefreshToken.mockImplementation(async () => {
        callOrder.push('deleteOldToken');
      });

      (JwtService.generateTokenPair as jest.Mock).mockImplementation(() => {
        callOrder.push('generateTokens');
        return mockNewTokens;
      });

      mockAuthRepository.storeRefreshToken.mockImplementation(async () => {
        callOrder.push('storeNewToken');
      });

      mockAuthRepository.updateLastLogin.mockImplementation(async () => {
        callOrder.push('updateLastLogin');
      });

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(callOrder).toEqual([
        'verifyRefreshToken',
        'validateRefreshToken',
        'findUserById',
        'deleteOldToken',
        'generateTokens',
        'storeNewToken',
        'updateLastLogin',
      ]);
    });

    it('should stop execution if token verification fails', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow();

      expect(mockAuthRepository.validateRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.findUserById).not.toHaveBeenCalled();
      expect(mockAuthRepository.deleteRefreshToken).not.toHaveBeenCalled();
    });

    it('should stop execution if token not found in database', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow();

      expect(mockAuthRepository.findUserById).not.toHaveBeenCalled();
      expect(mockAuthRepository.deleteRefreshToken).not.toHaveBeenCalled();
      expect(JwtService.generateTokenPair).not.toHaveBeenCalled();
    });

    it('should stop execution if userId mismatch', async () => {
      const mismatchedToken = { ...mockDecodedToken, userId: 999 };
      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(mismatchedToken);
      mockAuthRepository.validateRefreshToken.mockResolvedValue(1);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow();

      expect(mockAuthRepository.findUserById).not.toHaveBeenCalled();
      expect(mockAuthRepository.deleteRefreshToken).not.toHaveBeenCalled();
    });

    it('should include all expected user fields in response', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

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

    it('should include new tokens in response', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result.data.tokens).toEqual(mockNewTokens);
      expect(result.data.tokens.accessToken).toBe('new.access.token');
      expect(result.data.tokens.refreshToken).toBe('new.refresh.token');
      expect(result.data.tokens.expiresIn).toBe(900);
    });

    it('should return different tokens than input', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result.data.tokens.refreshToken).not.toBe(validRefreshTokenDto.refreshToken);
    });
  });

  describe('execute - Token rotation security', () => {
    it('should implement token rotation (delete old, create new)', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(
        validRefreshTokenDto.refreshToken
      );
      expect(mockAuthRepository.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockNewTokens.refreshToken,
        expect.any(Date)
      );
    });

    it('should delete old token before storing new token', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const callOrder: string[] = [];

      mockAuthRepository.deleteRefreshToken.mockImplementation(async () => {
        callOrder.push('delete');
      });

      mockAuthRepository.storeRefreshToken.mockImplementation(async () => {
        callOrder.push('store');
      });

      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(callOrder[0]).toBe('delete');
      expect(callOrder[1]).toBe('store');
    });

    it('should verify userId match to prevent token hijacking', async () => {
      const hackerDecodedToken = { ...mockDecodedToken, userId: 999 };
      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(hackerDecodedToken);
      mockAuthRepository.validateRefreshToken.mockResolvedValue(1);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Token user mismatch'
      );
    });

    it('should check token exists in database before processing', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(validRefreshTokenDto)).rejects.toThrow(
        'Refresh token not found or revoked'
      );
    });

    it('should not expose sensitive user data', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await refreshTokenUseCase.execute(validRefreshTokenDto);
      const resultString = JSON.stringify(result);

      expect(resultString).not.toContain('hashed_password');
      expect(resultString).not.toContain(mockUser.password);
    });
  });

  describe('execute - Multiple refresh scenarios', () => {
    it('should handle multiple consecutive refresh operations', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const token1 = { accessToken: 'token1', refreshToken: 'refresh1', expiresIn: 900 };
      const token2 = { accessToken: 'token2', refreshToken: 'refresh2', expiresIn: 900 };
      const token3 = { accessToken: 'token3', refreshToken: 'refresh3', expiresIn: 900 };

      (JwtService.generateTokenPair as jest.Mock)
        .mockReturnValueOnce(token1)
        .mockReturnValueOnce(token2)
        .mockReturnValueOnce(token3);

      const result1 = await refreshTokenUseCase.execute(validRefreshTokenDto);
      const result2 = await refreshTokenUseCase.execute(validRefreshTokenDto);
      const result3 = await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(result1.data.tokens.refreshToken).toBe('refresh1');
      expect(result2.data.tokens.refreshToken).toBe('refresh2');
      expect(result3.data.tokens.refreshToken).toBe('refresh3');
    });

    it('should call deleteRefreshToken for each refresh attempt', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);
      await refreshTokenUseCase.execute(validRefreshTokenDto);
      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledTimes(3);
    });

    it('should update last login on each refresh', async () => {
      mockAuthRepository.validateRefreshToken.mockResolvedValue(mockUser.id);
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await refreshTokenUseCase.execute(validRefreshTokenDto);
      await refreshTokenUseCase.execute(validRefreshTokenDto);

      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledTimes(2);
      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
