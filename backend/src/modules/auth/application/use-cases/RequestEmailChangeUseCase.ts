/**
 * RequestEmailChangeUseCase
 * GAP-15 — Demande de changement d'email
 *
 * Flow :
 * 1. Vérifie que l'utilisateur existe
 * 2. Vérifie que le nouvel email n'est pas déjà pris
 * 3. Génère un token sécurisé (24h)
 * 4. Stocke le token en DB (type change_email)
 * 5. Envoie un email de confirmation au NOUVEL email
 */

import crypto from "crypto";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { EmailService } from "../services/EmailService.js";

export class RequestEmailChangeUseCase {
  private emailService = new EmailService();

  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(userId: number, newEmail: string): Promise<void> {
    const normalizedEmail = newEmail.trim().toLowerCase();

    // 1. Récupérer l'utilisateur
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // 2. L'email est-il identique à l'actuel ?
    if (user.email?.toLowerCase() === normalizedEmail) {
      throw new Error("EMAIL_SAME_AS_CURRENT");
    }

    // 3. Le nouvel email est-il déjà utilisé ?
    const emailTaken = await this.authRepository.emailExists(normalizedEmail);
    if (emailTaken) {
      throw new Error("EMAIL_ALREADY_TAKEN");
    }

    // 4. Générer le token (32 octets = 64 hex)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // 5. Stocker le token
    await this.authRepository.storeEmailChangeToken(
      userId,
      token,
      normalizedEmail,
      expiresAt,
    );

    // 6. Envoyer l'email de confirmation au NOUVEL email
    const firstName = user.first_name ?? "";
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const confirmUrl = `${frontendUrl}/confirm-email-change?token=${token}`;

    await this.emailService.sendEmailChangeConfirmationEmail(
      normalizedEmail,
      firstName,
      confirmUrl,
    );
  }
}
