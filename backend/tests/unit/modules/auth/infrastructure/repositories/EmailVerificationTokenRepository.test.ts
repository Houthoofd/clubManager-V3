import { EmailVerificationTokenRepository } from '../../../../../../src/modules/auth/infrastructure/repositories/EmailVerificationTokenRepository';
import { pool } from '../../../../../../src/core/database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

jest.mock('../../../../../../src/core/database/connection', () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe('EmailVerificationTokenRepository', () => {
  let repository: EmailVerificationTokenRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new EmailVerificationTokenRepository();
  });

  describe('create', () => {
    it('should execute INSERT query and return insertId', async () => {
      const mockResult = [{ insertId: 42 }] as unknown as [ResultSetHeader, any];
      (pool.execute as jest.Mock).mockResolvedValue(mockResult);

      const date = new Date();
      const result = await repository.create({
        userId: 1,
        hashedToken: 'hash',
        email: 'test@example.com',
        expiresAt: date,
      });

      expect(result).toBe(42);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO email_verification_tokens'),
        [1, 'hash', 'test@example.com', date]
      );
    });
  });

  describe('findByToken', () => {
    it('should return token if found', async () => {
      const mockRow = { id: 1, userId: 1, token: 'hash', email: 'test@example.com' };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]] as unknown as [RowDataPacket[], any]);

      const result = await repository.findByToken('hash');
      
      expect(result).toEqual(mockRow);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE token = ?'),
        ['hash']
      );
    });

    it('should return null if token not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]] as unknown as [RowDataPacket[], any]);

      const result = await repository.findByToken('hash');
      
      expect(result).toBeNull();
    });
  });

  describe('findPendingByEmail', () => {
    it('should return token if found', async () => {
      const mockRow = { id: 1, userId: 1, email: 'test@example.com' };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]] as unknown as [RowDataPacket[], any]);

      const result = await repository.findPendingByEmail('test@example.com');
      
      expect(result).toEqual(mockRow);
    });

    it('should return null if token not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]] as unknown as [RowDataPacket[], any]);

      const result = await repository.findPendingByEmail('test@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('findPendingByUserId', () => {
    it('should return token if found', async () => {
      const mockRow = { id: 1, userId: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([[mockRow]] as unknown as [RowDataPacket[], any]);

      const result = await repository.findPendingByUserId(1);
      
      expect(result).toEqual(mockRow);
    });

    it('should return null if not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]] as unknown as [RowDataPacket[], any]);
      const result = await repository.findPendingByUserId(1);
      expect(result).toBeNull();
    });
  });

  describe('markAsUsed', () => {
    it('should update token to set used_at', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{}]);
      await repository.markAsUsed(42);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SET used_at = NOW()'),
        [42]
      );
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete and return affected rows', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 5 }] as unknown as [ResultSetHeader, any]);
      const date = new Date();
      const result = await repository.deleteExpiredTokens(date);
      expect(result).toBe(5);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM email_verification_tokens'),
        [date]
      );
    });
  });

  describe('deleteByUserId', () => {
    it('should delete and return affected rows', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 2 }] as unknown as [ResultSetHeader, any]);
      const result = await repository.deleteByUserId(1);
      expect(result).toBe(2);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM email_verification_tokens\n      WHERE user_id = ?'),
        [1]
      );
    });
  });

  describe('deleteByEmail', () => {
    it('should delete and return affected rows', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }] as unknown as [ResultSetHeader, any]);
      const result = await repository.deleteByEmail('test@example.com');
      expect(result).toBe(1);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = ?'),
        ['test@example.com']
      );
    });
  });

  describe('invalidateUserTokens', () => {
    it('should update and return affected rows', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 3 }] as unknown as [ResultSetHeader, any]);
      const result = await repository.invalidateUserTokens(1);
      expect(result).toBe(3);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SET used_at = NOW()\n      WHERE user_id = ?'),
        [1]
      );
    });
  });

  describe('hasPendingToken', () => {
    it('should return true if count > 0', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[{ count: 1 }]] as unknown as [RowDataPacket[], any]);
      const result = await repository.hasPendingToken(1);
      expect(result).toBe(true);
    });

    it('should return false if count is 0', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[{ count: 0 }]] as unknown as [RowDataPacket[], any]);
      const result = await repository.hasPendingToken(1);
      expect(result).toBe(false);
    });
    
    it('should return false if row is missing', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]] as unknown as [RowDataPacket[], any]);
      const result = await repository.hasPendingToken(1);
      expect(result).toBe(false);
    });
  });
});
