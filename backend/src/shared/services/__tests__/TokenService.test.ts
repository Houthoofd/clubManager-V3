/**
 * TokenService.test.ts
 * Tests unitaires pour le service de gestion des tokens
 */

import { TokenService } from '../TokenService';

describe('TokenService', () => {
  describe('generateEmailVerificationToken', () => {
    it('should generate a valid email verification token', () => {
      const result = TokenService.generateEmailVerificationToken();

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate UUID v4 format token', () => {
      const result = TokenService.generateEmailVerificationToken();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(result.token).toMatch(uuidRegex);
    });

    it('should set expiration to 24 hours from now', () => {
      const before = Date.now();
      const result = TokenService.generateEmailVerificationToken();
      const after = Date.now();

      const expectedExpiry = 24 * 60 * 60 * 1000; // 24 hours in ms
      const actualExpiry = result.expiresAt.getTime() - before;

      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + (after - before) + 100);
    });

    it('should generate unique tokens', () => {
      const token1 = TokenService.generateEmailVerificationToken();
      const token2 = TokenService.generateEmailVerificationToken();
      const token3 = TokenService.generateEmailVerificationToken();

      expect(token1.token).not.toBe(token2.token);
      expect(token2.token).not.toBe(token3.token);
      expect(token1.token).not.toBe(token3.token);
    });

    it('should generate many unique tokens', () => {
      const tokens = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const result = TokenService.generateEmailVerificationToken();
        tokens.add(result.token);
      }

      expect(tokens.size).toBe(iterations);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a valid password reset token', () => {
      const result = TokenService.generatePasswordResetToken();

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate hexadecimal token of correct length', () => {
      const result = TokenService.generatePasswordResetToken();
      const hexRegex = /^[0-9a-f]+$/i;

      expect(result.token).toMatch(hexRegex);
      expect(result.token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should set expiration to 30 minutes from now', () => {
      const before = Date.now();
      const result = TokenService.generatePasswordResetToken();
      const after = Date.now();

      const expectedExpiry = 30 * 60 * 1000; // 30 minutes in ms
      const actualExpiry = result.expiresAt.getTime() - before;

      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + (after - before) + 100);
    });

    it('should generate unique tokens', () => {
      const token1 = TokenService.generatePasswordResetToken();
      const token2 = TokenService.generatePasswordResetToken();
      const token3 = TokenService.generatePasswordResetToken();

      expect(token1.token).not.toBe(token2.token);
      expect(token2.token).not.toBe(token3.token);
      expect(token1.token).not.toBe(token3.token);
    });

    it('should generate cryptographically secure tokens', () => {
      const tokens = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const result = TokenService.generatePasswordResetToken();
        tokens.add(result.token);
      }

      expect(tokens.size).toBe(iterations);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a secure token with default length', () => {
      const token = TokenService.generateSecureToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate hexadecimal token', () => {
      const token = TokenService.generateSecureToken();
      const hexRegex = /^[0-9a-f]+$/i;

      expect(token).toMatch(hexRegex);
    });

    it('should generate token with custom length', () => {
      const lengths = [8, 16, 32, 64];

      lengths.forEach(length => {
        const token = TokenService.generateSecureToken(length);
        expect(token.length).toBe(length * 2); // bytes to hex = *2
      });
    });

    it('should generate unique tokens', () => {
      const token1 = TokenService.generateSecureToken();
      const token2 = TokenService.generateSecureToken();
      const token3 = TokenService.generateSecureToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });
  });

  describe('generateUuidToken', () => {
    it('should generate a valid UUID v4', () => {
      const token = TokenService.generateUuidToken();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(token).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const token1 = TokenService.generateUuidToken();
      const token2 = TokenService.generateUuidToken();
      const token3 = TokenService.generateUuidToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('should generate many unique UUIDs', () => {
      const tokens = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        tokens.add(TokenService.generateUuidToken());
      }

      expect(tokens.size).toBe(iterations);
    });
  });

  describe('validateEmailVerificationToken', () => {
    it('should validate a valid email verification token', () => {
      const tokenData = TokenService.generateEmailVerificationToken();
      const result = TokenService.validateEmailVerificationToken(
        tokenData.token,
        tokenData.expiresAt
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty token', () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = TokenService.validateEmailVerificationToken('', expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token is required');
    });

    it('should reject invalid UUID format', () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = TokenService.validateEmailVerificationToken(
        'not-a-valid-uuid',
        expiresAt
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should reject expired token', () => {
      const tokenData = TokenService.generateEmailVerificationToken();
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      const result = TokenService.validateEmailVerificationToken(
        tokenData.token,
        expiredDate
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token has expired');
    });

    it('should reject hex token instead of UUID', () => {
      const hexToken = TokenService.generateSecureToken(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = TokenService.validateEmailVerificationToken(hexToken, expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should validate token exactly at expiration boundary', () => {
      const tokenData = TokenService.generateEmailVerificationToken();
      const exactExpiry = new Date(Date.now() + 1000); // 1 second from now

      const result = TokenService.validateEmailVerificationToken(
        tokenData.token,
        exactExpiry
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePasswordResetToken', () => {
    it('should validate a valid password reset token', () => {
      const tokenData = TokenService.generatePasswordResetToken();
      const result = TokenService.validatePasswordResetToken(
        tokenData.token,
        tokenData.expiresAt
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty token', () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const result = TokenService.validatePasswordResetToken('', expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token is required');
    });

    it('should reject invalid hex format', () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const result = TokenService.validatePasswordResetToken(
        'not-hexadecimal-token!',
        expiresAt
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should reject token with wrong length', () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const shortToken = TokenService.generateSecureToken(16); // Wrong length
      const result = TokenService.validatePasswordResetToken(shortToken, expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should reject expired token', () => {
      const tokenData = TokenService.generatePasswordResetToken();
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      const result = TokenService.validatePasswordResetToken(
        tokenData.token,
        expiredDate
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token has expired');
    });

    it('should reject UUID instead of hex token', () => {
      const uuidToken = TokenService.generateUuidToken();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      const result = TokenService.validatePasswordResetToken(uuidToken, expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future expiration date', () => {
      const futureDate = new Date(Date.now() + 60 * 1000); // 1 minute from now
      const isExpired = TokenService.isTokenExpired(futureDate);

      expect(isExpired).toBe(false);
    });

    it('should return true for past expiration date', () => {
      const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago
      const isExpired = TokenService.isTokenExpired(pastDate);

      expect(isExpired).toBe(true);
    });

    it('should return true for exact current time', async () => {
      const now = new Date();
      // Wait a tiny bit to ensure time has passed
      await new Promise(resolve => setTimeout(resolve, 10));
      const isExpired = TokenService.isTokenExpired(now);

      expect(isExpired).toBe(true);
    });

    it('should handle far future dates', () => {
      const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      const isExpired = TokenService.isTokenExpired(farFuture);

      expect(isExpired).toBe(false);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return positive value for future expiration', () => {
      const futureDate = new Date(Date.now() + 60 * 1000); // 1 minute from now
      const timeLeft = TokenService.getTimeUntilExpiration(futureDate);

      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(60 * 1000);
    });

    it('should return 0 for past expiration', () => {
      const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago
      const timeLeft = TokenService.getTimeUntilExpiration(pastDate);

      expect(timeLeft).toBe(0);
    });

    it('should return approximately correct time remaining', () => {
      const fiveMinutes = 5 * 60 * 1000;
      const futureDate = new Date(Date.now() + fiveMinutes);
      const timeLeft = TokenService.getTimeUntilExpiration(futureDate);

      expect(timeLeft).toBeGreaterThan(fiveMinutes - 100);
      expect(timeLeft).toBeLessThanOrEqual(fiveMinutes);
    });

    it('should decrease over time', async () => {
      const futureDate = new Date(Date.now() + 10 * 1000); // 10 seconds
      const timeLeft1 = TokenService.getTimeUntilExpiration(futureDate);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const timeLeft2 = TokenService.getTimeUntilExpiration(futureDate);

      expect(timeLeft2).toBeLessThan(timeLeft1);
      expect(timeLeft1 - timeLeft2).toBeGreaterThanOrEqual(900); // At least 900ms difference
    });

    it('should return 0 for exact current time', () => {
      const now = new Date();
      const timeLeft = TokenService.getTimeUntilExpiration(now);

      expect(timeLeft).toBeGreaterThanOrEqual(0);
      expect(timeLeft).toBeLessThan(100); // Should be very close to 0
    });
  });

  describe('compareTokens', () => {
    it('should return true for identical tokens', () => {
      const token = TokenService.generateSecureToken();
      const result = TokenService.compareTokens(token, token);

      expect(result).toBe(true);
    });

    it('should return false for different tokens', () => {
      const token1 = TokenService.generateSecureToken();
      const token2 = TokenService.generateSecureToken();
      const result = TokenService.compareTokens(token1, token2);

      expect(result).toBe(false);
    });

    it('should return false for empty tokens', () => {
      const result = TokenService.compareTokens('', '');

      expect(result).toBe(false);
    });

    it('should return false if one token is empty', () => {
      const token = TokenService.generateSecureToken();
      const result1 = TokenService.compareTokens(token, '');
      const result2 = TokenService.compareTokens('', token);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('should return false for tokens of different lengths', () => {
      const token1 = TokenService.generateSecureToken(16);
      const token2 = TokenService.generateSecureToken(32);
      const result = TokenService.compareTokens(token1, token2);

      expect(result).toBe(false);
    });

    it('should be case-sensitive', () => {
      const token = 'abcdef123456';
      const uppercaseToken = 'ABCDEF123456';
      const result = TokenService.compareTokens(token, uppercaseToken);

      expect(result).toBe(false);
    });

    it('should handle special characters', () => {
      const token = 'token-with-special-chars!@#$';
      const result = TokenService.compareTokens(token, token);

      expect(result).toBe(true);
    });

    it('should detect single character difference', () => {
      const token1 = 'abcdefghijklmnop';
      const token2 = 'abcdefghijklmnox'; // Last char different
      const result = TokenService.compareTokens(token1, token2);

      expect(result).toBe(false);
    });
  });

  describe('hashToken', () => {
    it('should hash a token', () => {
      const token = TokenService.generateSecureToken();
      const hash = TokenService.hashToken(token);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(token);
      expect(typeof hash).toBe('string');
    });

    it('should generate SHA-256 hash of correct length', () => {
      const token = TokenService.generateSecureToken();
      const hash = TokenService.hashToken(token);

      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should generate hexadecimal hash', () => {
      const token = TokenService.generateSecureToken();
      const hash = TokenService.hashToken(token);
      const hexRegex = /^[0-9a-f]+$/i;

      expect(hash).toMatch(hexRegex);
    });

    it('should generate same hash for same token', () => {
      const token = TokenService.generateSecureToken();
      const hash1 = TokenService.hashToken(token);
      const hash2 = TokenService.hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different tokens', () => {
      const token1 = TokenService.generateSecureToken();
      const token2 = TokenService.generateSecureToken();
      const hash1 = TokenService.hashToken(token1);
      const hash2 = TokenService.hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', () => {
      const hash = TokenService.hashToken('');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('should hash UUIDs', () => {
      const uuid = TokenService.generateUuidToken();
      const hash = TokenService.hashToken(uuid);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('should be deterministic', () => {
      const token = 'test-token-123';
      const hash1 = TokenService.hashToken(token);
      const hash2 = TokenService.hashToken(token);
      const hash3 = TokenService.hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });
  });

  describe('Integration tests', () => {
    it('should complete full email verification flow', () => {
      // Generate token
      const tokenData = TokenService.generateEmailVerificationToken();
      expect(tokenData).toBeDefined();

      // Validate token
      const validation = TokenService.validateEmailVerificationToken(
        tokenData.token,
        tokenData.expiresAt
      );
      expect(validation.isValid).toBe(true);

      // Check expiration
      expect(TokenService.isTokenExpired(tokenData.expiresAt)).toBe(false);

      // Get time remaining
      const timeLeft = TokenService.getTimeUntilExpiration(tokenData.expiresAt);
      expect(timeLeft).toBeGreaterThan(0);

      // Hash for storage
      const hash = TokenService.hashToken(tokenData.token);
      expect(hash).toBeDefined();
    });

    it('should complete full password reset flow', () => {
      // Generate token
      const tokenData = TokenService.generatePasswordResetToken();
      expect(tokenData).toBeDefined();

      // Validate token
      const validation = TokenService.validatePasswordResetToken(
        tokenData.token,
        tokenData.expiresAt
      );
      expect(validation.isValid).toBe(true);

      // Hash for storage
      const hash = TokenService.hashToken(tokenData.token);
      expect(hash).toBeDefined();

      // Compare hashed tokens
      const hash2 = TokenService.hashToken(tokenData.token);
      const areEqual = TokenService.compareTokens(hash, hash2);
      expect(areEqual).toBe(true);
    });

    it('should handle token expiration correctly', async () => {
      // Create token that expires in 1 second
      const token = TokenService.generateSecureToken();
      const expiresAt = new Date(Date.now() + 1000);

      // Should be valid initially
      expect(TokenService.isTokenExpired(expiresAt)).toBe(false);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be expired now
      expect(TokenService.isTokenExpired(expiresAt)).toBe(true);
      expect(TokenService.getTimeUntilExpiration(expiresAt)).toBe(0);
    });

    it('should differentiate between email and password reset tokens', () => {
      const emailToken = TokenService.generateEmailVerificationToken();
      const passwordToken = TokenService.generatePasswordResetToken();

      // Email token is UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(emailToken.token).toMatch(uuidRegex);

      // Password token is hex
      const hexRegex = /^[0-9a-f]+$/i;
      expect(passwordToken.token).toMatch(hexRegex);
      expect(passwordToken.token.length).toBe(64);

      // Should not validate cross-type
      const emailValidation = TokenService.validatePasswordResetToken(
        emailToken.token,
        emailToken.expiresAt
      );
      expect(emailValidation.isValid).toBe(false);
    });
  });
});
