import { TokenService } from '../../../../../../src/modules/auth/application/services/TokenService';
import { EmailVerificationTokenRepository } from '../../../../../../src/modules/auth/infrastructure/repositories/EmailVerificationTokenRepository';
import { PasswordResetTokenRepository } from '../../../../../../src/modules/auth/infrastructure/repositories/PasswordResetTokenRepository';

jest.mock('../../../../../../src/modules/auth/infrastructure/repositories/EmailVerificationTokenRepository');
jest.mock('../../../../../../src/modules/auth/infrastructure/repositories/PasswordResetTokenRepository');

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockEmailRepo: jest.Mocked<EmailVerificationTokenRepository>;
  let mockPasswordRepo: jest.Mocked<PasswordResetTokenRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailRepo = new EmailVerificationTokenRepository() as jest.Mocked<EmailVerificationTokenRepository>;
    mockPasswordRepo = new PasswordResetTokenRepository() as jest.Mocked<PasswordResetTokenRepository>;

    // Instantiate service and inject the mocked repos. 
    tokenService = new TokenService();
    (tokenService as any).emailVerificationTokenRepo = mockEmailRepo;
    (tokenService as any).passwordResetTokenRepo = mockPasswordRepo;
  });

  describe('Email Verification Tokens', () => {
    it('should generate an email verification token', async () => {
      mockEmailRepo.invalidateUserTokens.mockResolvedValue();
      mockEmailRepo.create.mockResolvedValue(123);

      const result = await tokenService.generateEmailVerificationToken(1, 'test@example.com');
      
      expect(result.token).toBeDefined();
      expect(result.token.length).toBe(64); // 32 bytes hex
      expect(result.tokenId).toBe(123);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockEmailRepo.invalidateUserTokens).toHaveBeenCalledWith(1);
      expect(mockEmailRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        email: 'test@example.com',
        hashedToken: expect.any(String),
      }));
    });

    it('should validate a valid email token', async () => {
      mockEmailRepo.findByToken.mockResolvedValue({
        id: 1,
        userId: 1,
        email: 'test@example.com',
        hashedToken: 'somehash',
        expiresAt: new Date(Date.now() + 100000), // future
        createdAt: new Date(),
        usedAt: null
      });

      const result = await tokenService.validateEmailVerificationToken('plaintoken');
      
      expect(result.valid).toBe(true);
      expect(result.token?.id).toBe(1);
    });

    it('should reject non-existent token', async () => {
      mockEmailRepo.findByToken.mockResolvedValue(null);
      const result = await tokenService.validateEmailVerificationToken('plaintoken');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_NOT_FOUND');
    });

    it('should reject already used token', async () => {
      mockEmailRepo.findByToken.mockResolvedValue({
        id: 1, userId: 1, email: 't@t.com', hashedToken: 'x',
        expiresAt: new Date(Date.now() + 100000), createdAt: new Date(),
        usedAt: new Date()
      });
      const result = await tokenService.validateEmailVerificationToken('plaintoken');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_ALREADY_USED');
    });

    it('should reject expired token', async () => {
      mockEmailRepo.findByToken.mockResolvedValue({
        id: 1, userId: 1, email: 't@t.com', hashedToken: 'x',
        expiresAt: new Date(Date.now() - 100000), createdAt: new Date(),
        usedAt: null
      });
      const result = await tokenService.validateEmailVerificationToken('plaintoken');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_EXPIRED');
    });

    it('should mark email token as used', async () => {
      mockEmailRepo.markAsUsed.mockResolvedValue();
      await tokenService.markEmailVerificationTokenAsUsed(1);
      expect(mockEmailRepo.markAsUsed).toHaveBeenCalledWith(1);
    });

    it('should get pending email verification token', async () => {
      const token = { id: 1 } as any;
      mockEmailRepo.findPendingByUserId.mockResolvedValue(token);
      const result = await tokenService.getPendingEmailVerificationToken(1);
      expect(result).toBe(token);
    });
  });

  describe('Password Reset Tokens', () => {
    it('should generate a password reset token', async () => {
      mockPasswordRepo.invalidateUserTokens.mockResolvedValue();
      mockPasswordRepo.create.mockResolvedValue(456);

      const result = await tokenService.generatePasswordResetToken(1, 'test@example.com', '127.0.0.1', 'agent');
      
      expect(result.token).toBeDefined();
      expect(result.tokenId).toBe(456);
      expect(mockPasswordRepo.invalidateUserTokens).toHaveBeenCalledWith(1);
      expect(mockPasswordRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        email: 'test@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'agent',
      }));
    });

    it('should validate password reset token', async () => {
      mockPasswordRepo.findByToken.mockResolvedValue({
        id: 1, userId: 1, email: 't', hashedToken: 'x',
        expiresAt: new Date(Date.now() + 100000), createdAt: new Date(), usedAt: null, ipAddress: '', userAgent: ''
      });
      const result = await tokenService.validatePasswordResetToken('plain');
      expect(result.valid).toBe(true);
    });

    it('should reject not found password reset token', async () => {
      mockPasswordRepo.findByToken.mockResolvedValue(null);
      const result = await tokenService.validatePasswordResetToken('plain');
      expect(result.error).toBe('TOKEN_NOT_FOUND');
    });

    it('should reject already used password reset token', async () => {
      mockPasswordRepo.findByToken.mockResolvedValue({
        id: 1, userId: 1, email: 't', hashedToken: 'x',
        expiresAt: new Date(Date.now() + 100000), createdAt: new Date(), usedAt: new Date(), ipAddress: '', userAgent: ''
      });
      const result = await tokenService.validatePasswordResetToken('plain');
      expect(result.error).toBe('TOKEN_ALREADY_USED');
    });

    it('should reject expired password reset token', async () => {
      mockPasswordRepo.findByToken.mockResolvedValue({
        id: 1, userId: 1, email: 't', hashedToken: 'x',
        expiresAt: new Date(Date.now() - 100000), createdAt: new Date(), usedAt: null, ipAddress: '', userAgent: ''
      });
      const result = await tokenService.validatePasswordResetToken('plain');
      expect(result.error).toBe('TOKEN_EXPIRED');
    });

    it('should mark password reset token as used', async () => {
      mockPasswordRepo.markAsUsed.mockResolvedValue();
      await tokenService.markPasswordResetTokenAsUsed(1);
      expect(mockPasswordRepo.markAsUsed).toHaveBeenCalledWith(1);
    });

    it('should get pending password reset token', async () => {
      const token = { id: 1 } as any;
      mockPasswordRepo.findPendingByUserId.mockResolvedValue(token);
      const result = await tokenService.getPendingPasswordResetToken(1);
      expect(result).toBe(token);
    });
  });

  describe('Rate Limiting', () => {
    it('checkPasswordResetRateLimit should allow if within limits', async () => {
      mockPasswordRepo.getRecentAttemptsByEmail.mockResolvedValue([
        { id: 1, email: 't', ipAddress: '', userAgent: '', createdAt: new Date() } as any
      ]);
      const result = await tokenService.checkPasswordResetRateLimit('t', 3);
      expect(result.allowed).toBe(true);
      expect(result.attemptsCount).toBe(1);
    });

    it('checkPasswordResetRateLimit should deny if over limits', async () => {
      const oldDate = new Date();
      oldDate.setMinutes(oldDate.getMinutes() - 10);
      
      mockPasswordRepo.getRecentAttemptsByEmail.mockResolvedValue([
        { id: 1, email: 't', createdAt: oldDate } as any,
        { id: 2, email: 't', createdAt: new Date() } as any,
        { id: 3, email: 't', createdAt: new Date() } as any
      ]);
      
      const result = await tokenService.checkPasswordResetRateLimit('t', 3, 15);
      expect(result.allowed).toBe(false);
      expect(result.attemptsCount).toBe(3);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('checkPasswordResetRateLimit should deny but handle missing oldest attempt if array is weirdly empty despite length check', async () => {
      mockPasswordRepo.getRecentAttemptsByEmail.mockResolvedValue([
        undefined as any,
        undefined as any,
        undefined as any
      ]);
      const result = await tokenService.checkPasswordResetRateLimit('t', 3, 15);
      expect(result.allowed).toBe(false);
    });

    it('checkIpAddressRateLimit should allow if under limit', async () => {
      mockPasswordRepo.countAttemptsByIpAddress.mockResolvedValue(5);
      const result = await tokenService.checkIpAddressRateLimit('127.0.0.1', 10);
      expect(result.allowed).toBe(true);
      expect(result.attemptsCount).toBe(5);
    });

    it('checkIpAddressRateLimit should deny if over limit', async () => {
      mockPasswordRepo.countAttemptsByIpAddress.mockResolvedValue(10);
      const result = await tokenService.checkIpAddressRateLimit('127.0.0.1', 10);
      expect(result.allowed).toBe(false);
      expect(result.attemptsCount).toBe(10);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup expired email tokens', async () => {
      mockEmailRepo.deleteExpiredTokens.mockResolvedValue(5);
      const result = await tokenService.cleanupExpiredEmailVerificationTokens();
      expect(result).toBe(5);
      expect(mockEmailRepo.deleteExpiredTokens).toHaveBeenCalled();
    });

    it('should cleanup expired password tokens', async () => {
      mockPasswordRepo.deleteExpiredTokens.mockResolvedValue(3);
      const result = await tokenService.cleanupExpiredPasswordResetTokens();
      expect(result).toBe(3);
      expect(mockPasswordRepo.deleteExpiredTokens).toHaveBeenCalled();
    });
  });
});
