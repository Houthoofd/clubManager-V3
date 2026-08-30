import { UserRole } from '@clubmanager/types';
import { MessagingEmailService } from '../../services/MessagingEmailService';

jest.mock('../../services/MessagingEmailService');

import { SendMessageUseCase } from '../SendMessageUseCase';
import type { IMessagingRepository } from '../../../domain/repositories/IMessagingRepository';

const mockRepo: jest.Mocked<IMessagingRepository> = {
  sendToUser: jest.fn(),
  createBroadcast: jest.fn(),
  updateBroadcastCount: jest.fn(),
  getInbox: jest.fn(),
  getSent: jest.fn(),
  getById: jest.fn(),
  markAsRead: jest.fn(),
  deleteForUser: jest.fn(),
  getUnreadCount: jest.fn(),
  archiveMessage: jest.fn(),
  getArchived: jest.fn(),
  getRecipientsForBroadcast: jest.fn(),
  recordMessageStatus: jest.fn(),
} as jest.Mocked<IMessagingRepository>;

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let emailServiceMock: any;

  beforeEach(() => {
    emailServiceMock = {
      sendMessageNotification: jest.fn(),
    };
    (MessagingEmailService as jest.Mock).mockImplementation(() => emailServiceMock);
    useCase = new SendMessageUseCase(mockRepo);
  });

  describe('execute', () => {

    it('devrait lancer une erreur si le contenu est vide', async () => {
      await expect(useCase.execute({ expediteur_id: 1, expediteur_role: UserRole.MEMBER, contenu: '   ', envoye_par_email: false }))
        .rejects.toThrow('Le contenu du message est requis');
    });

    it('devrait lancer une erreur si le contenu est trop long', async () => {
      const longContent = 'a'.repeat(65536);
      await expect(useCase.execute({ expediteur_id: 1, expediteur_role: UserRole.MEMBER, contenu: longContent, envoye_par_email: false }))
        .rejects.toThrow('Le message est trop long');
    });

    describe('Broadcast', () => {
      it('devrait lancer une erreur si le rôle est MEMBER', async () => {
        await expect(useCase.execute({ expediteur_id: 1, expediteur_role: UserRole.MEMBER, contenu: 'test', cible: 'tous', envoye_par_email: false }))
          .rejects.toThrow('Les membres ne peuvent pas envoyer de messages groupés');
      });

      it('devrait envoyer un broadcast avec email', async () => {
        mockRepo.createBroadcast.mockResolvedValue(100);
        mockRepo.getRecipientsForBroadcast.mockResolvedValue([
          { id: 1, email: 'exp@test.com', first_name: 'Exp', last_name: 'Test' } as any,
          { id: 2, email: 'dest@test.com', first_name: 'Dest', last_name: 'Test' } as any,
          { id: 3, first_name: 'NoEmail', last_name: 'User' } as any
        ]);
        mockRepo.sendToUser.mockResolvedValueOnce(201).mockResolvedValueOnce(202);
        mockRepo.updateBroadcastCount.mockResolvedValue();

        const result = await useCase.execute({
          expediteur_id: 1,
          expediteur_role: UserRole.ADMIN,
          contenu: 'Hello',
          sujet: 'Subject',
          cible: 'tous',
          envoye_par_email: true
        });

        expect(mockRepo.createBroadcast).toHaveBeenCalled();
        expect(mockRepo.getRecipientsForBroadcast).toHaveBeenCalledWith('tous');
        expect(mockRepo.sendToUser).toHaveBeenCalledTimes(2);
        expect(emailServiceMock.sendMessageNotification).toHaveBeenCalledTimes(1);
        expect(mockRepo.updateBroadcastCount).toHaveBeenCalledWith(100, 2);
        expect(result).toEqual({ messageIds: [201, 202], broadcastId: 100 });
      });

      it('devrait envoyer un broadcast sans email', async () => {
        mockRepo.createBroadcast.mockResolvedValue(100);
        mockRepo.getRecipientsForBroadcast.mockResolvedValue([
          { id: 2, email: 'dest@test.com', first_name: 'Dest', last_name: 'Test' } as any
        ]);
        mockRepo.sendToUser.mockResolvedValueOnce(201);

        const result = await useCase.execute({
          expediteur_id: 1,
          expediteur_role: UserRole.ADMIN,
          contenu: 'Hello',
          cible: 'tous',
          envoye_par_email: false
        });

        expect(emailServiceMock.sendMessageNotification).not.toHaveBeenCalled();
        expect(result).toEqual({ messageIds: [201], broadcastId: 100 });
      });
    });

    describe('Message Individuel', () => {
      it('devrait lancer une erreur si aucun destinataire', async () => {
        await expect(useCase.execute({ expediteur_id: 1, expediteur_role: UserRole.MEMBER, contenu: 'test', envoye_par_email: false }))
          .rejects.toThrow('Le destinataire est requis pour un message individuel');
      });

      it('devrait lancer une erreur si destinataire est expediteur', async () => {
        await expect(useCase.execute({ expediteur_id: 1, destinataire_id: 1, expediteur_role: UserRole.MEMBER, contenu: 'test', envoye_par_email: false }))
          .rejects.toThrow('Vous ne pouvez pas vous envoyer un message à vous-même');
      });

      it('devrait envoyer un message avec email', async () => {
        mockRepo.sendToUser.mockResolvedValue(300);

        const result = await useCase.execute({
          expediteur_id: 1,
          destinataire_id: 2,
          destinataire_email: 'dest@test.com',
          destinataire_nom: 'John Doe',
          sujet: 'Hey',
          expediteur_role: UserRole.MEMBER,
          contenu: 'Hello',
          envoye_par_email: true
        });

        expect(mockRepo.sendToUser).toHaveBeenCalled();
        expect(emailServiceMock.sendMessageNotification).toHaveBeenCalledWith({
          to: 'dest@test.com',
          recipientName: 'John Doe',
          senderName: 'Un membre du club',
          subject: 'Hey',
          contentPreview: 'Hello'
        });
        expect(result).toEqual({ messageIds: [300] });
      });

      it('devrait envoyer un message avec email mais sans nom ni sujet', async () => {
        mockRepo.sendToUser.mockResolvedValue(300);

        await useCase.execute({
          expediteur_id: 1,
          destinataire_id: 2,
          destinataire_email: 'dest@test.com',
          expediteur_role: UserRole.MEMBER,
          contenu: 'Hello',
          envoye_par_email: true
        });

        expect(emailServiceMock.sendMessageNotification).toHaveBeenCalledWith(expect.objectContaining({
          recipientName: 'Membre',
          subject: null
        }));
      });

      it('devrait envoyer un message sans email', async () => {
        mockRepo.sendToUser.mockResolvedValue(300);

        const result = await useCase.execute({
          expediteur_id: 1,
          destinataire_id: 2,
          expediteur_role: UserRole.MEMBER,
          contenu: 'Hello',
          envoye_par_email: false
        });

        expect(emailServiceMock.sendMessageNotification).not.toHaveBeenCalled();
        expect(result).toEqual({ messageIds: [300] });
      });
    });

  });
});
