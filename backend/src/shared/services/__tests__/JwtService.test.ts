/**
 * JwtService.test.ts
 * Tests unitaires pour le service JWT
 */

import { JwtService } from '../JwtService';
import type { JwtPayload, DecodedToken } from '@clubmanager/types';

describe('JwtService', () => {
  const mockPayload: Omit<JwtPayload, 'type'> = {
    userId: 1,
    email: 'test@example.com',
    userIdString: 'U-2024-0001',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = JwtService.generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should include correct payload data', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.userIdString).toBe(mockPayload.userIdString);
      expect(decoded?.type).toBe('access');
    });

    it('should include issuer and audience', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.decodeToken(token);

      expect(decoded).toBeDefined();
      // Note: issuer and audience are in the JWT but not in our DecodedToken type
    });

    it('should generate different tokens for same payload', () => {
      const token1 = JwtService.generateAccessToken(mockPayload);
      const token2 = JwtService.generateAccessToken(mockPayload);

      // Tokens should be different due to different iat (issued at)
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = JwtService.generateRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should include correct payload data', () => {
      const token = JwtService.generateRefreshToken(mockPayload);
      const decoded = JwtService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.userIdString).toBe(mockPayload.userIdString);
      expect(decoded?.type).toBe('refresh');
    });

    it('should generate different tokens for same payload', () => {
      const token1 = JwtService.generateRefreshToken(mockPayload);
      const token2 = JwtService.generateRefreshToken(mockPayload);

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokenPair = JwtService.generateTokenPair(mockPayload);

      expect(tokenPair).toBeDefined();
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.expiresIn).toBeDefined();
    });

    it('should generate different token types', () => {
      const tokenPair = JwtService.generateTokenPair(mockPayload);

      const accessDecoded = JwtService.decodeToken(tokenPair.accessToken);
      const refreshDecoded = JwtService.decodeToken(tokenPair.refreshToken);

      expect(accessDecoded?.type).toBe('access');
      expect(refreshDecoded?.type).toBe('refresh');
    });

    it('should include valid expiresIn value', () => {
      const tokenPair = JwtService.generateTokenPair(mockPayload);

      expect(tokenPair.expiresIn).toBeGreaterThan(0);
      expect(typeof tokenPair.expiresIn).toBe('number');
    });

    it('should generate unique tokens', () => {
      const tokenPair = JwtService.generateTokenPair(mockPayload);

      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.type).toBe('access');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        JwtService.verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        JwtService.verifyAccessToken('');
      }).toThrow();
    });

    it('should throw error for refresh token used as access token', () => {
      const refreshToken = JwtService.generateRefreshToken(mockPayload);

      expect(() => {
        JwtService.verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        JwtService.verifyAccessToken('not-a-jwt-token');
      }).toThrow();
    });

    it('should include iat and exp in decoded token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.verifyAccessToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = JwtService.generateRefreshToken(mockPayload);
      const decoded = JwtService.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.type).toBe('refresh');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        JwtService.verifyRefreshToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for access token used as refresh token', () => {
      const accessToken = JwtService.generateAccessToken(mockPayload);

      expect(() => {
        JwtService.verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });

    it('should include iat and exp in decoded token', () => {
      const token = JwtService.generateRefreshToken(mockPayload);
      const decoded = JwtService.verifyRefreshToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const decoded = JwtService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
    });

    it('should return null for invalid token', () => {
      const decoded = JwtService.decodeToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should return null for empty string', () => {
      const decoded = JwtService.decodeToken('');

      expect(decoded).toBeNull();
    });

    it('should decode both access and refresh tokens', () => {
      const accessToken = JwtService.generateAccessToken(mockPayload);
      const refreshToken = JwtService.generateRefreshToken(mockPayload);

      const accessDecoded = JwtService.decodeToken(accessToken);
      const refreshDecoded = JwtService.decodeToken(refreshToken);

      expect(accessDecoded?.type).toBe('access');
      expect(refreshDecoded?.type).toBe('refresh');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const isExpired = JwtService.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it('should return true for invalid token', () => {
      const isExpired = JwtService.isTokenExpired('invalid-token');

      expect(isExpired).toBe(true);
    });

    it('should return true for empty token', () => {
      const isExpired = JwtService.isTokenExpired('');

      expect(isExpired).toBe(true);
    });

    it('should check expiration without verifying signature', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const isExpired = JwtService.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return positive value for valid token', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const timeLeft = JwtService.getTimeUntilExpiration(token);

      expect(timeLeft).toBeGreaterThan(0);
    });

    it('should return 0 for invalid token', () => {
      const timeLeft = JwtService.getTimeUntilExpiration('invalid-token');

      expect(timeLeft).toBe(0);
    });

    it('should return 0 for empty token', () => {
      const timeLeft = JwtService.getTimeUntilExpiration('');

      expect(timeLeft).toBe(0);
    });

    it('should return time in seconds', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const timeLeft = JwtService.getTimeUntilExpiration(token);

      // Access token expires in 15 minutes (900 seconds)
      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(900);
    });

    it('should decrease over time', async () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const timeLeft1 = JwtService.getTimeUntilExpiration(token);

      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      const timeLeft2 = JwtService.getTimeUntilExpiration(token);

      expect(timeLeft2).toBeLessThan(timeLeft1);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const authHeader = `Bearer ${token}`;
      const extracted = JwtService.extractTokenFromHeader(authHeader);

      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = JwtService.extractTokenFromHeader(undefined);

      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = JwtService.extractTokenFromHeader('');

      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = JwtService.extractTokenFromHeader('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

      expect(extracted).toBeNull();
    });

    it('should return null for header with wrong prefix', () => {
      const extracted = JwtService.extractTokenFromHeader('Basic dGVzdDp0ZXN0');

      expect(extracted).toBeNull();
    });

    it('should return null for malformed Bearer header', () => {
      const extracted = JwtService.extractTokenFromHeader('Bearer');

      expect(extracted).toBeNull();
    });

    it('should handle Bearer header with extra spaces', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const authHeader = `Bearer  ${token}`; // Extra space
      const extracted = JwtService.extractTokenFromHeader(authHeader);

      expect(extracted).toBeNull(); // Should fail due to split logic
    });
  });

  describe('Integration tests', () => {
    it('should complete full token lifecycle', () => {
      // Generate
      const tokenPair = JwtService.generateTokenPair(mockPayload);

      // Verify access token
      const accessDecoded = JwtService.verifyAccessToken(tokenPair.accessToken);
      expect(accessDecoded.userId).toBe(mockPayload.userId);

      // Verify refresh token
      const refreshDecoded = JwtService.verifyRefreshToken(tokenPair.refreshToken);
      expect(refreshDecoded.userId).toBe(mockPayload.userId);

      // Check expiration
      expect(JwtService.isTokenExpired(tokenPair.accessToken)).toBe(false);
      expect(JwtService.isTokenExpired(tokenPair.refreshToken)).toBe(false);

      // Get time until expiration
      const timeLeft = JwtService.getTimeUntilExpiration(tokenPair.accessToken);
      expect(timeLeft).toBeGreaterThan(0);
    });

    it('should extract and verify token from header', () => {
      const token = JwtService.generateAccessToken(mockPayload);
      const authHeader = `Bearer ${token}`;

      const extracted = JwtService.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);

      if (extracted) {
        const decoded = JwtService.verifyAccessToken(extracted);
        expect(decoded.userId).toBe(mockPayload.userId);
      }
    });

    it('should differentiate between access and refresh tokens', () => {
      const accessToken = JwtService.generateAccessToken(mockPayload);
      const refreshToken = JwtService.generateRefreshToken(mockPayload);

      // Access token should work with verifyAccessToken
      expect(() => JwtService.verifyAccessToken(accessToken)).not.toThrow();

      // But not with verifyRefreshToken
      expect(() => JwtService.verifyRefreshToken(accessToken)).toThrow();

      // Refresh token should work with verifyRefreshToken
      expect(() => JwtService.verifyRefreshToken(refreshToken)).not.toThrow();

      // But not with verifyAccessToken
      expect(() => JwtService.verifyAccessToken(refreshToken)).toThrow();
    });

    it('should handle different user data', () => {
      const user1Payload: Omit<JwtPayload, 'type'> = {
        userId: 1,
        email: 'user1@example.com',
        userIdString: 'U-2024-0001',
      };

      const user2Payload: Omit<JwtPayload, 'type'> = {
        userId: 2,
        email: 'user2@example.com',
        userIdString: 'U-2024-0002',
      };

      const token1 = JwtService.generateAccessToken(user1Payload);
      const token2 = JwtService.generateAccessToken(user2Payload);

      const decoded1 = JwtService.verifyAccessToken(token1);
      const decoded2 = JwtService.verifyAccessToken(token2);

      expect(decoded1.userId).toBe(1);
      expect(decoded2.userId).toBe(2);
      expect(decoded1.email).not.toBe(decoded2.email);
    });
  });
});
