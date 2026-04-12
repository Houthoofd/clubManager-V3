/**
 * PasswordService.test.ts
 * Tests unitaires pour le service de gestion des mots de passe
 */

import { PasswordService } from '../PasswordService';

describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a valid password', async () => {
      const password = 'SecurePass123!@#';
      const hash = await PasswordService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'SecurePass123!@#';
      const hash1 = await PasswordService.hash(password);
      const hash2 = await PasswordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should throw error if password is empty', async () => {
      await expect(PasswordService.hash('')).rejects.toThrow('Password is required');
    });

    it('should throw error if password is too short', async () => {
      const shortPassword = 'Short1!';
      await expect(PasswordService.hash(shortPassword)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should throw error if password is too long', async () => {
      const longPassword = 'a'.repeat(129) + 'A1!';
      await expect(PasswordService.hash(longPassword)).rejects.toThrow(
        'Password must not exceed 128 characters'
      );
    });

    it('should hash password with exactly 8 characters', async () => {
      const password = 'Pass123!';
      const hash = await PasswordService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should hash password with exactly 128 characters', async () => {
      const password = 'A'.repeat(120) + 'a1234567!';
      const hash = await PasswordService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('compare', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'SecurePass123!@#';
      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'SecurePass123!@#';
      const wrongPassword = 'WrongPass123!@#';
      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should return false if password is empty', async () => {
      const hash = await PasswordService.hash('SecurePass123!@#');
      const isMatch = await PasswordService.compare('', hash);

      expect(isMatch).toBe(false);
    });

    it('should return false if hash is empty', async () => {
      const isMatch = await PasswordService.compare('SecurePass123!@#', '');

      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const isMatch = await PasswordService.compare('SecurePass123!@#', 'invalid-hash');

      expect(isMatch).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'SecurePass123!@#';
      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare('securepass123!@#', hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate a strong password', () => {
      const password = 'SecurePass123!@#';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without uppercase letter', () => {
      const password = 'securepass123!@#';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const password = 'SECUREPASS123!@#';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const password = 'SecurePass!@#';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const password = 'SecurePass123';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject password that is too short', () => {
      const password = 'Pass1!';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password that is too long', () => {
      const password = 'A'.repeat(129) + 'a1!';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });

    it('should reject empty password', () => {
      const password = '';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should return multiple errors for weak password', () => {
      const password = 'weak';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should validate password with exactly 8 characters', () => {
      const password = 'Pass123!';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', ';', ':', '"', '|', ',', '.', '<', '>', '/', '?'];

      specialChars.forEach(char => {
        const password = `SecurePass123${char}`;
        const result = PasswordService.validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password with default length', () => {
      const password = PasswordService.generateSecurePassword();

      expect(password).toBeDefined();
      expect(password.length).toBe(16);
    });

    it('should generate password with custom length', () => {
      const lengths = [8, 12, 20, 32];

      lengths.forEach(length => {
        const password = PasswordService.generateSecurePassword(length);
        expect(password.length).toBe(length);
      });
    });

    it('should generate password that passes validation', () => {
      const password = PasswordService.generateSecurePassword();
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should generate password with at least one uppercase letter', () => {
      const password = PasswordService.generateSecurePassword();

      expect(password).toMatch(/[A-Z]/);
    });

    it('should generate password with at least one lowercase letter', () => {
      const password = PasswordService.generateSecurePassword();

      expect(password).toMatch(/[a-z]/);
    });

    it('should generate password with at least one number', () => {
      const password = PasswordService.generateSecurePassword();

      expect(password).toMatch(/\d/);
    });

    it('should generate password with at least one special character', () => {
      const password = PasswordService.generateSecurePassword();

      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/);
    });

    it('should generate different passwords on each call', () => {
      const password1 = PasswordService.generateSecurePassword();
      const password2 = PasswordService.generateSecurePassword();
      const password3 = PasswordService.generateSecurePassword();

      expect(password1).not.toBe(password2);
      expect(password2).not.toBe(password3);
      expect(password1).not.toBe(password3);
    });

    it('should generate unique passwords in bulk', () => {
      const passwords = new Set();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        passwords.add(PasswordService.generateSecurePassword());
      }

      expect(passwords.size).toBe(iterations);
    });

    it('should generate password of minimum length (8)', () => {
      const password = PasswordService.generateSecurePassword(8);

      expect(password.length).toBe(8);

      const result = PasswordService.validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should hash and verify generated password', async () => {
      const password = PasswordService.generateSecurePassword();
      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should validate and hash strong password', async () => {
      const password = 'MySecure123!Pass';
      const validation = PasswordService.validatePasswordStrength(password);

      expect(validation.isValid).toBe(true);

      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should reject weak password before hashing', async () => {
      const weakPassword = 'weak';
      const validation = PasswordService.validatePasswordStrength(weakPassword);

      expect(validation.isValid).toBe(false);

      // Should not hash invalid password
      await expect(PasswordService.hash(weakPassword)).rejects.toThrow();
    });
  });
});
