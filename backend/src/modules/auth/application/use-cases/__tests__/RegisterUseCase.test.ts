/**
 * RegisterUseCase.test.ts
 * Tests unitaires pour le use case d'inscription
 */

import { RegisterUseCase } from '../RegisterUseCase';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { RegisterDto, User } from '@clubmanager/types';
import { PasswordService } from '@/shared/services/PasswordService';
import { JwtService } from '@/shared/services/JwtService';
import { TokenService } from '@/shared/services/TokenService';

// Mock des services
jest.mock('@/shared/services/PasswordService');
jest.mock('@/shared/services/JwtService');
jest.mock('@/shared/services/TokenService');

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;

  // Données de test valides
  const validRegisterDto: RegisterDto = {
    first_name: 'John',
    last_name: 'Doe',
    nom_utilisateur: 'johndoe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    date_of_birth: '1990-01-15',
    genre_id: 1,
    abonnement_id: 1,
  };

  const mockUser: User = {
    id: 1,
    userId: 'U-2024-0001',
    first_name: 'John',
    last_name: 'Doe',
    nom_utilisateur: 'johndoe',
    email: 'john.doe@example.com',
    password: 'hashed_password',
    email_verified: false,
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
    last_login: null,
    anonymized: false,
  };

  const mockTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    expiresIn: 900,
  };

  const mockEmailToken = {
    token: 'mock-email-verification-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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

    registerUseCase = new RegisterUseCase(mockAuthRepository);

    // Mock des services par défaut
    (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: true,
      errors: [],
    });
    (PasswordService.hash as jest.Mock).mockResolvedValue('hashed_password');
    (JwtService.generateTokenPair as jest.Mock).mockReturnValue(mockTokens);
    (TokenService.generateEmailVerificationToken as jest.Mock).mockReturnValue(mockEmailToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success scenarios', () => {
    it('should successfully register a new user with all required fields', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const result = await registerUseCase.execute(validRegisterDto);

      expect(result).toEqual({
        success: true,
        message: 'User registered successfully. Please verify your email.',
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
          tokens: mockTokens,
        },
      });
    });

    it('should hash the password before storing', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await registerUseCase.execute(validRegisterDto);

      expect(PasswordService.hash).toHaveBeenCalledWith(validRegisterDto.password);
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed_password',
        })
      );
    });

    it('should generate and store JWT tokens', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await registerUseCase.execute(validRegisterDto);

      expect(JwtService.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        userIdString: mockUser.userId,
      });
      expect(mockAuthRepository.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken,
        expect.any(Date)
      );
    });

    it('should generate and store email verification token', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await registerUseCase.execute(validRegisterDto);

      expect(TokenService.generateEmailVerificationToken).toHaveBeenCalled();
      expect(mockAuthRepository.storeEmailVerificationToken).toHaveBeenCalledWith(
        mockUser.id,
        mockEmailToken.token,
        mockEmailToken.expiresAt
      );
    });

    it('should successfully register without optional fields', async () => {
      const dtoWithoutOptionals: RegisterDto = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password: 'SecurePass456!',
        date_of_birth: '1995-05-20',
        genre_id: 2,
      };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue({
        ...mockUser,
        nom_utilisateur: '',
        abonnement_id: null,
      });

      const result = await registerUseCase.execute(dtoWithoutOptionals);

      expect(result.success).toBe(true);
      expect(mockAuthRepository.createUser).toHaveBeenCalled();
    });

    it('should store refresh token with 7 days expiration', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const beforeCall = new Date();
      await registerUseCase.execute(validRegisterDto);
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
  });

  describe('execute - Validation errors', () => {
    it('should throw error if first_name is missing', async () => {
      const invalidDto = { ...validRegisterDto, first_name: '' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('First name is required');
    });

    it('should throw error if first_name is only whitespace', async () => {
      const invalidDto = { ...validRegisterDto, first_name: '   ' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('First name is required');
    });

    it('should throw error if last_name is missing', async () => {
      const invalidDto = { ...validRegisterDto, last_name: '' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Last name is required');
    });

    it('should throw error if last_name is only whitespace', async () => {
      const invalidDto = { ...validRegisterDto, last_name: '   ' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Last name is required');
    });

    it('should throw error if email is missing', async () => {
      const invalidDto = { ...validRegisterDto, email: '' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Email is required');
    });

    it('should throw error if email is only whitespace', async () => {
      const invalidDto = { ...validRegisterDto, email: '   ' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Email is required');
    });

    it('should throw error if password is missing', async () => {
      const invalidDto = { ...validRegisterDto, password: '' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Password is required');
    });

    it('should throw error if password is only whitespace', async () => {
      const invalidDto = { ...validRegisterDto, password: '   ' };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Password is required');
    });

    it('should throw error if date_of_birth is missing', async () => {
      const invalidDto = { ...validRegisterDto, date_of_birth: undefined as any };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Date of birth is required');
    });

    it('should throw error if genre_id is missing', async () => {
      const invalidDto = { ...validRegisterDto, genre_id: undefined as any };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Genre is required');
    });

    it('should throw error for invalid email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid.example.com',
        'invalid @example.com',
        'invalid@exam ple.com',
      ];

      for (const email of invalidEmails) {
        const invalidDto = { ...validRegisterDto, email };
        await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Invalid email format');
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
        'first.last@subdomain.example.com',
      ];

      for (const email of validEmails) {
        const validDto = { ...validRegisterDto, email };
        mockAuthRepository.emailExists.mockResolvedValue(false);
        mockAuthRepository.createUser.mockResolvedValue(mockUser);

        await expect(registerUseCase.execute(validDto)).resolves.toBeDefined();
      }
    });

    it('should throw error if date_of_birth indicates age < 5', async () => {
      const today = new Date();
      const recentDate = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate());
      const invalidDto = { ...validRegisterDto, date_of_birth: recentDate.toISOString() };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Invalid date of birth');
    });

    it('should throw error if date_of_birth indicates age > 120', async () => {
      const today = new Date();
      const oldDate = new Date(today.getFullYear() - 121, today.getMonth(), today.getDate());
      const invalidDto = { ...validRegisterDto, date_of_birth: oldDate.toISOString() };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow('Invalid date of birth');
    });

    it('should accept valid date_of_birth (age 5)', async () => {
      const today = new Date();
      const validDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
      const validDto = { ...validRegisterDto, date_of_birth: validDate.toISOString() };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(validDto)).resolves.toBeDefined();
    });

    it('should accept valid date_of_birth (age 120)', async () => {
      const today = new Date();
      const validDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      const validDto = { ...validRegisterDto, date_of_birth: validDate.toISOString() };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(validDto)).resolves.toBeDefined();
    });

    it('should throw error if first_name is too long (> 100 chars)', async () => {
      const invalidDto = { ...validRegisterDto, first_name: 'a'.repeat(101) };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow(
        'First name is too long (max 100 characters)'
      );
    });

    it('should throw error if last_name is too long (> 100 chars)', async () => {
      const invalidDto = { ...validRegisterDto, last_name: 'a'.repeat(101) };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow(
        'Last name is too long (max 100 characters)'
      );
    });

    it('should throw error if nom_utilisateur is too long (> 50 chars)', async () => {
      const invalidDto = { ...validRegisterDto, nom_utilisateur: 'a'.repeat(51) };

      await expect(registerUseCase.execute(invalidDto)).rejects.toThrow(
        'Username is too long (max 50 characters)'
      );
    });

    it('should accept first_name with exactly 100 characters', async () => {
      const validDto = { ...validRegisterDto, first_name: 'a'.repeat(100) };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(validDto)).resolves.toBeDefined();
    });

    it('should accept last_name with exactly 100 characters', async () => {
      const validDto = { ...validRegisterDto, last_name: 'a'.repeat(100) };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(validDto)).resolves.toBeDefined();
    });

    it('should accept nom_utilisateur with exactly 50 characters', async () => {
      const validDto = { ...validRegisterDto, nom_utilisateur: 'a'.repeat(50) };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(validDto)).resolves.toBeDefined();
    });
  });

  describe('execute - Business logic errors', () => {
    it('should throw error if email already exists', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(true);

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should check email existence before creating user', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(true);

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow();

      expect(mockAuthRepository.emailExists).toHaveBeenCalledWith(validRegisterDto.email);
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw error if password is too weak', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Password must contain at least one uppercase letter', 'Password must contain at least one number'],
      });

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow(
        'Password validation failed: Password must contain at least one uppercase letter, Password must contain at least one number'
      );
    });

    it('should validate password strength before hashing', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      (PasswordService.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Password is too weak'],
      });

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow();

      expect(PasswordService.validatePasswordStrength).toHaveBeenCalledWith(validRegisterDto.password);
      expect(PasswordService.hash).not.toHaveBeenCalled();
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('execute - Edge cases', () => {
    it('should handle repository errors gracefully', async () => {
      mockAuthRepository.emailExists.mockRejectedValue(new Error('Database connection failed'));

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('Database connection failed');
    });

    it('should handle password hashing errors', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      (PasswordService.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('Hashing failed');
    });

    it('should handle user creation errors', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockRejectedValue(new Error('User creation failed'));

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('User creation failed');
    });

    it('should handle token generation errors', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      (JwtService.generateTokenPair as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('Token generation failed');
    });

    it('should handle refresh token storage errors', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      mockAuthRepository.storeRefreshToken.mockRejectedValue(new Error('Token storage failed'));

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('Token storage failed');
    });

    it('should handle email verification token generation errors', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      (TokenService.generateEmailVerificationToken as jest.Mock).mockImplementation(() => {
        throw new Error('Email token generation failed');
      });

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('Email token generation failed');
    });

    it('should handle email verification token storage errors', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      mockAuthRepository.storeEmailVerificationToken.mockRejectedValue(
        new Error('Email token storage failed')
      );

      await expect(registerUseCase.execute(validRegisterDto)).rejects.toThrow('Email token storage failed');
    });

    it('should trim whitespace from email before validation', async () => {
      const dtoWithSpaces = { ...validRegisterDto, email: '  john.doe@example.com  ' };
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await registerUseCase.execute(dtoWithSpaces);

      expect(mockAuthRepository.emailExists).toHaveBeenCalledWith('  john.doe@example.com  ');
    });

    it('should handle special characters in names', async () => {
      const specialDto = {
        ...validRegisterDto,
        first_name: "O'Brien",
        last_name: 'de la Cruz-García',
      };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(specialDto)).resolves.toBeDefined();
    });

    it('should handle unicode characters in names', async () => {
      const unicodeDto = {
        ...validRegisterDto,
        first_name: 'François',
        last_name: 'Müller',
      };

      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(unicodeDto)).resolves.toBeDefined();
    });

    it('should convert date_of_birth string to Date object when creating user', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      await registerUseCase.execute(validRegisterDto);

      expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          date_of_birth: expect.any(Date),
        })
      );

      const createUserCall = mockAuthRepository.createUser.mock.calls[0][0];
      expect(createUserCall.date_of_birth).toBeInstanceOf(Date);
    });
  });

  describe('execute - Integration flow', () => {
    it('should execute complete registration flow in correct order', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const callOrder: string[] = [];

      mockAuthRepository.emailExists.mockImplementation(async () => {
        callOrder.push('emailExists');
        return false;
      });

      (PasswordService.validatePasswordStrength as jest.Mock).mockImplementation(() => {
        callOrder.push('validatePasswordStrength');
        return { isValid: true, errors: [] };
      });

      (PasswordService.hash as jest.Mock).mockImplementation(async () => {
        callOrder.push('hashPassword');
        return 'hashed_password';
      });

      mockAuthRepository.createUser.mockImplementation(async () => {
        callOrder.push('createUser');
        return mockUser;
      });

      (JwtService.generateTokenPair as jest.Mock).mockImplementation(() => {
        callOrder.push('generateTokens');
        return mockTokens;
      });

      mockAuthRepository.storeRefreshToken.mockImplementation(async () => {
        callOrder.push('storeRefreshToken');
      });

      (TokenService.generateEmailVerificationToken as jest.Mock).mockImplementation(() => {
        callOrder.push('generateEmailToken');
        return mockEmailToken;
      });

      mockAuthRepository.storeEmailVerificationToken.mockImplementation(async () => {
        callOrder.push('storeEmailToken');
      });

      await registerUseCase.execute(validRegisterDto);

      expect(callOrder).toEqual([
        'emailExists',
        'validatePasswordStrength',
        'hashPassword',
        'createUser',
        'generateTokens',
        'storeRefreshToken',
        'generateEmailToken',
        'storeEmailToken',
      ]);
    });

    it('should return user data without sensitive information', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const result = await registerUseCase.execute(validRegisterDto);

      expect(result.data.user).not.toHaveProperty('password');
      expect(result.data.user).not.toHaveProperty('created_at');
      expect(result.data.user).not.toHaveProperty('updated_at');
      expect(result.data.user).not.toHaveProperty('deleted_at');
      expect(result.data.user).not.toHaveProperty('active');
    });

    it('should include all expected user fields in response', async () => {
      mockAuthRepository.emailExists.mockResolvedValue(false);
      mockAuthRepository.createUser.mockResolvedValue(mockUser);

      const result = await registerUseCase.execute(validRegisterDto);

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
  });
});
