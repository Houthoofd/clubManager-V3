/**
 * UpdateUserLanguageUseCase
 * Use Case pour mettre à jour la langue préférée d'un utilisateur
 */

import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

const ALLOWED_LANGUAGES = ['fr', 'en', 'nl', 'de', 'es'] as const;
export type AllowedLanguage = typeof ALLOWED_LANGUAGES[number];

export interface UpdateUserLanguageInput {
  userId: number;
  langue_preferee: string;
}

export class UpdateUserLanguageUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: UpdateUserLanguageInput): Promise<void> {
    const { userId, langue_preferee } = input;

    // Validation : langue autorisée
    if (!ALLOWED_LANGUAGES.includes(langue_preferee as AllowedLanguage)) {
      throw new Error(
        `Langue non autorisée. Valeurs acceptées : ${ALLOWED_LANGUAGES.join(', ')}`
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    // Mise à jour de la langue préférée
    await this.userRepository.updateLanguage(userId, langue_preferee);
  }
}
