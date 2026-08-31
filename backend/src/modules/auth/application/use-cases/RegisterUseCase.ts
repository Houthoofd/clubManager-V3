/**
 * RegisterUseCase
 * Use case pour l'inscription d'un nouvel utilisateur
 */

import type { RegisterDto } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { MySQLPaymentScheduleRepository } from "@/modules/payments/infrastructure/repositories/MySQLPaymentScheduleRepository.js";
import { MySQLPricingPlanRepository } from "@/modules/payments/infrastructure/repositories/MySQLPricingPlanRepository.js";
import { MySQLUserRepository } from "@/modules/users/infrastructure/repositories/MySQLUserRepository.js";
import { GenerateSchedulesUseCase } from "@/modules/payments/application/use-cases/schedules/GenerateSchedulesUseCase.js";
import { PasswordService } from "@/shared/services/PasswordService.js";
import { TokenService } from "@/shared/services/TokenService.js";
import { EmailService } from "../services/EmailService.js";
import { MySQLInvitationRepository } from "@/modules/invitations/infrastructure/repositories/MySQLInvitationRepository.js";
import { ValidateInvitationUseCase } from "@/modules/invitations/application/use-cases/ValidateInvitationUseCase.js";
import { ConsumeInvitationUseCase } from "@/modules/invitations/application/use-cases/ConsumeInvitationUseCase.js";

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    firstName: string;
  };
}

export class RegisterUseCase {
  private emailService: EmailService;
  private validateInvitationUC: ValidateInvitationUseCase;
  private consumeInvitationUC: ConsumeInvitationUseCase;

  constructor(private authRepository: IAuthRepository) {
    this.emailService = new EmailService();
    const invitationRepo = new MySQLInvitationRepository();
    this.validateInvitationUC = new ValidateInvitationUseCase(invitationRepo);
    this.consumeInvitationUC = new ConsumeInvitationUseCase(invitationRepo);
  }

  /**
   * Execute le use case d'inscription
   * @param dto - Données d'inscription
   * @returns Promise<AuthResponseDto> - Réponse avec utilisateur et tokens
   */
  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 1b. Valider le token d'invitation (inscription sur invitation uniquement)
    const invitationResult = await this.validateInvitationUC.execute({
      token: dto.invitation_token,
    });
    if (!invitationResult.valid) {
      throw new Error(invitationResult.error ?? "Token d'invitation invalide.");
    }
    // Vérifier que l'email du formulaire correspond à l'invitation
    if (invitationResult.email && invitationResult.email.toLowerCase() !== dto.email.toLowerCase()) {
      throw new Error("L'adresse email ne correspond pas à l'invitation.");
    }

    // 2. Vérifier que l'email n'est pas déjà utilisé
    const emailTaken = await this.authRepository.emailExists(dto.email);
    if (emailTaken) {
      throw new Error("Cette adresse email est déjà associée à un compte.");
    }

    // 3. Valider la force du mot de passe
    const passwordValidation = PasswordService.validatePasswordStrength(
      dto.password,
    );
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`,
      );
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await PasswordService.hash(dto.password);

    // Auto-générer le nom d'utilisateur
    const cleanFirstName = dto.first_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLastName = dto.last_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const baseUsername = `${cleanFirstName}.${cleanLastName}`.substring(0, 45);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedUsername = `${baseUsername}${randomSuffix}`;

    // 4. Créer l'utilisateur
    const user = await this.authRepository.createUser({
      first_name: dto.first_name,
      last_name: dto.last_name,
      nom_utilisateur: generatedUsername,
      email: dto.email,
      password: hashedPassword,
      date_of_birth: new Date(dto.date_of_birth),
      genre_id: dto.genre_id,
      abonnement_id: dto.abonnement_id,
    });

    // 4b. Consommer le token d'invitation
    await this.consumeInvitationUC.execute({ token: dto.invitation_token });

    // 5. Générer et stocker le token de vérification email
    const emailVerificationToken =
      TokenService.generateEmailVerificationToken();
    await this.authRepository.storeEmailVerificationToken(
      user.id,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt,
      user.email,
    );

    // 6. Construire l'URL de vérification
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${emailVerificationToken.token}`;

    // 7. Envoyer l'email de vérification avec l'userId
    const emailResult = await this.emailService.sendVerificationEmail(
      user.email,
      user.first_name,
      verificationUrl,
      user.userId,
    );

    if (!emailResult.success) {
      // On log l'erreur mais on ne bloque pas l'inscription
      // L'utilisateur peut redemander l'email depuis la page de connexion
      console.error(
        "Failed to send verification email after registration:",
        emailResult.error,
      );
      // En dev, logger le lien pour pouvoir tester sans domaine vérifié
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `\n[RegisterUseCase][DEV] 📧 Lien de vérification (email non envoyé)\n` +
            `  UserId:  ${user.userId}\n` +
            `  Email:   ${user.email}\n` +
            `  Lien:    ${verificationUrl}\n`,
        );
      }
    }

    // 8. Retourner la réponse sans tokens — connexion impossible avant vérification email
    return {
      success: true,
      message:
        "Compte créé avec succès. Veuillez vérifier votre adresse email pour activer votre compte.",
      data: {
        userId: user.userId,
        email: user.email,
        firstName: user.first_name,
      },
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(dto: RegisterDto): void {
    // Valider les champs requis
    if (!dto.first_name || dto.first_name.trim().length === 0) {
      throw new Error("First name is required");
    }

    if (!dto.last_name || dto.last_name.trim().length === 0) {
      throw new Error("Last name is required");
    }

    if (!dto.email || dto.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    if (!dto.password || dto.password.trim().length === 0) {
      throw new Error("Password is required");
    }

    if (!dto.date_of_birth) {
      throw new Error("Date of birth is required");
    }

    if (!dto.genre_id) {
      throw new Error("Genre is required");
    }

    // Valider le format de l'email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(dto.email)) {
      throw new Error("Invalid email format");
    }

    // Valider la date de naissance
    const birthDate = new Date(dto.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 5 || age > 120) {
      throw new Error("Invalid date of birth");
    }

    // Valider la longueur des noms
    if (dto.first_name.length > 100) {
      throw new Error("First name is too long (max 100 characters)");
    }

    if (dto.last_name.length > 100) {
      throw new Error("Last name is too long (max 100 characters)");
    }

    if (dto.nom_utilisateur && dto.nom_utilisateur.length > 50) {
      throw new Error("Username is too long (max 50 characters)");
    }
  }
}


