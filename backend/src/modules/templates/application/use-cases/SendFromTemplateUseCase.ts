/**
 * SendFromTemplateUseCase
 * Cas d'utilisation principal : envoie un message à partir d'un template
 *
 * Flux :
 *  1. Récupérer le template
 *  2. Résoudre la liste des destinataires (individuel ou broadcast)
 *  3. Pour chaque destinataire :
 *       a. Construire les variables auto depuis son profil
 *       b. Rendre le template (titre + contenu)
 *       c. Insérer le message via IMessagingRepository.sendToUser()
 *       d. Envoyer l'email de notification si demandé
 *  4. Retourner le nombre de messages créés
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket } from "mysql2/promise";
import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";
import type { IMessagingRepository, RecipientInfo } from "../../../messaging/domain/repositories/IMessagingRepository.js";
import { MessagingEmailService } from "../../../messaging/application/services/MessagingEmailService.js";
import { TemplateEngineService } from "../services/TemplateEngineService.js";

// ==================== ROW INTERFACES ====================

interface RecipientRow extends RowDataPacket {
  id: number;
  email: string | null;
  first_name: string;
  last_name: string;
  userId: string;
}

// ==================== DTO ====================

export interface SendFromTemplateDto {
  template_id: number;
  expediteur_id: number;
  expediteur_role: string;
  /** Destinataire individuel (s'il est fourni, cible est ignorée) */
  destinataire_id?: number;
  /** Broadcast par cible (tous | admin | professor | member) */
  cible?: "tous" | "admin" | "professor" | "member";
  /** Variables manuelles à injecter (ex: { date_cours: '12/06/2025' }) */
  manual_vars?: Record<string, string>;
  /** Si true, envoie aussi une notification email à chaque destinataire */
  envoye_par_email: boolean;
}

export interface SendFromTemplateResult {
  /** Nombre de messages insérés en base */
  sent_count: number;
  /** IDs des messages créés */
  message_ids: number[];
  /** ID du broadcast créé (présent uniquement pour les envois groupés) */
  broadcast_id?: number;
}

// ==================== USE CASE ====================

export class SendFromTemplateUseCase {
  private emailService = new MessagingEmailService();

  constructor(
    private templateRepo: ITemplateRepository,
    private messagingRepo: IMessagingRepository,
  ) {}

  async execute(dto: SendFromTemplateDto): Promise<SendFromTemplateResult> {
    // ------------------------------------------------------------------
    // 1. Valider les paramètres d'entrée
    // ------------------------------------------------------------------

    if (!dto.destinataire_id && !dto.cible) {
      throw new Error(
        "Un destinataire (destinataire_id) ou une cible de broadcast (cible) est requis",
      );
    }

    // ------------------------------------------------------------------
    // 2. Récupérer le template
    // ------------------------------------------------------------------

    const template = await this.templateRepo.getById(dto.template_id);

    if (!template) {
      throw new Error("Template introuvable");
    }

    if (!template.actif) {
      throw new Error("Ce template est désactivé et ne peut pas être utilisé pour l'envoi");
    }

    // ------------------------------------------------------------------
    // 3. Résoudre la liste des destinataires
    // ------------------------------------------------------------------

    let recipients: RecipientInfo[] = [];
    let broadcastId: number | undefined;

    if (dto.destinataire_id) {
      // CAS 1 : destinataire individuel → récupérer son profil
      const [rows] = await pool.query<RecipientRow[]>(
        `SELECT id, email, first_name, last_name, userId
         FROM utilisateurs
         WHERE id = ?
           AND deleted_at  IS NULL
           AND anonymized   = FALSE
           AND active       = TRUE
         LIMIT 1`,
        [dto.destinataire_id],
      );

      if (rows.length === 0) {
        throw new Error("Destinataire introuvable ou inactif");
      }

      const row = rows[0]!;
      recipients = [
        {
          id: row.id,
          email: row.email ?? "",
          first_name: row.first_name,
          last_name: row.last_name,
        },
      ];
    } else if (dto.cible) {
      // CAS 2 : broadcast — récupérer tous les destinataires selon la cible
      // Seuls admin et professor peuvent broadcaster
      if (dto.expediteur_role === "member") {
        throw new Error(
          "Les membres ne peuvent pas envoyer de messages groupés",
        );
      }

      // Créer l'enregistrement broadcast
      broadcastId = await this.messagingRepo.createBroadcast({
        expediteur_id: dto.expediteur_id,
        sujet: template.titre,
        contenu: template.contenu,
        cible: dto.cible,
        envoye_par_email: dto.envoye_par_email,
      });

      // Récupérer les destinataires éligibles
      const allRecipients = await this.messagingRepo.getRecipientsForBroadcast(
        dto.cible,
      );

      // Exclure l'expéditeur de la liste
      recipients = allRecipients.filter((r) => r.id !== dto.expediteur_id);
    }

    // ------------------------------------------------------------------
    // 4. Pour chaque destinataire : rendre + envoyer
    // ------------------------------------------------------------------

    const messageIds: number[] = [];

    for (const recipient of recipients) {
      // 4a. Récupérer le userId string si on est en broadcast
      //     (RecipientInfo n'a pas userId — on fait une query rapide)
      let userIdString = "U-????-????";

      if (dto.cible) {
        const [uidRows] = await pool.query<RecipientRow[]>(
          `SELECT userId FROM utilisateurs WHERE id = ? LIMIT 1`,
          [recipient.id],
        );
        if (uidRows.length > 0) {
          userIdString = uidRows[0]!.userId;
        }
      } else {
        // En mode individuel on a déjà chargé le profil complet ci-dessus
        const [uidRows] = await pool.query<RecipientRow[]>(
          `SELECT userId FROM utilisateurs WHERE id = ? LIMIT 1`,
          [recipient.id],
        );
        if (uidRows.length > 0) {
          userIdString = uidRows[0]!.userId;
        }
      }

      // 4b. Construire les variables auto depuis le profil
      const autoVars = TemplateEngineService.buildAutoVars({
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        userId: userIdString,
      });

      // 4c. Rendre le template (titre + contenu)
      const rendered = TemplateEngineService.render(
        { titre: template.titre, contenu: template.contenu },
        autoVars,
        dto.manual_vars ?? {},
      );

      // 4d. Insérer le message en base
      const msgId = await this.messagingRepo.sendToUser({
        expediteur_id: dto.expediteur_id,
        destinataire_id: recipient.id,
        sujet: rendered.titre,
        contenu: rendered.contenu,
        broadcast_id: broadcastId ?? undefined,
        envoye_par_email: dto.envoye_par_email,
      });

      messageIds.push(msgId);

      // 4e. Envoyer la notification email si demandé et email disponible
      if (dto.envoye_par_email && recipient.email) {
        await this.emailService.sendMessageNotification({
          to: recipient.email,
          recipientName: `${recipient.first_name} ${recipient.last_name}`,
          senderName: "Équipe ClubManager",
          subject: rendered.titre,
          contentPreview: rendered.contenu,
        });
      }
    }

    // ------------------------------------------------------------------
    // 5. Mettre à jour le compteur du broadcast si applicable
    // ------------------------------------------------------------------

    if (broadcastId !== undefined) {
      await this.messagingRepo.updateBroadcastCount(
        broadcastId,
        messageIds.length,
      );
    }

    return {
      sent_count: messageIds.length,
      message_ids: messageIds,
      ...(broadcastId !== undefined && { broadcast_id: broadcastId }),
    };
  }
}
