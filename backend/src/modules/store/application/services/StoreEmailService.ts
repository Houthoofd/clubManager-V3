import { Resend } from "resend";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class StoreEmailService {
  private resend: Resend | null = null;
  private devEmailOverride: string | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.devEmailOverride = process.env.DEV_EMAIL_OVERRIDE || null;
  }

  async sendOrderConfirmationEmail(
    to: string,
    memberName: string,
    orderId: string,
    totalAmount: string,
    items: string[]
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(`[StoreEmailService][DEV] Order confirmation (not sent)`);
      return { success: true };
    }

    const itemsHtml = items.map(item => `<li>${item}</li>`).join("");

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: `Confirmation de votre commande #${orderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Merci pour votre commande !</h2>
            <p>Bonjour ${memberName},</p>
            <p>Nous vous confirmons la bonne réception de votre commande <strong>#${orderId}</strong>.</p>
            <h3>Récapitulatif :</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Total payé : ${totalAmount} €</strong></p>
            <p>Nous vous enverrons un nouvel email dès que votre commande sera prête à être récupérée.</p>
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

  async sendOrderReadyEmail(
    to: string,
    memberName: string,
    orderId: string
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(`[StoreEmailService][DEV] Order ready email (not sent)`);
      return { success: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: `Votre commande #${orderId} est prête !`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Bonne nouvelle ! 🎉</h2>
            <p>Bonjour ${memberName},</p>
            <p>Votre commande <strong>#${orderId}</strong> est prête à être récupérée au club !</p>
            <p>Veuillez vous présenter au secrétariat ou à votre entraîneur lors de votre prochain passage.</p>
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
