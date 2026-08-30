import { Resend } from "resend";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class CourseEmailService {
  private resend: Resend | null = null;
  private devEmailOverride: string | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.devEmailOverride = process.env.DEV_EMAIL_OVERRIDE || null;
  }

  async sendProfessorAssignmentEmail(
    to: string,
    professorName: string,
    courseTitle: string
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(`[CourseEmailService][DEV] Assignment email (not sent)`);
      return { success: true };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: recipient,
        subject: `Nouvelle affectation : ${courseTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Nouvelle affectation de cours</h2>
            <p>Bonjour ${professorName},</p>
            <p>Vous avez été assigné(e) au cours <strong>${courseTitle}</strong>.</p>
            <p>Vous pouvez consulter les détails et la liste des participants directement depuis votre espace Professeur.</p>
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
