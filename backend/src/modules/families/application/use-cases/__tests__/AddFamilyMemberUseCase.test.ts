/**
 * AddFamilyMemberUseCase.test.ts
 * Tests unitaires — families / AddFamilyMemberUseCase
 */

import { AddFamilyMemberUseCase } from '../AddFamilyMemberUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { AddFamilyMemberDto } from '@clubmanager/types';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IFamilyRepository> = {
  createFamille:           jest.fn(),
  findFamilleByUserId:     jest.fn(),
  addMembre:               jest.fn(),
  getMembresByFamilleId:   jest.fn(),
  removeMembre:            jest.fn(),
  isMembre:                jest.fn(),
  findAll:                 jest.fn(),
  findById:                jest.fn(),
  update:                  jest.fn(),
  delete:                  jest.fn(),
  adminAddMembre:          jest.fn(),
  createChildUser:         jest.fn(),
} as jest.Mocked<IFamilyRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: AddFamilyMemberUseCase;

beforeEach(() => {
  useCase = new AddFamilyMemberUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
  // Restore date mocking if used
  jest.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────

describe('AddFamilyMemberUseCase', () => {
  describe('execute', () => {
    
    // ── Cas de validation ─────────────────────────────────────────────

    it('devrait lancer une erreur si first_name est manquant ou trop court', async () => {
      const dto = { first_name: 'a', last_name: 'Doe', date_of_birth: '2010-01-01', genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('First name must be at least 2 characters');
      
      const dtoMissing = { last_name: 'Doe', date_of_birth: '2010-01-01', genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dtoMissing, 1)).rejects.toThrow('First name must be at least 2 characters');
    });

    it('devrait lancer une erreur si last_name est manquant ou trop court', async () => {
      const dto = { first_name: 'John', last_name: 'D', date_of_birth: '2010-01-01', genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Last name must be at least 2 characters');

      const dtoMissing = { first_name: 'John', date_of_birth: '2010-01-01', genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dtoMissing, 1)).rejects.toThrow('Last name must be at least 2 characters');
    });

    it('devrait lancer une erreur si date_of_birth est manquant', async () => {
      const dto = { first_name: 'John', last_name: 'Doe', genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Date of birth is required');
    });

    it('devrait lancer une erreur si date_of_birth a un format invalide', async () => {
      const dto = { first_name: 'John', last_name: 'Doe', date_of_birth: 'invalid-date', genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Invalid date of birth format');
    });

    it('devrait lancer une erreur si date_of_birth est dans le futur', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dto = { first_name: 'John', last_name: 'Doe', date_of_birth: futureDate.toISOString(), genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Date of birth cannot be in the future');
    });

    it('devrait lancer une erreur si un enfant a plus de 17 ans', async () => {
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 20);
      const dto = { first_name: 'John', last_name: 'Doe', date_of_birth: adultDate.toISOString(), genre_id: 1, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Un enfant doit avoir entre 0 et 17 ans');
    });

    it('devrait lancer une erreur si un adulte (non enfant) a moins de 18 ans', async () => {
      const childDate = new Date();
      childDate.setFullYear(childDate.getFullYear() - 10);
      const dto = { first_name: 'John', last_name: 'Doe', date_of_birth: childDate.toISOString(), genre_id: 1, role: 'conjoint' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Ce type de membre doit être majeur (18 ans minimum)');
    });

    it('devrait lancer une erreur si genre_id est manquant ou <= 0', async () => {
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 10);
      const dto = { first_name: 'John', last_name: 'Doe', date_of_birth: validDate.toISOString(), genre_id: 0, role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Un genre valide est requis (genre_id > 0)');

      const dtoMissing = { first_name: 'John', last_name: 'Doe', date_of_birth: validDate.toISOString(), role: 'enfant' } as AddFamilyMemberDto;
      await expect(useCase.execute(dtoMissing, 1)).rejects.toThrow('Un genre valide est requis (genre_id > 0)');
    });

    it('devrait lancer une erreur si le rôle est manquant', async () => {
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20); // Adult age to bypass the age check for non-enfants
      const dto = { first_name: 'John', last_name: 'Doe', date_of_birth: validDate.toISOString(), genre_id: 1 } as AddFamilyMemberDto;
      await expect(useCase.execute(dto, 1)).rejects.toThrow('Le rôle du membre est requis');
    });

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait ajouter un membre et créer une famille si le parent n en a pas', async () => {
      // Arrange
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 10);
      const dto: AddFamilyMemberDto = {
        first_name: 'John ',
        last_name: ' Doe',
        date_of_birth: validDate.toISOString(),
        genre_id: 1,
        role: 'enfant'
      };

      const mockChildUser = {
        id: 10,
        userId: 100,
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: validDate,
        genre_id: 1
      };

      mockRepo.createChildUser.mockResolvedValue(mockChildUser as any);
      mockRepo.findFamilleByUserId.mockResolvedValue(null);
      mockRepo.createFamille.mockResolvedValue({ id: 50 } as any);
      mockRepo.addMembre.mockResolvedValue();

      // Act
      const result = await useCase.execute(dto, 1);

      // Assert
      expect(mockRepo.createChildUser).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: validDate,
        genre_id: 1,
        tuteur_id: 1,
        est_mineur: true,
        peut_se_connecter: false,
      });

      expect(mockRepo.findFamilleByUserId).toHaveBeenCalledWith(1);
      expect(mockRepo.createFamille).toHaveBeenCalled();
      expect(mockRepo.addMembre).toHaveBeenCalledWith({
        familleId: 50,
        userId: 1,
        role: "parent",
        estResponsable: true,
        estTuteurLegal: true,
      });

      expect(mockRepo.addMembre).toHaveBeenCalledWith({
        familleId: 50,
        userId: 10,
        role: "enfant",
        estResponsable: false,
        estTuteurLegal: false,
      });

      expect(result.success).toBe(true);
      expect(result.data?.famille_id).toBe(50);
      expect(result.data?.membre.id).toBe(10);
    });

    it('devrait ajouter un membre sans créer de famille si le parent en a déjà une', async () => {
      // Arrange
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 10);
      const dto: AddFamilyMemberDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        date_of_birth: validDate.toISOString(),
        genre_id: 2,
        role: 'enfant'
      };

      mockRepo.createChildUser.mockResolvedValue({
        id: 11,
        userId: 101,
        first_name: 'Jane',
        last_name: 'Doe',
        date_of_birth: validDate,
        genre_id: 2
      } as any);
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 50 } as any);

      // Act
      const result = await useCase.execute(dto, 1);

      // Assert
      expect(mockRepo.createFamille).not.toHaveBeenCalled();
      // Only called once for the child (not for the parent)
      expect(mockRepo.addMembre).toHaveBeenCalledTimes(1);
      expect(mockRepo.addMembre).toHaveBeenCalledWith({
        familleId: 50,
        userId: 11,
        role: "enfant",
        estResponsable: false,
        estTuteurLegal: false,
      });
      expect(result.success).toBe(true);
    });

    // ── Cas d'erreur de base de données ──────────────────────────────────

    it('devrait lancer une erreur si le repository échoue lors de la création', async () => {
      // Arrange
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 10);
      const dto: AddFamilyMemberDto = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: validDate.toISOString(),
        genre_id: 1,
        role: 'enfant'
      };

      mockRepo.createChildUser.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(dto, 1)).rejects.toThrow('DB error');
    });

  });
});
