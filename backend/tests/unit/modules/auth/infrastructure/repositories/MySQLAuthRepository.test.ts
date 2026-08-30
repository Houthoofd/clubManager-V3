import { MySQLAuthRepository } from '../../../../../../src/modules/auth/infrastructure/repositories/MySQLAuthRepository';
import { pool } from '../../../../../../src/core/database/connection';

jest.mock('../../../../../../src/core/database/connection', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn(),
  },
}));

describe('MySQLAuthRepository', () => {
  let repository: MySQLAuthRepository;
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MySQLAuthRepository();

    mockConnection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  const mockUserRow = {
    id: 1, userId: 'U-2023-0001', first_name: 'John', last_name: 'Doe',
    nom_utilisateur: 'jdoe', email: 'test@example.com', password: 'hash',
    date_of_birth: new Date(), genre_id: 1, status_id: 1, active: 1, email_verified: 1,
    est_mineur: 0, peut_se_connecter: 1, role_app: 'member', anonymized: 0,
    date_inscription: new Date(), created_at: new Date()
  };

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ count: 0 }]]) // COUNT query
        .mockResolvedValueOnce([[{ id: 1 }]]) // statusResult
        .mockResolvedValueOnce([{ insertId: 1 }]); // INSERT query

      // findUserById mock
      (pool.query as jest.Mock).mockResolvedValueOnce([[mockUserRow]]);

      const user = await repository.createUser({
        first_name: 'John', last_name: 'Doe', email: 'test@example.com',
        password: 'pwd', date_of_birth: new Date(), genre_id: 1
      });

      expect(user).toBeDefined();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should rollback and throw on error', async () => {
      mockConnection.query.mockRejectedValue(new Error('DB Error'));

      await expect(repository.createUser({
        first_name: 'John', last_name: 'Doe', email: 'test@example.com',
        password: 'pwd', date_of_birth: new Date(), genre_id: 1
      })).rejects.toThrow('DB Error');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should throw if user not found after creation', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([[]]) // statusResult empty
        .mockResolvedValueOnce([{ insertId: 1 }]);
      
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]); // findUserById returns empty

      await expect(repository.createUser({
        first_name: 'John', last_name: 'Doe', email: 'test@example.com',
        password: 'pwd', date_of_birth: new Date(), genre_id: 1
      })).rejects.toThrow('Failed to retrieve created user');
    });
  });

  describe('Find User Methods', () => {
    it('findUserByEmail should return user', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[mockUserRow]]);
      const result = await repository.findUserByEmail('test@example.com');
      expect(result?.id).toBe(1);
    });

    it('findUserByEmail should return null if not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[]]);
      const result = await repository.findUserByEmail('test@example.com');
      expect(result).toBeNull();
    });

    it('findUserById should return user', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[mockUserRow]]);
      const result = await repository.findUserById(1);
      expect(result?.id).toBe(1);
    });

    it('findUserById should return null if not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[]]);
      const result = await repository.findUserById(1);
      expect(result).toBeNull();
    });

    it('findUserByUserId should return user', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[mockUserRow]]);
      const result = await repository.findUserByUserId('U-2023-0001');
      expect(result?.id).toBe(1);
    });

    it('findUserByUserId should return null if not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[]]);
      const result = await repository.findUserByUserId('U-2023-0001');
      expect(result).toBeNull();
    });

    it('emailExists should return true if count > 0', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[{ count: 1 }]]);
      const result = await repository.emailExists('test@example.com');
      expect(result).toBe(true);
    });

    it('emailExists should return false if count === 0', async () => {
      (pool.query as jest.Mock).mockResolvedValue([[{ count: 0 }]]);
      const result = await repository.emailExists('test@example.com');
      expect(result).toBe(false);
    });
  });

  describe('Update Methods', () => {
    it('updatePassword should execute UPDATE', async () => {
      await repository.updatePassword(1, 'newHash');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE utilisateurs SET password'), ['newHash', 1]);
    });

    it('updateLastLogin should execute UPDATE', async () => {
      await repository.updateLastLogin(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE utilisateurs SET derniere_connexion'), [1]);
    });
  });

  describe('Email Verification', () => {
    it('markEmailAsVerified', async () => {
      await repository.markEmailAsVerified(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('email_verified = TRUE'), [1]);
    });

    it('storeEmailVerificationToken', async () => {
      await repository.storeEmailVerificationToken(1, 'token', new Date(), 'e@e.com');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO email_validation_tokens'), expect.any(Array));
    });

    it('validateEmailVerificationToken returns userId if valid', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ user_id: 1 }]]);
      const result = await repository.validateEmailVerificationToken('token');
      expect(result).toBe(1);
      expect(pool.query).toHaveBeenCalledTimes(2); // One for select, one for delete
    });

    it('validateEmailVerificationToken returns null if invalid', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await repository.validateEmailVerificationToken('token');
      expect(result).toBeNull();
    });

    it('deleteEmailVerificationToken', async () => {
      await repository.deleteEmailVerificationToken('token');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM email_validation_tokens'), expect.any(Array));
    });
  });

  describe('Password Reset', () => {
    it('storePasswordResetToken', async () => {
      await repository.storePasswordResetToken(1, 'token', new Date());
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO password_reset_tokens'), expect.any(Array));
    });

    it('validatePasswordResetToken returns userId', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ user_id: 1 }]]);
      const result = await repository.validatePasswordResetToken('token');
      expect(result).toBe(1);
    });

    it('validatePasswordResetToken returns null', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await repository.validatePasswordResetToken('token');
      expect(result).toBeNull();
    });

    it('deletePasswordResetToken', async () => {
      await repository.deletePasswordResetToken('token');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM password_reset_tokens'), expect.any(Array));
    });

    it('deleteAllPasswordResetTokens', async () => {
      await repository.deleteAllPasswordResetTokens(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM password_reset_tokens WHERE user_id'), [1]);
    });
  });

  describe('Refresh Tokens', () => {
    it('storeRefreshToken', async () => {
      await repository.storeRefreshToken(1, 'token', new Date());
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO refresh_tokens'), expect.any(Array));
    });

    it('validateRefreshToken returns userId', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ user_id: 1 }]]);
      const result = await repository.validateRefreshToken('token');
      expect(result).toBe(1);
    });

    it('validateRefreshToken returns null', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await repository.validateRefreshToken('token');
      expect(result).toBeNull();
    });

    it('deleteRefreshToken', async () => {
      await repository.deleteRefreshToken('token');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash'), expect.any(Array));
    });

    it('deleteAllRefreshTokens', async () => {
      await repository.deleteAllRefreshTokens(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id'), [1]);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should cleanup using transaction', async () => {
      await repository.cleanupExpiredTokens();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledTimes(3);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockConnection.query.mockRejectedValue(new Error('err'));
      await expect(repository.cleanupExpiredTokens()).rejects.toThrow();
      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe('Audit logs', () => {
    it('getLoginAttempts', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ total: 5 }]]);
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ id: 1, email: 't', success: 0, created_at: new Date() }]]);
      
      const result = await repository.getLoginAttempts({ page: 1, limit: 10, email: 't', ip: '1.1.1.1', onlyFailed: true });
      expect(result.total).toBe(5);
      expect(result.attempts.length).toBe(1);
    });

    it('getAuthAttempts', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ total: 5 }]]);
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ id: 1, email: 't', success: 0, created_at: new Date() }]]);
      
      const result = await repository.getAuthAttempts({ page: 1, limit: 10, email: 't', ip: '1.1.1.1', onlyFailed: true });
      expect(result.total).toBe(5);
      expect(result.attempts.length).toBe(1);
    });
  });

  describe('Sessions', () => {
    it('getActiveSessions', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ id: 1, created_at: new Date(), expires_at: new Date() }]]);
      const result = await repository.getActiveSessions(1);
      expect(result.length).toBe(1);
    });

    it('revokeSession returns true', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([{ affectedRows: 1 }]);
      const result = await repository.revokeSession(1, 1);
      expect(result).toBe(true);
    });

    it('revokeSession returns false', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([{ affectedRows: 0 }]);
      const result = await repository.revokeSession(1, 1);
      expect(result).toBe(false);
    });
  });

  describe('Email Change', () => {
    it('updateEmail', async () => {
      await repository.updateEmail(1, 'n@n.com');
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE utilisateurs\n       SET email'), ['n@n.com', 1]);
    });

    it('storeEmailChangeToken', async () => {
      await repository.storeEmailChangeToken(1, 't', 'n@n.com', new Date());
      expect(pool.query).toHaveBeenCalledTimes(2); // Delete then Insert
    });

    it('validateEmailChangeToken returns object', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ user_id: 1, email: 'n@n.com' }]]);
      const result = await repository.validateEmailChangeToken('t');
      expect(result).toEqual({ userId: 1, newEmail: 'n@n.com' });
    });

    it('validateEmailChangeToken returns null', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]);
      const result = await repository.validateEmailChangeToken('t');
      expect(result).toBeNull();
    });
  });
});
