import { Resend } from "resend";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class ReservationEmailService {
  private resend: Resend | null = null;
  private devEmailOverride: string | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.devEmailOverride = process.env.DEV_EMAIL_OVERRIDE || null;
  }

  async sendConfirmationEmail(
    to: string,
    memberName: string,
    courseName: string,
    courseDate: string
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(
        `\n[ReservationEmailService][DEV] 📧 Reservation confirmation (not sent - no API KEY)\n` +
          `  To:      ${to}\n` +
          `  Course:  ${courseName}\n`
      );
      return { success: true, messageId: "dev-mode-no-send" };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: "Confirmation de votre réservation",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Réservation confirmée !</h2>
            <p>Bonjour ${memberName},</p>
            <p>Nous vous confirmons votre inscription au cours de <strong>${courseName}</strong> prévu le <strong>${courseDate}</strong>.</p>
            <p>En cas d'empêchement, merci d'annuler votre réservation depuis votre espace membre le plus tôt possible.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Ceci est un message automatique de ClubManager.</p>
          </div>
        `,
      });

      if (error) {
        console.error("[ReservationEmailService] Erreur:", error);
        return { success: false, error: error.message };
      }
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("[ReservationEmailService] Erreur:", err);
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }

  async sendCancellationEmail(
    to: string,
    memberName: string,
    courseName: string,
    courseDate: string
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(`[ReservationEmailService][DEV] Cancellation email not sent`);
      return { success: true };
    }
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: "Annulation de votre réservation",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Réservation annulée</h2>
            <p>Bonjour ${memberName},</p>
            <p>Votre réservation pour le cours de <strong>${courseName}</strong> du <strong>${courseDate}</strong> a bien été annulée.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
          </div>
        `,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, messageId: data?.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}
