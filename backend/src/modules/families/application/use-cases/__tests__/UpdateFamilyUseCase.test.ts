/**
 * UpdateFamilyUseCase.test.ts
 * Tests unitaires — families / UpdateFamilyUseCase
 */

import { UpdateFamilyUseCase } from '../UpdateFamilyUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { UpdateFamilyDto, FamilyWithCount } from '../../../domain/adminTypes';

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

let useCase: UpdateFamilyUseCase;

beforeEach(() => {
  useCase = new UpdateFamilyUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('UpdateFamilyUseCase', () => {
  describe('execute', () => {

    const mockFamily: FamilyWithCount = { id: 10, created_at: new Date(), updated_at: new Date(), membre_count: 2 };

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si la famille n existe pas', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(useCase.execute({ id: 10, nom: 'Doe' })).rejects.toThrow('Famille introuvable');
    });

    it('devrait lancer une erreur si le nom est trop court (ex: 1 caractère après trim)', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      await expect(useCase.execute({ id: 10, nom: ' a ' })).rejects.toThrow('Le nom doit contenir au moins 2 caractères');
    });

    it('devrait lancer une erreur si le nom est trop long (> 100 caractères)', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      const longName = 'a'.repeat(101);
      await expect(useCase.execute({ id: 10, nom: longName })).rejects.toThrow('Le nom ne peut pas dépasser 100 caractères');
    });

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait mettre à jour la famille si les données sont valides (nom défini)', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      const updatedFamily = { ...mockFamily, nom: 'Doe Family' };
      mockRepo.update.mockResolvedValue(updatedFamily);

      const dto: UpdateFamilyDto = { id: 10, nom: ' Doe Family ' };
      const result = await useCase.execute(dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(10);
      expect(mockRepo.update).toHaveBeenCalledWith(dto);
      expect(result).toEqual(updatedFamily);
    });

    it('devrait mettre à jour la famille si nom est passé sans modification (undefined)', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      mockRepo.update.mockResolvedValue(mockFamily);

      const dto: UpdateFamilyDto = { id: 10 };
      const result = await useCase.execute(dto);

      expect(mockRepo.update).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockFamily);
    });

    it('devrait mettre à jour la famille si nom est null ou string vide (si permis par le trim logic)', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      mockRepo.update.mockResolvedValue({ ...mockFamily, nom: null as any });

      const dto: UpdateFamilyDto = { id: 10, nom: null as any };
      const result = await useCase.execute(dto);

      expect(mockRepo.update).toHaveBeenCalledWith(dto);
    });

    it('devrait mettre à jour la famille si nom est string avec seulement des espaces', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      mockRepo.update.mockResolvedValue(mockFamily);

      // Si `nom` a une longueur de 0 après `trim()`, il bypass la vérification `trimmed.length > 0 && trimmed.length < 2`
      const dto: UpdateFamilyDto = { id: 10, nom: '   ' };
      const result = await useCase.execute(dto);

      expect(mockRepo.update).toHaveBeenCalledWith(dto);
    });

    it('devrait lancer une erreur si le repository échoue lors de la mise à jour', async () => {
      mockRepo.findById.mockResolvedValue(mockFamily);
      mockRepo.update.mockRejectedValue(new Error('DB error update'));

      await expect(useCase.execute({ id: 10, nom: 'Doe' })).rejects.toThrow('DB error update');
    });

  });
});
