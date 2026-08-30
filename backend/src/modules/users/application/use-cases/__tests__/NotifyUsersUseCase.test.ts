/**
 * NotifyUsersUseCase.test.ts
 * Tests unitaires — users / NotifyUsersUseCase
 */

import { MySQLMessagingRepository } from '@/modules/messaging/infrastructure/repositories/MySQLMessagingRepository.js';
import { MessagingEmailService } from '@/modules/messaging/application/services/MessagingEmailService.js';

jest.mock('@/modules/messaging/infrastructure/repositories/MySQLMessagingRepository.js');
jest.mock('@/modules/messaging/application/services/MessagingEmailService.js');

const mockSendToUser = jest.fn();
const mockSendMessageNotification = jest.fn();

MySQLMessagingRepository.prototype.sendToUser = mockSendToUser;
MessagingEmailService.prototype.sendMessageNotification = mockSendMessageNotification;

import { NotifyUsersUseCase } from '../NotifyUsersUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findProfile: jest.fn(),
  updateRole: jest.fn(),
  updateStatus: jest.fn(),
  updateLanguage: jest.fn(),
  updateProfile: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  findDeleted: jest.fn(),
  anonymize: jest.fn(),
  updateSubscription: jest.fn(),
} as jest.Mocked<IUserRepository>;

describe('NotifyUsersUseCase', () => {
  let useCase: NotifyUsersUseCase;

  beforeEach(() => {
    useCase = new NotifyUsersUseCase(mockRepo);
    jest.clearAllMocks();
    mockSendToUser.mockClear();
    mockSendMessageNotification.mockClear();
  });

  describe('execute', () => {
    it('devrait lancer une erreur si le contenu est vide', async () => {
      await expect(useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: '   ', envoye_par_email: false }))
        .rejects.toThrow("Le contenu du message est requis");
    });

    it('devrait lancer une erreur s\'il n\'y a pas de destinataires', async () => {
      await expect(useCase.execute({ expediteur_id: 1, user_ids: [], contenu: 'Hello', envoye_par_email: false }))
        .rejects.toThrow("Aucun destinataire sélectionné");
    });

    it('devrait lancer une erreur s\'il y a plus de 200 destinataires', async () => {
      const user_ids = Array.from({ length: 201 }, (_, i) => i);
      await expect(useCase.execute({ expediteur_id: 1, user_ids, contenu: 'Hello', envoye_par_email: false }))
        .rejects.toThrow("Maximum 200 destinataires à la fois");
    });

    it('devrait ignorer un utilisateur non trouvé', async () => {
      mockRepo.findById.mockResolvedValueOnce(null);
      
      const result = await useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: 'Test', envoye_par_email: false });
      
      expect(result).toEqual({ sent: 0, errors: 1, total: 1 });
      expect(mockSendToUser).not.toHaveBeenCalled();
    });

    it('devrait envoyer le message et l\'email avec un sujet défini', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 1, email: 'test@test.com', first_name: 'John', last_name: 'Doe' } as any);
      mockSendToUser.mockResolvedValueOnce(undefined);
      mockSendMessageNotification.mockResolvedValueOnce(undefined);

      const result = await useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: 'Test msg', envoye_par_email: true, sujet: 'Subject' });

      expect(result).toEqual({ sent: 1, errors: 0, total: 1 });
      expect(mockSendToUser).toHaveBeenCalledWith({
        expediteur_id: 1,
        destinataire_id: 1,
        sujet: 'Subject',
        contenu: 'Test msg',
        envoye_par_email: true,
      });
      expect(mockSendMessageNotification).toHaveBeenCalledWith({
        to: 'test@test.com',
        recipientName: 'John Doe',
        senderName: 'Administration du club',
        subject: 'Subject',
        contentPreview: 'Test msg',
      });
    });

    it('devrait envoyer le message et l\'email avec un sujet undefined (fallback null)', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 1, email: 'test@test.com', first_name: 'John', last_name: 'Doe' } as any);
      mockSendToUser.mockResolvedValueOnce(undefined);
      mockSendMessageNotification.mockResolvedValueOnce(undefined);

      const result = await useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: 'Test msg', envoye_par_email: true }); // pas de sujet

      expect(result).toEqual({ sent: 1, errors: 0, total: 1 });
      expect(mockSendMessageNotification).toHaveBeenCalledWith(expect.objectContaining({
        subject: null,
      }));
    });

    it('devrait envoyer le message sans email si envoye_par_email est false', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 1, email: 'test@test.com', first_name: 'John', last_name: 'Doe' } as any);
      mockSendToUser.mockResolvedValueOnce(undefined);

      const result = await useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: 'Test msg', envoye_par_email: false });

      expect(result).toEqual({ sent: 1, errors: 0, total: 1 });
      expect(mockSendToUser).toHaveBeenCalled();
      expect(mockSendMessageNotification).not.toHaveBeenCalled();
    });

    it('devrait envoyer le message sans email si l\'utilisateur n\'a pas d\'email', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 1, first_name: 'John', last_name: 'Doe' } as any);
      mockSendToUser.mockResolvedValueOnce(undefined);

      const result = await useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: 'Test msg', envoye_par_email: true });

      expect(result).toEqual({ sent: 1, errors: 0, total: 1 });
      expect(mockSendToUser).toHaveBeenCalled();
      expect(mockSendMessageNotification).not.toHaveBeenCalled();
    });

    it('devrait incrémenter errors si une exception se produit pendant l\'envoi', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 1, email: 'test@test.com', first_name: 'John', last_name: 'Doe' } as any);
      mockSendToUser.mockRejectedValueOnce(new Error('DB error'));

      const result = await useCase.execute({ expediteur_id: 1, user_ids: [1], contenu: 'Test msg', envoye_par_email: true });

      expect(result).toEqual({ sent: 0, errors: 1, total: 1 });
    });
  });
});
