/**
 * SendFromTemplateUseCase.test.ts
 * Tests unitaires — templates / SendFromTemplateUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

jest.mock("@/modules/messaging/application/services/MessagingEmailService");
// removed mock

import { SendFromTemplateUseCase } from "../SendFromTemplateUseCase";
import type { ITemplateRepository } from "../../../domain/repositories/ITemplateRepository";
import type { IMessagingRepository } from "../../../../messaging/domain/repositories/IMessagingRepository";

// ─── Mock Repositories ────────────────────────────────────────────

const mockTemplateRepo: jest.Mocked<ITemplateRepository> = {
  getTypes: jest.fn(),
  createType: jest.fn(),
  updateType: jest.fn(),
  deleteType: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  toggle: jest.fn(),
} as jest.Mocked<ITemplateRepository>;

const mockMessagingRepo: jest.Mocked<IMessagingRepository> = {
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

// ─── Setup ────────────────────────────────────────────────────

let useCase: SendFromTemplateUseCase;

beforeEach(() => {
  useCase = new SendFromTemplateUseCase(mockTemplateRepo, mockMessagingRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

jest.mock("@/core/database/connection.js", () => ({
  pool: { query: jest.fn() },
}));
import { pool } from "@/core/database/connection.js";
import { MessagingEmailService } from "../../../../messaging/application/services/MessagingEmailService";

describe("SendFromTemplateUseCase", () => {
  describe("execute", () => {
    // ── Cas d'erreur : validation des paramètres ─────────────────────────

    it("devrait lancer une erreur si destinataire_id et cible sont manquants", async () => {
      await expect(
        useCase.execute({
          template_id: 1,
          expediteur_id: 1,
          expediteur_role: "admin",
          envoye_par_email: false,
        })
      ).rejects.toThrow("Un destinataire (destinataire_id) ou une cible de broadcast (cible) est requis");
    });

    it("devrait lancer une erreur si le template n'existe pas", async () => {
      mockTemplateRepo.getById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          template_id: 1,
          expediteur_id: 1,
          expediteur_role: "admin",
          destinataire_id: 2,
          envoye_par_email: false,
        })
      ).rejects.toThrow("Template introuvable");
    });

    it("devrait lancer une erreur si le template est inactif", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "T", contenu: "C", variables: [], actif: false });

      await expect(
        useCase.execute({
          template_id: 1,
          expediteur_id: 1,
          expediteur_role: "admin",
          destinataire_id: 2,
          envoye_par_email: false,
        })
      ).rejects.toThrow("Ce template est désactivé et ne peut pas être utilisé pour l'envoi");
    });

    // ── Destinataire individuel ──────────────────────────────────────────

    it("devrait lancer une erreur si le destinataire individuel n'est pas trouvé", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "T", contenu: "C", variables: [], actif: true });
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]); // profil vide

      await expect(
        useCase.execute({
          template_id: 1,
          expediteur_id: 1,
          expediteur_role: "admin",
          destinataire_id: 2,
          envoye_par_email: false,
        })
      ).rejects.toThrow("Destinataire introuvable ou inactif");
    });

    it("devrait envoyer à un destinataire individuel", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "T", contenu: "C", variables: [], actif: true });
      // 1er query pour le profil
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ id: 2, email: "test@test.com", first_name: "Jean", last_name: "Dupont", userId: "U-1" }]]);
      // 2e query pour userId (dans le for)
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ userId: "U-1" }]]);
      mockMessagingRepo.sendToUser.mockResolvedValue(100);
      const emailServiceSpy = jest.spyOn(MessagingEmailService.prototype, "sendMessageNotification").mockResolvedValue(undefined);

      const result = await useCase.execute({
        template_id: 1,
        expediteur_id: 1,
        expediteur_role: "admin",
        destinataire_id: 2,
        envoye_par_email: true,
        manual_vars: { test: "123" }
      });

      expect(result).toEqual({ sent_count: 1, message_ids: [100] });
      expect(mockMessagingRepo.sendToUser).toHaveBeenCalledWith({
        expediteur_id: 1,
        destinataire_id: 2,
        sujet: "T",
        contenu: "C",
        broadcast_id: undefined,
        envoye_par_email: true,
      });
      expect(emailServiceSpy).toHaveBeenCalledWith({
        to: "test@test.com",
        recipientName: "Jean Dupont",
        senderName: "Équipe ClubManager",
        subject: "T",
        contentPreview: "C",
      });
      emailServiceSpy.mockRestore();
    });

    it("devrait gérer un destinataire individuel sans email et query vide pour userId dans le for", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "T", contenu: "C", variables: [], actif: true });
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ id: 2, email: null, first_name: "Jean", last_name: "Dupont", userId: "U-1" }]]);
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]); // empty userId query
      mockMessagingRepo.sendToUser.mockResolvedValue(101);

      const result = await useCase.execute({
        template_id: 1,
        expediteur_id: 1,
        expediteur_role: "admin",
        destinataire_id: 2,
        envoye_par_email: false, // ne doit pas envoyer d'email
      });

      expect(result).toEqual({ sent_count: 1, message_ids: [101] });
    });

    // ── Broadcast ────────────────────────────────────────────────────────

    it("devrait lancer une erreur si le role est member en mode broadcast", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "T", contenu: "C", variables: [], actif: true });

      await expect(
        useCase.execute({
          template_id: 1,
          expediteur_id: 1,
          expediteur_role: "member",
          cible: "tous",
          envoye_par_email: false,
        })
      ).rejects.toThrow("Les membres ne peuvent pas envoyer de messages groupés");
    });

    it("devrait envoyer un broadcast", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "Titre B", contenu: "Contenu B", variables: [], actif: true });
      mockMessagingRepo.createBroadcast.mockResolvedValue(99);
      mockMessagingRepo.getRecipientsForBroadcast.mockResolvedValue([
        { id: 1, email: "admin@test.com", first_name: "Admin", last_name: "System" } as any, // sera filtré (expediteur)
        { id: 2, email: "user@test.com", first_name: "User", last_name: "Normal" } as any,
      ]);
      (pool.query as jest.Mock).mockResolvedValueOnce([[{ userId: "U-2" }]]); // pour recipient id=2
      mockMessagingRepo.sendToUser.mockResolvedValue(102);

      const result = await useCase.execute({
        template_id: 1,
        expediteur_id: 1,
        expediteur_role: "admin",
        cible: "tous",
        envoye_par_email: false,
      });

      expect(result).toEqual({ sent_count: 1, message_ids: [102], broadcast_id: 99 });
      expect(mockMessagingRepo.createBroadcast).toHaveBeenCalledWith({
        expediteur_id: 1,
        sujet: "Titre B",
        contenu: "Contenu B",
        cible: "tous",
        envoye_par_email: false,
      });
      expect(mockMessagingRepo.sendToUser).toHaveBeenCalledWith(expect.objectContaining({
        destinataire_id: 2,
        broadcast_id: 99,
      }));
      expect(mockMessagingRepo.updateBroadcastCount).toHaveBeenCalledWith(99, 1);
    });

    it("devrait gérer l'absence d'userId lors du broadcast", async () => {
      mockTemplateRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: "Titre B", contenu: "Contenu B", variables: [], actif: true });
      mockMessagingRepo.createBroadcast.mockResolvedValue(99);
      mockMessagingRepo.getRecipientsForBroadcast.mockResolvedValue([
        { id: 2, email: "user@test.com", first_name: "User", last_name: "Normal" } as any,
      ]);
      (pool.query as jest.Mock).mockResolvedValueOnce([[]]); // empty userId query
      mockMessagingRepo.sendToUser.mockResolvedValue(103);

      const result = await useCase.execute({
        template_id: 1,
        expediteur_id: 1,
        expediteur_role: "admin",
        cible: "tous",
        envoye_par_email: false,
      });

      expect(result).toEqual({ sent_count: 1, message_ids: [103], broadcast_id: 99 });
    });

  });
});
