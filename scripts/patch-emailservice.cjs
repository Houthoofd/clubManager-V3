const fs = require('fs');

const filePath = '../clubManager-V3-invitations/backend/src/modules/auth/application/services/EmailService.ts';
let content = fs.readFileSync(filePath, 'utf8');

const newMethods = `
  // ============================================================
  // Invitation Email
  // ============================================================

  /**
   * Envoie un email d'invitation à s'inscrire
   */
  async sendInvitationEmail(
    to: string,
    invitedByName: string,
    registrationUrl: string,
    expiresAt: Date,
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    const expiryStr = expiresAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    if (!this.resend) {
      console.log(
        '[EmailService][DEV] Invitation email (not sent) ' +
        'To: ' + to + ' / By: ' + invitedByName + ' / Link: ' + registrationUrl,
      );
      return { success: true, messageId: 'dev-mode-no-send' };
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipient,
        subject: 'Invitation à rejoindre ClubManager',
        html: this.getInvitationEmailHtml(invitedByName, registrationUrl, expiryStr),
        text: this.getInvitationEmailText(invitedByName, registrationUrl, expiryStr),
      });
      return { success: true, messageId: result.data?.id ?? 'sent' };
    } catch (error) {
      console.error('[EmailService] Failed to send invitation email:', error);
      return { success: false, error: String(error) };
    }
  }

  private getInvitationEmailHtml(
    invitedByName: string,
    url: string,
    expiryStr: string,
  ): string {
    const safeInviter = this.escapeHtml(invitedByName);
    const lines = [
      '<!DOCTYPE html>',
      '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">',
      '<h2 style="color:#1d4ed8">Invitation \u00e0 rejoindre ClubManager</h2>',
      '<p>Bonjour,</p>',
      '<p><strong>' + safeInviter + '</strong> vous invite \u00e0 cr\u00e9er votre compte sur ClubManager.</p>',
      '<p><a href="' + url + '" style="background:#1d4ed8;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Cr\u00e9er mon compte</a></p>',
      '<p style="color:#6b7280;font-size:0.875rem">Ce lien est valable jusqu\u2019au ' + expiryStr + '.</p>',
      '</body></html>',
    ];
    return lines.join('');
  }

  private getInvitationEmailText(
    invitedByName: string,
    url: string,
    expiryStr: string,
  ): string {
    return [
      'Invitation a rejoindre ClubManager',
      '',
      invitedByName + ' vous invite a creer votre compte.',
      'Lien : ' + url,
      'Valable jusqu au : ' + expiryStr,
    ].join('\\n');
  }

`;

const marker = '  // ============================================================\n  // Utility Methods';
content = content.replace(marker, newMethods + marker);

fs.writeFileSync(filePath, content, 'utf8');
console.log('EmailService updated successfully');
