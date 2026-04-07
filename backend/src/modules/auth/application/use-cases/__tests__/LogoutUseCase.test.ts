/**
 * LogoutUseCase.test.ts
 * Tests unitaires pour le use case de déconnexion
 */

import { LogoutUseCase } from '../LogoutUseCase';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { LogoutDto, User } from '@clubmanager/types';
import { JwtService } from '@/shared/services/JwtService';

// Mock des services
jest.mock('@/shared/services/JwtService');

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  // Données de test valides
  const validLogoutDto: LogoutDto = {
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

    logoutUseCase = new LogoutUseCase(mockAuthRepository);

    // Mock des services par défaut
    (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(mockDecodedToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success scenarios', () => {
    it('should successfully logout with valid refresh token', async () => {
      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result).toEqual({
        success: true,
        message: 'Logout successful',
      });
    });

    it('should verify refresh token using JwtService', async () => {
      await logoutUseCase.execute(validLogoutDto);

      expect(JwtService.verifyRefreshToken).toHaveBeenCalledWith(validLogoutDto.refreshToken);
    });

    it('should delete refresh token from database', async () => {
      await logoutUseCase.execute(validLogoutDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(
        validLogoutDto.refreshToken
      );
    });

    it('should return success even if token verification fails', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
    });

    it('should still delete token even if verification fails', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      await logoutUseCase.execute(validLogoutDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(
        validLogoutDto.refreshToken
      );
    });

    it('should handle logout with expired token gracefully', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
    });

    it('should handle logout with malformed token gracefully', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
    });

    it('should return consistent success response format', async () => {
      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(typeof result.message).toBe('string');
    });
  });

  describe('execute - Validation errors', () => {
    it('should throw error if refreshToken is missing', async () => {
      const invalidDto = { refreshToken: '' };

      await expect(logoutUseCase.execute(invalidDto)).rejects.toThrow(
        'Refresh token is required'
      );
    });

    it('should throw error if refreshToken is only whitespace', async () => {
      const invalidDto = { refreshToken: '   ' };

      await expect(logoutUseCase.execute(invalidDto)).rejects.toThrow(
        'Refresh token is required'
      );
    });

    it('should validate input before processing', async () => {
      const invalidDto = { refreshToken: '' };

      await expect(logoutUseCase.execute(invalidDto)).rejects.toThrow();

      expect(JwtService.verifyRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.deleteRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw error for undefined refreshToken', async () => {
      const invalidDto = { refreshToken: undefined as any };

      await expect(logoutUseCase.execute(invalidDto)).rejects.toThrow();
    });

    it('should throw error for null refreshToken', async () => {
      const invalidDto = { refreshToken: null as any };

      await expect(logoutUseCase.execute(invalidDto)).rejects.toThrow();
    });
  });

  describe('execute - Edge cases', () => {
    it('should handle database deletion errors', async () => {
      mockAuthRepository.deleteRefreshToken.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(logoutUseCase.execute(validLogoutDto)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle very long refresh tokens', async () => {
      const longToken = 'a'.repeat(1000);
      const longTokenDto = { refreshToken: longToken };

      await logoutUseCase.execute(longTokenDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(longToken);
    });

    it('should handle tokens with special characters', async () => {
      const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.abc-def_ghi';
      const specialTokenDto = { refreshToken: specialToken };

      const result = await logoutUseCase.execute(specialTokenDto);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(specialToken);
    });

    it('should handle token that does not exist in database', async () => {
      // The use case should still succeed even if token doesn't exist
      mockAuthRepository.deleteRefreshToken.mockResolvedValue(undefined);

      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
    });

    it('should handle concurrent logout requests', async () => {
      const promise1 = logoutUseCase.execute(validLogoutDto);
      const promise2 = logoutUseCase.execute(validLogoutDto);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledTimes(2);
    });

    it('should handle logout with token containing invalid signature', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalled();
    });

    it('should handle logout with completely invalid token format', async () => {
      const invalidTokenDto = { refreshToken: 'completely-invalid-token' };

      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('jwt must have 3 parts');
      });

      const result = await logoutUseCase.execute(invalidTokenDto);

      expect(result.success).toBe(true);
    });

    it('should handle network timeout errors', async () => {
      mockAuthRepository.deleteRefreshToken.mockRejectedValue(new Error('Network timeout'));

      await expect(logoutUseCase.execute(validLogoutDto)).rejects.toThrow('Network timeout');
    });
  });

  describe('execute - Integration flow', () => {
    it('should execute logout flow in correct order', async () => {
      const callOrder: string[] = [];

      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        callOrder.push('verifyToken');
        return mockDecodedToken;
      });

      mockAuthRepository.deleteRefreshToken.mockImplementation(async () => {
        callOrder.push('deleteToken');
      });

      await logoutUseCase.execute(validLogoutDto);

      expect(callOrder).toEqual(['verifyToken', 'deleteToken']);
    });

    it('should attempt token deletion even if verification throws error', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      const callOrder: string[] = [];

      mockAuthRepository.deleteRefreshToken.mockImplementation(async () => {
        callOrder.push('deleteToken');
      });

      await logoutUseCase.execute(validLogoutDto);

      expect(callOrder).toEqual(['deleteToken']);
    });

    it('should complete logout successfully with valid token', async () => {
      const result = await logoutUseCase.execute(validLogoutDto);

      expect(JwtService.verifyRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
    });

    it('should not throw error during verification failure', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Any verification error');
      });

      await expect(logoutUseCase.execute(validLogoutDto)).resolves.toBeDefined();
    });
  });

  describe('logoutAllDevices - Success scenarios', () => {
    it('should successfully logout from all devices', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result).toEqual({
        success: true,
        message: 'Logged out from all devices',
      });
    });

    it('should verify user exists before deleting tokens', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should delete all refresh tokens for user', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return consistent success response format', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(typeof result.message).toBe('string');
    });

    it('should handle logout for user with multiple active sessions', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle logout for user with no active sessions', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.deleteAllRefreshTokens.mockResolvedValue(undefined);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
    });
  });

  describe('logoutAllDevices - Validation errors', () => {
    it('should throw error if userId is missing', async () => {
      await expect(logoutUseCase.logoutAllDevices(undefined as any)).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should throw error if userId is null', async () => {
      await expect(logoutUseCase.logoutAllDevices(null as any)).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should throw error if userId is 0', async () => {
      await expect(logoutUseCase.logoutAllDevices(0)).rejects.toThrow('User ID is required');
    });

    it('should throw error if userId is negative', async () => {
      await expect(logoutUseCase.logoutAllDevices(-1)).rejects.toThrow('User ID is required');
    });

    it('should validate userId before querying database', async () => {
      await expect(logoutUseCase.logoutAllDevices(0)).rejects.toThrow();

      expect(mockAuthRepository.findUserById).not.toHaveBeenCalled();
      expect(mockAuthRepository.deleteAllRefreshTokens).not.toHaveBeenCalled();
    });

    it('should accept valid positive userId', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      await expect(logoutUseCase.logoutAllDevices(1)).resolves.toBeDefined();
    });

    it('should accept large userId values', async () => {
      const largeUserId = 999999;
      const userWithLargeId = { ...mockUser, id: largeUserId };
      mockAuthRepository.findUserById.mockResolvedValue(userWithLargeId);

      const result = await logoutUseCase.logoutAllDevices(largeUserId);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(largeUserId);
    });
  });

  describe('logoutAllDevices - Business logic errors', () => {
    it('should throw error if user not found', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(logoutUseCase.logoutAllDevices(999)).rejects.toThrow('User not found');
    });

    it('should not delete tokens if user not found', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(logoutUseCase.logoutAllDevices(999)).rejects.toThrow();

      expect(mockAuthRepository.deleteAllRefreshTokens).not.toHaveBeenCalled();
    });

    it('should logout even if user account is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockAuthRepository.findUserById.mockResolvedValue(inactiveUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalled();
    });

    it('should logout even if user account is deleted', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockAuthRepository.findUserById.mockResolvedValue(deletedUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalled();
    });

    it('should logout even if user is anonymized', async () => {
      const anonymizedUser = { ...mockUser, anonymized: true };
      mockAuthRepository.findUserById.mockResolvedValue(anonymizedUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalled();
    });
  });

  describe('logoutAllDevices - Edge cases', () => {
    it('should handle database connection errors when finding user', async () => {
      mockAuthRepository.findUserById.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(logoutUseCase.logoutAllDevices(mockUser.id)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle database errors when deleting tokens', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.deleteAllRefreshTokens.mockRejectedValue(
        new Error('Deletion failed')
      );

      await expect(logoutUseCase.logoutAllDevices(mockUser.id)).rejects.toThrow(
        'Deletion failed'
      );
    });

    it('should handle concurrent logoutAllDevices calls', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const promise1 = logoutUseCase.logoutAllDevices(mockUser.id);
      const promise2 = logoutUseCase.logoutAllDevices(mockUser.id);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledTimes(2);
    });

    it('should handle user with no tokens to delete', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.deleteAllRefreshTokens.mockResolvedValue(undefined);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
    });

    it('should handle network timeout errors', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);
      mockAuthRepository.deleteAllRefreshTokens.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(logoutUseCase.logoutAllDevices(mockUser.id)).rejects.toThrow(
        'Network timeout'
      );
    });
  });

  describe('logoutAllDevices - Integration flow', () => {
    it('should execute logoutAllDevices flow in correct order', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const callOrder: string[] = [];

      mockAuthRepository.findUserById.mockImplementation(async () => {
        callOrder.push('findUser');
        return mockUser;
      });

      mockAuthRepository.deleteAllRefreshTokens.mockImplementation(async () => {
        callOrder.push('deleteAllTokens');
      });

      await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(callOrder).toEqual(['findUser', 'deleteAllTokens']);
    });

    it('should stop execution if user not found', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(logoutUseCase.logoutAllDevices(mockUser.id)).rejects.toThrow();

      expect(mockAuthRepository.deleteAllRefreshTokens).not.toHaveBeenCalled();
    });

    it('should complete successfully with valid userId', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(mockAuthRepository.findUserById).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
    });
  });

  describe('Security considerations', () => {
    it('should always attempt to revoke token even if invalid', async () => {
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await logoutUseCase.execute(validLogoutDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(
        validLogoutDto.refreshToken
      );
    });

    it('should prevent reuse of revoked tokens', async () => {
      await logoutUseCase.execute(validLogoutDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(
        validLogoutDto.refreshToken
      );
    });

    it('should handle logout without exposing user information', async () => {
      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result).not.toHaveProperty('user');
      expect(result).not.toHaveProperty('userId');
      expect(result).toEqual({
        success: true,
        message: 'Logout successful',
      });
    });

    it('should allow logout for inactive accounts', async () => {
      // Users should be able to logout even if account is disabled
      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
    });

    it('should allow logout for deleted accounts', async () => {
      // Should be able to revoke tokens even for deleted accounts
      const result = await logoutUseCase.execute(validLogoutDto);

      expect(result.success).toBe(true);
    });

    it('should revoke all tokens without checking account status', async () => {
      // logoutAllDevices should work regardless of account status
      mockAuthRepository.findUserById.mockResolvedValue({
        ...mockUser,
        active: false,
        deleted_at: new Date(),
      });

      const result = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalled();
    });
  });

  describe('Multiple logout scenarios', () => {
    it('should handle logout and logoutAllDevices independently', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const logoutResult = await logoutUseCase.execute(validLogoutDto);
      const logoutAllResult = await logoutUseCase.logoutAllDevices(mockUser.id);

      expect(logoutResult.success).toBe(true);
      expect(logoutAllResult.success).toBe(true);
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential logouts', async () => {
      await logoutUseCase.execute(validLogoutDto);
      await logoutUseCase.execute(validLogoutDto);
      await logoutUseCase.execute(validLogoutDto);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledTimes(3);
    });

    it('should handle logout for different tokens', async () => {
      const token1 = { refreshToken: 'token1' };
      const token2 = { refreshToken: 'token2' };
      const token3 = { refreshToken: 'token3' };

      await logoutUseCase.execute(token1);
      await logoutUseCase.execute(token2);
      await logoutUseCase.execute(token3);

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith('token1');
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith('token2');
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith('token3');
    });

    it('should handle logoutAllDevices for different users', async () => {
      mockAuthRepository.findUserById.mockImplementation(async (id) => {
        if (id === 1 || id === 2 || id === 3) {
          return { ...mockUser, id };
        }
        return null;
      });

      await logoutUseCase.logoutAllDevices(1);
      await logoutUseCase.logoutAllDevices(2);
      await logoutUseCase.logoutAllDevices(3);

      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(1);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(2);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(3);
    });
  });
});
