import { RequestEmailChangeUseCase } from '../../../../../../src/modules/auth/application/use-cases/RequestEmailChangeUseCase';
import { IAuthRepository } from '../../../../../../src/modules/auth/domain/repositories/IAuthRepository';
import { EmailService } from '../../../../../../src/modules/auth/application/services/EmailService';
import { UserRole } from '@clubmanager/types';
import crypto from 'crypto';

jest.mock('../../../../../../src/modules/auth/application/services/EmailService');

describe('RequestEmailChangeUseCase', () => {
  let useCase: RequestEmailChangeUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: 1,
    email: 'old@example.com',
    first_name: 'John',
    userId: 'U-123',
    active: true,
    deleted_at: null,
    anonymized: false,
    last_name: 'Doe',
    nom_utilisateur: 'jdoe',
    password: 'pwd',
    date_of_birth: new Date(),
    genre_id: 1,
    status_id: 1,
    email_verified: true,
    est_mineur: false,
    peut_se_connecter: true,
    role_app: UserRole.MEMBER,
    date_inscription: new Date(),
    created_at: new Date()
  };

  beforeEach(() => {
    mockAuthRepository = {
      findUserById: jest.fn(),
      emailExists: jest.fn(),
      storeEmailChangeToken: jest.fn(),
    } as unknown as jest.Mocked<IAuthRepository>;

    mockEmailService = {
      sendEmailChangeConfirmationEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    (EmailService as jest.Mock).mockImplementation(() => mockEmailService);
    
    jest.spyOn(crypto, 'randomBytes').mockImplementation(() => Buffer.from('mocked-token-hex', 'utf8') as any);

    useCase = new RequestEmailChangeUseCase(mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully request email change', async () => {
    mockAuthRepository.findUserById.mockResolvedValue(mockUser);
    mockAuthRepository.emailExists.mockResolvedValue(false);

    await useCase.execute(1, 'NEW@example.com');

    expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(1);
    expect(mockAuthRepository.emailExists).toHaveBeenCalledWith('new@example.com');
    expect(mockAuthRepository.storeEmailChangeToken).toHaveBeenCalledWith(
      1,
      '6d6f636b65642d746f6b656e2d686578',
      'new@example.com',
      expect.any(Date)
    );
    expect(mockEmailService.sendEmailChangeConfirmationEmail).toHaveBeenCalledWith(
      'new@example.com',
      'John',
      expect.stringContaining('6d6f636b65642d746f6b656e2d686578')
    );
  });

  it('should throw error if user not found', async () => {
    mockAuthRepository.findUserById.mockResolvedValue(null);

    await expect(useCase.execute(1, 'new@example.com')).rejects.toThrow('USER_NOT_FOUND');
  });

  it('should throw error if new email is same as old email', async () => {
    mockAuthRepository.findUserById.mockResolvedValue(mockUser);

    await expect(useCase.execute(1, 'OLD@example.com')).rejects.toThrow('EMAIL_SAME_AS_CURRENT');
  });

  it('should throw error if email is already taken', async () => {
    mockAuthRepository.findUserById.mockResolvedValue(mockUser);
    mockAuthRepository.emailExists.mockResolvedValue(true);

    await expect(useCase.execute(1, 'taken@example.com')).rejects.toThrow('EMAIL_ALREADY_TAKEN');
  });
});
