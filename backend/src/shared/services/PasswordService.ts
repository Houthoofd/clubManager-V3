/**
 * PasswordService
 * Service pour gérer le hashing et la validation des mots de passe
 * Utilise bcrypt pour le hashing sécurisé
 */

import bcrypt from "bcryptjs";

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly MAX_PASSWORD_LENGTH = 128;

  /**
   * Hash un mot de passe avec bcrypt
   * @param password - Mot de passe en clair
   * @returns Promise<string> - Hash du mot de passe
   */
  static async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error("Password is required");
    }

    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new Error(
        `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`,
      );
    }

    if (password.length > this.MAX_PASSWORD_LENGTH) {
      throw new Error(
        `Password must not exceed ${this.MAX_PASSWORD_LENGTH} characters`,
      );
    }

    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      return hash;
    } catch (error) {
      throw new Error("Failed to hash password");
    }
  }

  /**
   * Compare un mot de passe en clair avec un hash
   * @param password - Mot de passe en clair
   * @param hash - Hash à comparer
   * @returns Promise<boolean> - true si les mots de passe correspondent
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valide la force d'un mot de passe
   * @param password - Mot de passe à valider
   * @returns { isValid: boolean, errors: string[] }
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password) {
      errors.push("Password is required");
      return { isValid: false, errors };
    }

    // Longueur
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(
        `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`,
      );
    }

    if (password.length > this.MAX_PASSWORD_LENGTH) {
      errors.push(
        `Password must not exceed ${this.MAX_PASSWORD_LENGTH} characters`,
      );
    }

    // Au moins une lettre majuscule
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    // Au moins une lettre minuscule
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    // Au moins un chiffre
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    // Au moins un caractère spécial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Génère un mot de passe aléatoire sécurisé
   * @param length - Longueur du mot de passe (défaut: 16)
   * @returns string - Mot de passe généré
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = uppercase + lowercase + numbers + special;

    let password = "";

    // Garantir au moins un caractère de chaque type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Compléter avec des caractères aléatoires
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mélanger les caractères
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}
