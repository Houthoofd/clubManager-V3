import { Resend } from "resend";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PaymentEmailService {
  private resend: Resend | null = null;
  private devEmailOverride: string | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.devEmailOverride = process.env.DEV_EMAIL_OVERRIDE || null;
  }

  async sendPaymentReceipt(
    to: string,
    memberName: string,
    amount: string,
    paymentMethod: string,
    description: string
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(`[PaymentEmailService][DEV] Payment receipt (not sent)`);
      return { success: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: `Reçu de paiement : ${description}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Confirmation de paiement</h2>
            <p>Bonjour ${memberName},</p>
            <p>Nous confirmons la bonne réception de votre paiement de <strong>${amount} €</strong>.</p>
            <ul>
              <li><strong>Motif :</strong> ${description}</li>
              <li><strong>Méthode :</strong> ${paymentMethod}</li>
            </ul>
            <p>Merci pour votre confiance !</p>
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

  async sendRefundNotification(
    to: string,
    memberName: string,
    amount: string,
    description: string
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(`[PaymentEmailService][DEV] Refund notification (not sent)`);
      return { success: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: `Remboursement émis : ${description}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Notification de remboursement</h2>
            <p>Bonjour ${memberName},</p>
            <p>Un remboursement d'un montant de <strong>${amount} €</strong> a été émis sur votre compte.</p>
            <p><strong>Motif concerné :</strong> ${description}</p>
            <p>Le délai de traitement dépend de votre établissement bancaire (généralement 3 à 5 jours ouvrés).</p>
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
