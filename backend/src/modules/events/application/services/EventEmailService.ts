import { Resend } from "resend";

export class EventEmailService {
  private resend: Resend | null;
  private fromEmail: string;
  private devEmailOverride: string | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.devEmailOverride = process.env.DEV_EMAIL_OVERRIDE || null;
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      console.warn("[EventEmailService] RESEND_API_KEY is missing. Emails will be logged to console.");
    }
    this.fromEmail = process.env.RESEND_FROM_EMAIL || "no-reply@clubmanager.com";
  }

  async sendRegistrationConfirmation(toEmail: string, userName: string, eventTitle: string, eventDate: string): Promise<void> {
    const subject = `Confirmation d'inscription : ${eventTitle}`;
    const targetEmail = this.devEmailOverride || toEmail;
    
    if (this.devEmailOverride) {
      console.log(`[EventEmailService] DEV_EMAIL_OVERRIDE actif. Email redirigé de ${toEmail} vers ${targetEmail}`);
    }

    if (!this.resend) {
      console.log(`[EventEmailService] Simulation envoi email à ${targetEmail} : ${subject}`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: targetEmail,
        subject,
        html: `
          <h2>Bonjour ${userName},</h2>
          <p>Votre inscription à l'évènement <strong>${eventTitle}</strong> a bien été confirmée !</p>
          <p>Date : ${eventDate}</p>
          <br />
          <p>L'équipe ClubManager</p>
        `,
      });
      if (result.error) {
        console.error("[EventEmailService] Erreur Resend :", result.error);
      } else {
        console.log(`[EventEmailService] Email envoyé avec succès à ${targetEmail}`);
      }
    } catch (error) {
      console.error("[EventEmailService] Erreur lors de l'envoi de l'email :", error);
    }
  }

  async sendCancellationConfirmation(toEmail: string, userName: string, eventTitle: string): Promise<void> {
    const subject = `Annulation d'inscription : ${eventTitle}`;
    const targetEmail = this.devEmailOverride || toEmail;
    
    if (this.devEmailOverride) {
      console.log(`[EventEmailService] DEV_EMAIL_OVERRIDE actif. Email redirigé de ${toEmail} vers ${targetEmail}`);
    }

    if (!this.resend) {
      console.log(`[EventEmailService] Simulation envoi email à ${targetEmail} : ${subject}`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: targetEmail,
        subject,
        html: `
          <h2>Bonjour ${userName},</h2>
          <p>Votre désinscription à l'évènement <strong>${eventTitle}</strong> a bien été prise en compte.</p>
          <br />
          <p>L'équipe ClubManager</p>
        `,
      });
      if (result.error) {
        console.error("[EventEmailService] Erreur Resend :", result.error);
      } else {
        console.log(`[EventEmailService] Email d'annulation envoyé avec succès à ${targetEmail}`);
      }
    } catch (error) {
      console.error("[EventEmailService] Erreur lors de l'envoi de l'email :", error);
    }
  }
}
