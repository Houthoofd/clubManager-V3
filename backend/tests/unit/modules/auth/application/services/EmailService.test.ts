import { EmailService } from '../../../../../../src/modules/auth/application/services/EmailService';
import { Resend } from 'resend';

jest.mock('resend');

describe('EmailService', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;
  let mockSend: jest.Mock;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockSend = jest.fn();
    (Resend as jest.Mock).mockImplementation(() => {
      return {
        emails: {
          send: mockSend
        }
      };
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('Constructor behavior', () => {
    it('should throw error if production and no API key', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.RESEND_API_KEY;

      expect(() => new EmailService()).toThrow('RESEND_API_KEY is required for EmailService in production');
      expect(mockConsoleError).toHaveBeenCalledWith('RESEND_API_KEY environment variable is not set');
    });

    it('should set resend to null in dev mode without API key', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.RESEND_API_KEY;

      const service = new EmailService();
      expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY is not set'));
      expect((service as any).resend).toBeNull();
    });

    it('should initialize Resend if API key is present', () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 're_123';

      const service = new EmailService();
      expect(Resend).toHaveBeenCalledWith('re_123');
      expect((service as any).resend).not.toBeNull();
    });

    it('should respect DEV_EMAIL_OVERRIDE in dev mode', () => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_EMAIL_OVERRIDE = 'dev@test.com';
      process.env.RESEND_API_KEY = 're_123';

      const service = new EmailService();
      expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('DEV mode — tous les emails seront redirigés'));
      expect((service as any).devEmailOverride).toBe('dev@test.com');
    });
  });

  describe('Sending methods', () => {
    let service: EmailService;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 're_123';
      service = new EmailService();
    });

    describe('sendVerificationEmail', () => {
      it('should return dev-mode-no-send if resend is null', async () => {
        (service as any).resend = null;
        const result = await service.sendVerificationEmail('to@test.com', 'John', 'url', 'U-123');
        expect(result).toEqual({ success: true, messageId: 'dev-mode-no-send' });
        expect(mockConsoleLog).toHaveBeenCalled();
      });

      it('should send email and return success if result.data', async () => {
        mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });
        const result = await service.sendVerificationEmail('to@test.com', 'John', 'url', 'U-123');
        expect(result).toEqual({ success: true, messageId: 'msg_123' });
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
          to: 'to@test.com',
          subject: 'Verify Your Email Address - ClubManager',
        }));
      });

      it('should redirect if devEmailOverride is set', async () => {
        (service as any).devEmailOverride = 'dev@test.com';
        mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });
        await service.sendVerificationEmail('to@test.com', 'John', 'url', 'U-123');
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: 'dev@test.com' }));
      });

      it('should handle Resend API error', async () => {
        mockSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
        const result = await service.sendVerificationEmail('to@test.com', 'John', 'url', 'U-123');
        expect(result).toEqual({ success: false, error: 'API error' });
      });

      it('should catch exceptions', async () => {
        mockSend.mockRejectedValue(new Error('Network error'));
        const result = await service.sendVerificationEmail('to@test.com', 'John', 'url', 'U-123');
        expect(result).toEqual({ success: false, error: 'Network error' });
      });
    });

    describe('sendPasswordResetEmail', () => {
      it('should return dev-mode-no-send if resend is null', async () => {
        (service as any).resend = null;
        const result = await service.sendPasswordResetEmail('to@test.com', 'John', 'url');
        expect(result).toEqual({ success: true, messageId: 'dev-mode-no-send' });
      });

      it('should send email and return success if result.data', async () => {
        mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });
        const result = await service.sendPasswordResetEmail('to@test.com', 'John', 'url');
        expect(result).toEqual({ success: true, messageId: 'msg_123' });
      });

      it('should handle API error', async () => {
        mockSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
        const result = await service.sendPasswordResetEmail('to@test.com', 'John', 'url');
        expect(result).toEqual({ success: false, error: 'API error' });
      });

      it('should catch exceptions', async () => {
        mockSend.mockRejectedValue(new Error('Network error'));
        const result = await service.sendPasswordResetEmail('to@test.com', 'John', 'url');
        expect(result).toEqual({ success: false, error: 'Network error' });
      });
    });

    describe('sendEmailChangeConfirmationEmail', () => {
      it('should return immediately if resend is null', async () => {
        (service as any).resend = null;
        await service.sendEmailChangeConfirmationEmail('to@test.com', 'John', 'url');
        expect(mockSend).not.toHaveBeenCalled();
      });

      it('should send email successfully', async () => {
        mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });
        await service.sendEmailChangeConfirmationEmail('to@test.com', 'John', 'url');
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
          subject: 'Confirmez votre nouvelle adresse email — ClubManager',
          to: 'to@test.com'
        }));
      });

      it('should throw error if send fails', async () => {
        mockSend.mockRejectedValue(new Error('Network error'));
        await expect(service.sendEmailChangeConfirmationEmail('to@test.com', 'John', 'url')).rejects.toThrow('Network error');
      });
    });

    describe('sendPasswordChangedEmail', () => {
      it('should return dev-mode-no-send if resend is null', async () => {
        (service as any).resend = null;
        const result = await service.sendPasswordChangedEmail('to@test.com', 'John');
        expect(result).toEqual({ success: true, messageId: 'dev-mode-no-send' });
      });

      it('should send email and return success if result.data', async () => {
        mockSend.mockResolvedValue({ data: { id: 'msg_123' }, error: null });
        const result = await service.sendPasswordChangedEmail('to@test.com', 'John');
        expect(result).toEqual({ success: true, messageId: 'msg_123' });
      });

      it('should handle API error', async () => {
        mockSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
        const result = await service.sendPasswordChangedEmail('to@test.com', 'John');
        expect(result).toEqual({ success: false, error: 'API error' });
      });

      it('should catch exceptions', async () => {
        mockSend.mockRejectedValue(new Error('Network error'));
        const result = await service.sendPasswordChangedEmail('to@test.com', 'John');
        expect(result).toEqual({ success: false, error: 'Network error' });
      });
    });

    describe('sendInvitationEmail', () => {
      it('should successfully send invitation email', async () => {
        mockSend.mockResolvedValueOnce({ data: { id: 'test-invitation-id' } });

        const result = await service.sendInvitationEmail(
          'newuser@example.com',
          'Admin Name',
          'http://localhost:5173/register',
          new Date('2025-01-01T00:00:00Z')
        );

        expect(result.success).toBe(true);
        expect(result.messageId).toBe('test-invitation-id');
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'Invitation à rejoindre ClubManager',
          html: expect.stringContaining('Admin Name'),
          text: expect.stringContaining('Admin Name')
        }));
      });

      it('should handle Resend API failure gracefully', async () => {
        mockSend.mockRejectedValueOnce(new Error('Resend API Error'));

        const result = await service.sendInvitationEmail(
          'newuser@example.com',
          'Admin Name',
          'http://localhost:5173/register',
          new Date('2025-01-01T00:00:00Z')
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Error: Resend API Error');
      });

      it('should escape HTML in inviter name to prevent XSS', async () => {
        mockSend.mockResolvedValueOnce({ data: { id: 'test-invitation-id' } });

        await service.sendInvitationEmail(
          'newuser@example.com',
          '<script>alert("xss")</script>',
          'http://localhost:5173/register',
          new Date('2025-01-01T00:00:00Z')
        );

        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
          html: expect.stringContaining('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
        }));
      });
    });
  });
});
