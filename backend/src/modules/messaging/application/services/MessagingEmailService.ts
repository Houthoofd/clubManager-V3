/**
 * MessagingEmailService
 * Service d'envoi d'emails pour les notifications de messages (Resend)
 */

import { Resend } from "resend";

export class MessagingEmailService {
  private resend: Resend | null;
  private fromEmail: string;
  private readonly isDev: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.isDev = process.env.NODE_ENV !== "production";

    if (!apiKey) {
      if (this.isDev) {
        console.warn(
          "[MessagingEmailService] ⚠️ No RESEND_API_KEY — emails logged to console only",
        );
        this.resend = null;
      } else {
        throw new Error("RESEND_API_KEY is required in production");
      }
    } else {
      this.resend = new Resend(apiKey);
    }

    this.fromEmail =
      process.env.RESEND_FROM_EMAIL || "no-reply@clubmanager.com";
  }

  /**
   * Envoie une notification email quand un message est reçu
   */
  async sendMessageNotification(params: {
    to: string;
    recipientName: string;
    senderName: string;
    subject: string | null;
    contentPreview: string; // premiers 200 chars du message
  }): Promise<void> {
    const subject = `[ClubManager] ${params.senderName} vous a envoyé un message`;
    const preview =
      params.contentPreview.substring(0, 200) +
      (params.contentPreview.length > 200 ? "..." : "");

    if (!this.resend) {
      console.log(
        `[MessagingEmailService] DEV — Email to ${params.to}: ${subject}`,
      );
      console.log(`Content preview: ${preview}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject,
        html: this.buildEmailHtml(
          params.recipientName,
          params.senderName,
          params.subject,
          preview,
        ),
        text: `Bonjour ${params.recipientName},\n\n${params.senderName} vous a envoyé un message sur ClubManager.\n\nAperçu: ${preview}\n\nConnectez-vous pour voir le message complet.`,
      });
    } catch (error) {
      console.error("[MessagingEmailService] Failed to send email:", error);
      // Ne pas throw — l'email est optionnel, le message interne est déjà envoyé
    }
  }

  private buildEmailHtml(
    recipientName: string,
    senderName: string,
    subject: string | null,
    preview: string,
  ): string {
    return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">ClubManager</h1>
  </div>
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
    <p>Bonjour <strong>${recipientName}</strong>,</p>
    <p><strong>${senderName}</strong> vous a envoyé un message.</p>
    ${subject ? `<p><strong>Sujet :</strong> ${subject}</p>` : ""}
    <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #374151;">${preview}</p>
    </div>
    <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/messages"
       style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px;">
      Voir le message complet
    </a>
  </div>
</body>
</html>`;
  }
}
