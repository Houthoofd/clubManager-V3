/**
 * Email Service
 * @module auth/application/services/EmailService
 *
 * Service for sending transactional emails using Resend.
 * Handles verification emails, password reset emails, and password change notifications.
 */

import { Resend } from "resend";
import { EmailSendResult } from "@clubmanager/types";

/**
 * Email Service
 * Handles all email sending operations for the authentication module
 */
export class EmailService {
  private resend: Resend | null;
  private fromEmail: string;
  private readonly isDev: boolean;
  private readonly devEmailOverride: string | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.isDev = process.env.NODE_ENV !== "production";
    this.devEmailOverride =
      this.isDev && process.env.DEV_EMAIL_OVERRIDE
        ? process.env.DEV_EMAIL_OVERRIDE
        : null;

    if (this.devEmailOverride) {
      console.warn(
        `[EmailService] ⚠️  DEV mode — tous les emails seront redirigés vers : ${this.devEmailOverride}`,
      );
    }

    if (!apiKey) {
      if (this.isDev) {
        console.warn(
          "[EmailService] ⚠️  RESEND_API_KEY is not set. " +
            "Emails will be logged to the console instead of being sent (dev mode).",
        );
        this.resend = null;
      } else {
        console.error("RESEND_API_KEY environment variable is not set");
        throw new Error(
          "RESEND_API_KEY is required for EmailService in production",
        );
      }
    } else {
      this.resend = new Resend(apiKey);
    }

    this.fromEmail =
      process.env.RESEND_FROM_EMAIL || "no-reply@clubmanager.com";
  }

  /**
   * Send email verification email to new users
   */
  async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationUrl: string,
    userId: string,
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(
        `\n[EmailService][DEV] 📧 Verification email (not sent — no RESEND_API_KEY)\n` +
          `  To:      ${to}\n` +
          `  Name:    ${firstName}\n` +
          `  UserId:  ${userId}\n` +
          `  Link:    ${verificationUrl}\n`,
      );
      return { success: true, messageId: "dev-mode-no-send" };
    }

    try {
      console.log(
        `Sending verification email to ${recipient}${recipient !== to ? ` (redirigé depuis ${to})` : ""}`,
      );

      const html = this.getVerificationEmailTemplate(
        firstName,
        verificationUrl,
        userId,
      );
      const text = this.getVerificationEmailText(
        firstName,
        verificationUrl,
        userId,
      );

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipient,
        subject: "Verify Your Email Address - ClubManager",
        html,
        text,
      });

      if (result.data) {
        console.log(
          `Verification email sent successfully to ${recipient}. Message ID: ${result.data.id}`,
        );
        return {
          success: true,
          messageId: result.data.id,
        };
      } else {
        console.error("Failed to send verification email:", result.error);
        return {
          success: false,
          error: result.error?.message || "Unknown error occurred",
        };
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetUrl: string,
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(
        `\n[EmailService][DEV] 📧 Password reset email (not sent — no RESEND_API_KEY)\n` +
          `  To:      ${to}\n` +
          `  Name:    ${firstName}\n` +
          `  Link:    ${resetUrl}\n`,
      );
      return { success: true, messageId: "dev-mode-no-send" };
    }

    try {
      console.log(
        `Sending password reset email to ${recipient}${recipient !== to ? ` (redirigé depuis ${to})` : ""}`,
      );

      const html = this.getPasswordResetEmailTemplate(firstName, resetUrl);
      const text = this.getPasswordResetEmailText(firstName, resetUrl);

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipient,
        subject: "Reset Your Password - ClubManager",
        html,
        text,
      });

      if (result.data) {
        console.log(
          `Password reset email sent successfully to ${to}. Message ID: ${result.data.id}`,
        );
        return {
          success: true,
          messageId: result.data.id,
        };
      } else {
        console.error("Failed to send password reset email:", result.error);
        return {
          success: false,
          error: result.error?.message || "Unknown error occurred",
        };
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send password reset email",
      };
    }
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(
    to: string,
    firstName: string,
  ): Promise<EmailSendResult> {
    const recipient = this.devEmailOverride ?? to;
    if (!this.resend) {
      console.log(
        `\n[EmailService][DEV] 📧 Password changed email (not sent — no RESEND_API_KEY)\n` +
          `  To:      ${to}\n` +
          `  Name:    ${firstName}\n`,
      );
      return { success: true, messageId: "dev-mode-no-send" };
    }

    try {
      console.log(
        `Sending password changed notification to ${recipient}${recipient !== to ? ` (redirigé depuis ${to})` : ""}`,
      );

      const html = this.getPasswordChangedEmailTemplate(firstName);
      const text = this.getPasswordChangedEmailText(firstName);

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipient,
        subject: "Your Password Has Been Changed - ClubManager",
        html,
        text,
      });

      if (result.data) {
        console.log(
          `Password changed email sent successfully to ${to}. Message ID: ${result.data.id}`,
        );
        return {
          success: true,
          messageId: result.data.id,
        };
      } else {
        console.error("Failed to send password changed email:", result.error);
        return {
          success: false,
          error: result.error?.message || "Unknown error occurred",
        };
      }
    } catch (error) {
      console.error("Error sending password changed email:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send password changed email",
      };
    }
  }

  // ============================================================
  // Email Templates - Verification
  // ============================================================

  private getVerificationEmailTemplate(
    firstName: string,
    verificationUrl: string,
    userId: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f7;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .link-text {
      font-size: 14px;
      color: #888888;
      margin-top: 20px;
      word-break: break-all;
    }
    .link-text a {
      color: #667eea;
      text-decoration: none;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6c757d;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 ClubManager</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello ${this.escapeHtml(firstName)},</p>
      <p class="message">
        Welcome to ClubManager! We're excited to have you on board.
        To get started, please verify your email address by clicking the button below.
      </p>
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #667eea; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Votre identifiant de connexion</p>
        <p style="margin: 0; font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace;">${this.escapeHtml(userId)}</p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #888888;">Conservez cet identifiant précieusement — il vous sera demandé à chaque connexion.</p>
      </div>
      <div class="button-container">
        <a href="${this.escapeHtml(verificationUrl)}" class="button">Verify Email Address</a>
      </div>
      <p class="message">
        This verification link will expire in 24 hours for security reasons.
      </p>
      <div class="divider"></div>
      <p class="link-text">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${this.escapeHtml(verificationUrl)}">${this.escapeHtml(verificationUrl)}</a>
      </p>
      <p class="message" style="margin-top: 30px; font-size: 14px; color: #888888;">
        If you didn't create an account with ClubManager, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p><strong>ClubManager</strong></p>
      <p>Sports Club Management Made Easy</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} ClubManager. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getVerificationEmailText(
    firstName: string,
    verificationUrl: string,
    userId: string,
  ): string {
    return `
Hello ${firstName},

Votre identifiant de connexion : ${userId}
Conservez-le précieusement, il vous sera demandé à chaque connexion.

Welcome to ClubManager! We're excited to have you on board.

To get started, please verify your email address by visiting this link:
${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with ClubManager, you can safely ignore this email.

Best regards,
The ClubManager Team

---
ClubManager - Sports Club Management Made Easy
© ${new Date().getFullYear()} ClubManager. All rights reserved.
    `.trim();
  }

  // ============================================================
  // Email Templates - Password Reset
  // ============================================================

  private getPasswordResetEmailTemplate(
    firstName: string,
    resetUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f7;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .warning-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .warning-box p {
      margin: 0;
      font-size: 14px;
      color: #856404;
    }
    .link-text {
      font-size: 14px;
      color: #888888;
      margin-top: 20px;
      word-break: break-all;
    }
    .link-text a {
      color: #667eea;
      text-decoration: none;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6c757d;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 ClubManager</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello ${this.escapeHtml(firstName)},</p>
      <p class="message">
        We received a request to reset your password for your ClubManager account.
        Click the button below to create a new password.
      </p>
      <div class="button-container">
        <a href="${this.escapeHtml(resetUrl)}" class="button">Reset Password</a>
      </div>
      <p class="message">
        This password reset link will expire in 1 hour for security reasons.
      </p>
      <div class="warning-box">
        <p>
          <strong>⚠️ Security Notice:</strong> If you didn't request a password reset,
          please ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div class="divider"></div>
      <p class="link-text">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${this.escapeHtml(resetUrl)}">${this.escapeHtml(resetUrl)}</a>
      </p>
    </div>
    <div class="footer">
      <p><strong>ClubManager</strong></p>
      <p>Sports Club Management Made Easy</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} ClubManager. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getPasswordResetEmailText(
    firstName: string,
    resetUrl: string,
  ): string {
    return `
Hello ${firstName},

We received a request to reset your password for your ClubManager account.

To reset your password, visit this link:
${resetUrl}

This password reset link will expire in 1 hour for security reasons.

⚠️ SECURITY NOTICE:
If you didn't request a password reset, please ignore this email.
Your password will remain unchanged.

Best regards,
The ClubManager Team

---
ClubManager - Sports Club Management Made Easy
© ${new Date().getFullYear()} ClubManager. All rights reserved.
    `.trim();
  }

  // ============================================================
  // Email Templates - Password Changed
  // ============================================================

  private getPasswordChangedEmailTemplate(firstName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f7;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 30px;
    }
    .success-box {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      text-align: center;
    }
    .success-box .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .success-box p {
      margin: 0;
      font-size: 16px;
      color: #155724;
      font-weight: 600;
    }
    .warning-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .warning-box p {
      margin: 0;
      font-size: 14px;
      color: #856404;
    }
    .info-box {
      background-color: #f8f9fa;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }
    .info-box p {
      margin: 10px 0;
      font-size: 14px;
      color: #495057;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6c757d;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 ClubManager</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello ${this.escapeHtml(firstName)},</p>
      <div class="success-box">
        <div class="icon">✅</div>
        <p>Your password has been changed successfully</p>
      </div>
      <p class="message">
        This email is to confirm that your ClubManager account password was recently changed.
        You can now use your new password to log in to your account.
      </p>
      <div class="info-box">
        <p><strong>📅 Changed on:</strong> ${new Date().toLocaleString(
          "en-US",
          {
            dateStyle: "full",
            timeStyle: "short",
          },
        )}</p>
      </div>
      <div class="warning-box">
        <p>
          <strong>⚠️ Security Alert:</strong> If you did not make this change,
          please contact our support team immediately. Your account may have been compromised.
        </p>
      </div>
      <div class="divider"></div>
      <p class="message" style="font-size: 14px; color: #888888;">
        This is an automated security notification. We recommend using a strong,
        unique password for your ClubManager account.
      </p>
    </div>
    <div class="footer">
      <p><strong>ClubManager</strong></p>
      <p>Sports Club Management Made Easy</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} ClubManager. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getPasswordChangedEmailText(firstName: string): string {
    return `
Hello ${firstName},

✅ Your password has been changed successfully

This email is to confirm that your ClubManager account password was recently changed on ${new Date().toLocaleString(
      "en-US",
      {
        dateStyle: "full",
        timeStyle: "short",
      },
    )}.

You can now use your new password to log in to your account.

⚠️ SECURITY ALERT:
If you did not make this change, please contact our support team immediately.
Your account may have been compromised.

This is an automated security notification. We recommend using a strong,
unique password for your ClubManager account.

Best regards,
The ClubManager Team

---
ClubManager - Sports Club Management Made Easy
© ${new Date().getFullYear()} ClubManager. All rights reserved.
    `.trim();
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (char) => map[char] || char);
  }
}
