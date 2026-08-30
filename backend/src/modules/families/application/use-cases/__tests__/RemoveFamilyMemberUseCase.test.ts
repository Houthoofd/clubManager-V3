/**
 * RemoveFamilyMemberUseCase.test.ts
 * Tests unitaires — families / RemoveFamilyMemberUseCase
 */

import { RemoveFamilyMemberUseCase } from '../RemoveFamilyMemberUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { RemoveFamilyMemberInput } from '../RemoveFamilyMemberUseCase';

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

let useCase: RemoveFamilyMemberUseCase;

beforeEach(() => {
  useCase = new RemoveFamilyMemberUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('RemoveFamilyMemberUseCase', () => {
  describe('execute', () => {

    const input: RemoveFamilyMemberInput = { requesterId: 1, membreUserIdString: 'U-001' };

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le requêteur n a pas de famille', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue(null);
      await expect(useCase.execute(input)).rejects.toThrow("Vous n'appartenez à aucune famille");
    });

    it('devrait lancer une erreur si le requêteur n est pas membre de la famille', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([{ user_id: 2 }] as any);
      await expect(useCase.execute(input)).rejects.toThrow("Vous n'êtes pas membre de cette famille");
    });

    it('devrait lancer une erreur si le requêteur n est pas responsable', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([{ user_id: 1, est_responsable: false }] as any);
      await expect(useCase.execute(input)).rejects.toThrow("Vous devez être responsable de la famille pour retirer un membre");
    });

    it('devrait lancer une erreur si le membre à retirer n est pas dans la famille', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([
        { user_id: 1, est_responsable: true, user: { userId: 'U-REQ' } },
        { user_id: 2, est_responsable: false, user: { userId: 'U-002' } }
      ] as any);
      await expect(useCase.execute(input)).rejects.toThrow("Ce membre n'appartient pas à votre famille");
    });

    it('devrait lancer une erreur si le requêteur essaie de se retirer en étant le seul responsable', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([
        { user_id: 1, est_responsable: true, user: { userId: 'U-001', first_name: 'John', last_name: 'Doe' } }
      ] as any);
      await expect(useCase.execute({ requesterId: 1, membreUserIdString: 'U-001' })).rejects.toThrow("Vous ne pouvez pas quitter la famille car vous êtes le seul responsable.");
    });

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retirer un autre membre par userId string avec succès', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([
        { user_id: 1, est_responsable: true, user: { userId: 'U-REQ' } },
        { user_id: 2, est_responsable: false, user: { userId: 'U-001', first_name: 'Jane', last_name: 'Doe' } }
      ] as any);
      mockRepo.removeMembre.mockResolvedValue();

      const result = await useCase.execute(input);

      expect(mockRepo.removeMembre).toHaveBeenCalledWith(10, 2);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Jane Doe a été retiré(e) de la famille.');
    });

    it('devrait retirer un autre membre par id numérique converti en string avec succès', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([
        { user_id: 1, est_responsable: true, user: { userId: 'U-REQ' } },
        { user_id: 3, est_responsable: false, user: { userId: 'U-003', first_name: 'Jane', last_name: 'Doe' } }
      ] as any);
      mockRepo.removeMembre.mockResolvedValue();

      const result = await useCase.execute({ requesterId: 1, membreUserIdString: '3' });

      expect(mockRepo.removeMembre).toHaveBeenCalledWith(10, 3);
      expect(result.success).toBe(true);
    });

    it('devrait permettre au requêteur de se retirer si un autre responsable existe', async () => {
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10 } as any);
      mockRepo.getMembresByFamilleId.mockResolvedValue([
        { user_id: 1, est_responsable: true, user: { userId: 'U-001', first_name: 'John', last_name: 'Doe' } },
        { user_id: 2, est_responsable: true, user: { userId: 'U-002', first_name: 'Jane', last_name: 'Doe' } }
      ] as any);
      mockRepo.removeMembre.mockResolvedValue();

      const result = await useCase.execute({ requesterId: 1, membreUserIdString: 'U-001' });

      expect(mockRepo.removeMembre).toHaveBeenCalledWith(10, 1);
      expect(result.success).toBe(true);
    });

  });
});
