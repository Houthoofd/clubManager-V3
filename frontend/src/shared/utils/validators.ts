/**
 * Validators - Validations communes
 * ClubManager V3
 *
 * Fonctions de validation réutilisables pour garantir l'intégrité des données.
 * Toutes les fonctions retournent true si la validation passe, false sinon.
 *
 * @module shared/utils/validators
 */

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL & CONTACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide une adresse email
 *
 * @param email - Email à valider
 * @returns true si l'email est valide
 *
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valide un numéro de téléphone français
 *
 * @param phone - Numéro à valider
 * @returns true si le numéro est valide (format français)
 *
 * @example
 * isValidPhone("0612345678") // true
 * isValidPhone("+33612345678") // true
 * isValidPhone("12345") // false
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;

  const cleaned = phone.replace(/\s+/g, '');

  // Format français : 0X XX XX XX XX
  const frenchRegex = /^0[1-9]\d{8}$/;

  // Format international : +33 X XX XX XX XX
  const internationalRegex = /^\+33[1-9]\d{8}$/;

  return frenchRegex.test(cleaned) || internationalRegex.test(cleaned);
}

/**
 * Valide une URL
 *
 * @param url - URL à valider
 * @returns true si l'URL est valide
 *
 * @example
 * isValidUrl("https://example.com") // true
 * isValidUrl("not-a-url") // false
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOT DE PASSE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide la force d'un mot de passe
 *
 * Critères :
 * - Minimum 8 caractères
 * - Au moins une minuscule
 * - Au moins une majuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial
 *
 * @param password - Mot de passe à valider
 * @returns true si le mot de passe est fort
 *
 * @example
 * isStrongPassword("Test123!") // true
 * isStrongPassword("weak") // false
 */
export function isStrongPassword(password: string | null | undefined): boolean {
  if (!password) return false;

  const minLength = password.length >= 8;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
}

/**
 * Vérifie la longueur minimale d'un mot de passe
 *
 * @param password - Mot de passe à valider
 * @param minLength - Longueur minimale (défaut: 8)
 * @returns true si la longueur est suffisante
 */
export function hasMinLength(password: string | null | undefined, minLength: number = 8): boolean {
  if (!password) return false;
  return password.length >= minLength;
}

/**
 * Vérifie si le mot de passe contient une minuscule
 */
export function hasLowerCase(password: string | null | undefined): boolean {
  if (!password) return false;
  return /[a-z]/.test(password);
}

/**
 * Vérifie si le mot de passe contient une majuscule
 */
export function hasUpperCase(password: string | null | undefined): boolean {
  if (!password) return false;
  return /[A-Z]/.test(password);
}

/**
 * Vérifie si le mot de passe contient un chiffre
 */
export function hasNumber(password: string | null | undefined): boolean {
  if (!password) return false;
  return /\d/.test(password);
}

/**
 * Vérifie si le mot de passe contient un caractère spécial
 */
export function hasSpecialChar(password: string | null | undefined): boolean {
  if (!password) return false;
  return /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

// ═══════════════════════════════════════════════════════════════════════════
// DATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide une date
 *
 * @param date - Date à valider
 * @returns true si la date est valide
 *
 * @example
 * isValidDate("2024-03-15") // true
 * isValidDate("invalid") // false
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}

/**
 * Vérifie si une date est dans le futur
 *
 * @param date - Date à vérifier
 * @returns true si la date est dans le futur
 */
export function isFutureDate(date: string | Date | null | undefined): boolean {
  if (!isValidDate(date)) return false;

  const d = typeof date === 'string' ? new Date(date) : date!;
  return d.getTime() > Date.now();
}

/**
 * Vérifie si une date est dans le passé
 *
 * @param date - Date à vérifier
 * @returns true si la date est dans le passé
 */
export function isPastDate(date: string | Date | null | undefined): boolean {
  if (!isValidDate(date)) return false;

  const d = typeof date === 'string' ? new Date(date) : date!;
  return d.getTime() < Date.now();
}

/**
 * Vérifie si une personne est majeure (18 ans)
 *
 * @param birthDate - Date de naissance
 * @returns true si la personne a 18 ans ou plus
 *
 * @example
 * isAdult("2000-01-01") // true
 * isAdult("2010-01-01") // false
 */
export function isAdult(birthDate: string | Date | null | undefined): boolean {
  if (!isValidDate(birthDate)) return false;

  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate!;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 18;
}

/**
 * Vérifie si une personne est mineure (< 18 ans)
 *
 * @param birthDate - Date de naissance
 * @returns true si la personne a moins de 18 ans
 */
export function isMinor(birthDate: string | Date | null | undefined): boolean {
  return isValidDate(birthDate) && !isAdult(birthDate);
}

/**
 * Vérifie si une date est dans une plage donnée
 *
 * @param date - Date à vérifier
 * @param min - Date minimale
 * @param max - Date maximale
 * @returns true si la date est dans la plage
 */
export function isDateInRange(
  date: string | Date | null | undefined,
  min: string | Date | null | undefined,
  max: string | Date | null | undefined
): boolean {
  if (!isValidDate(date)) return false;
  if (!isValidDate(min) || !isValidDate(max)) return false;

  const d = typeof date === 'string' ? new Date(date) : date!;
  const minDate = typeof min === 'string' ? new Date(min) : min!;
  const maxDate = typeof max === 'string' ? new Date(max) : max!;

  return d >= minDate && d <= maxDate;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOMBRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si une valeur est un nombre valide
 *
 * @param value - Valeur à vérifier
 * @returns true si la valeur est un nombre valide
 */
export function isValidNumber(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Vérifie si un nombre est positif
 *
 * @param value - Nombre à vérifier
 * @returns true si le nombre est > 0
 */
export function isPositive(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return value > 0;
}

/**
 * Vérifie si un nombre est positif ou zéro
 *
 * @param value - Nombre à vérifier
 * @returns true si le nombre est >= 0
 */
export function isPositiveOrZero(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return value >= 0;
}

/**
 * Vérifie si un nombre est dans une plage donnée
 *
 * @param value - Nombre à vérifier
 * @param min - Valeur minimale
 * @param max - Valeur maximale
 * @returns true si le nombre est dans la plage
 */
export function isInRange(
  value: number | null | undefined,
  min: number,
  max: number
): boolean {
  if (value === null || value === undefined) return false;
  return value >= min && value <= max;
}

/**
 * Vérifie si un nombre est un entier
 *
 * @param value - Nombre à vérifier
 * @returns true si le nombre est un entier
 */
export function isInteger(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return Number.isInteger(value);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si un texte n'est pas vide
 *
 * @param text - Texte à vérifier
 * @returns true si le texte contient au moins un caractère non-espace
 */
export function isNotEmpty(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.trim().length > 0;
}

/**
 * Vérifie la longueur minimale d'un texte
 *
 * @param text - Texte à vérifier
 * @param minLength - Longueur minimale
 * @returns true si le texte a au moins minLength caractères
 */
export function hasMinTextLength(text: string | null | undefined, minLength: number): boolean {
  if (!text) return false;
  return text.trim().length >= minLength;
}

/**
 * Vérifie la longueur maximale d'un texte
 *
 * @param text - Texte à vérifier
 * @param maxLength - Longueur maximale
 * @returns true si le texte a au plus maxLength caractères
 */
export function hasMaxTextLength(text: string | null | undefined, maxLength: number): boolean {
  if (!text) return true; // Texte vide ou null passe la validation max
  return text.trim().length <= maxLength;
}

/**
 * Vérifie si un texte contient uniquement des lettres
 *
 * @param text - Texte à vérifier
 * @returns true si le texte ne contient que des lettres (a-z, A-Z, accents)
 */
export function isAlphabetic(text: string | null | undefined): boolean {
  if (!text) return false;
  return /^[a-zA-ZÀ-ÿ\s-]+$/.test(text);
}

/**
 * Vérifie si un texte contient uniquement des lettres et des chiffres
 *
 * @param text - Texte à vérifier
 * @returns true si le texte ne contient que des lettres et des chiffres
 */
export function isAlphanumeric(text: string | null | undefined): boolean {
  if (!text) return false;
  return /^[a-zA-Z0-9À-ÿ\s-]+$/.test(text);
}

// ═══════════════════════════════════════════════════════════════════════════
// IDENTIFIANTS FRANÇAIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide un code postal français
 *
 * @param postalCode - Code postal à valider
 * @returns true si le code postal est valide (5 chiffres)
 *
 * @example
 * isValidPostalCode("75001") // true
 * isValidPostalCode("1234") // false
 */
export function isValidPostalCode(postalCode: string | null | undefined): boolean {
  if (!postalCode) return false;
  return /^\d{5}$/.test(postalCode);
}

/**
 * Valide un numéro SIRET français
 *
 * @param siret - Numéro SIRET à valider
 * @returns true si le SIRET est valide (14 chiffres)
 *
 * @example
 * isValidSiret("12345678901234") // true (si algorithme de Luhn OK)
 */
export function isValidSiret(siret: string | null | undefined): boolean {
  if (!siret) return false;

  const cleaned = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) return false;

  // Algorithme de Luhn
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Valide un numéro SIREN français
 *
 * @param siren - Numéro SIREN à valider
 * @returns true si le SIREN est valide (9 chiffres)
 *
 * @example
 * isValidSiren("123456789") // true (si algorithme de Luhn OK)
 */
export function isValidSiren(siren: string | null | undefined): boolean {
  if (!siren) return false;

  const cleaned = siren.replace(/\s/g, '');
  if (!/^\d{9}$/.test(cleaned)) return false;

  // Algorithme de Luhn
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleaned[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Valide un IBAN
 *
 * @param iban - IBAN à valider
 * @returns true si l'IBAN est valide
 *
 * @example
 * isValidIban("FR7612345678901234567890123") // true (si format OK)
 */
export function isValidIban(iban: string | null | undefined): boolean {
  if (!iban) return false;

  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  // Vérifier le format de base (2 lettres + 2 chiffres + max 30 caractères)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;

  // Longueur selon le pays (FR = 27)
  const countryLengths: Record<string, number> = {
    FR: 27,
    BE: 16,
    DE: 22,
    ES: 24,
    IT: 27,
    PT: 25,
  };

  const country = cleaned.substring(0, 2);
  if (countryLengths[country] && cleaned.length !== countryLengths[country]) {
    return false;
  }

  // Algorithme de validation IBAN
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
  const numericString = rearranged
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    })
    .join('');

  // Modulo 97
  let remainder = '';
  for (const digit of numericString) {
    remainder = (parseInt(remainder + digit, 10) % 97).toString();
  }

  return remainder === '1';
}

// ═══════════════════════════════════════════════════════════════════════════
// FICHIERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide l'extension d'un fichier
 *
 * @param filename - Nom du fichier
 * @param allowedExtensions - Extensions autorisées
 * @returns true si l'extension est autorisée
 *
 * @example
 * isValidFileExtension("photo.jpg", [".jpg", ".png"]) // true
 * isValidFileExtension("doc.pdf", [".jpg", ".png"]) // false
 */
export function isValidFileExtension(
  filename: string | null | undefined,
  allowedExtensions: string[]
): boolean {
  if (!filename) return false;

  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.map(e => e.toLowerCase()).includes(ext);
}

/**
 * Valide la taille d'un fichier
 *
 * @param fileSize - Taille du fichier en octets
 * @param maxSizeInMB - Taille maximale en Mo
 * @returns true si la taille est acceptable
 *
 * @example
 * isValidFileSize(2048000, 5) // true (2 Mo < 5 Mo)
 * isValidFileSize(10485760, 5) // false (10 Mo > 5 Mo)
 */
export function isValidFileSize(fileSize: number | null | undefined, maxSizeInMB: number): boolean {
  if (fileSize === null || fileSize === undefined) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
}

/**
 * Valide qu'un fichier est une image
 *
 * @param filename - Nom du fichier
 * @returns true si c'est une image
 */
export function isImageFile(filename: string | null | undefined): boolean {
  return isValidFileExtension(filename, ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);
}

/**
 * Valide qu'un fichier est un PDF
 *
 * @param filename - Nom du fichier
 * @returns true si c'est un PDF
 */
export function isPdfFile(filename: string | null | undefined): boolean {
  return isValidFileExtension(filename, ['.pdf']);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS DE VALIDATION COMPOSÉE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide plusieurs conditions (ET logique)
 *
 * @param validators - Fonctions de validation à exécuter
 * @returns true si toutes les validations passent
 *
 * @example
 * validateAll([
 *   () => isNotEmpty(name),
 *   () => hasMinTextLength(name, 2),
 *   () => isAlphabetic(name)
 * ])
 */
export function validateAll(validators: (() => boolean)[]): boolean {
  return validators.every(validator => validator());
}

/**
 * Valide au moins une condition (OU logique)
 *
 * @param validators - Fonctions de validation à exécuter
 * @returns true si au moins une validation passe
 *
 * @example
 * validateAny([
 *   () => isValidEmail(contact),
 *   () => isValidPhone(contact)
 * ])
 */
export function validateAny(validators: (() => boolean)[]): boolean {
  return validators.some(validator => validator());
}
