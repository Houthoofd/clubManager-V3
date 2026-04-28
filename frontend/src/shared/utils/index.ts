/**
 * Shared Utils - Point d'entrée centralisé
 * ClubManager V3
 *
 * Exports tous les utilitaires partagés pour faciliter les imports.
 *
 * @example
 * ```typescript
 * // Import unique
 * import { formatDate, formatCurrency, getErrorMessage } from '@/shared/utils';
 *
 * // Au lieu de
 * import { formatDate } from '@/shared/utils/formatters';
 * import { getErrorMessage } from '@/shared/utils/errors';
 * ```
 *
 * @module shared/utils
 */

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTERS - Formatage de données
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Dates & Heures
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatRelativeDate,

  // Nombres & Monnaie
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatCompactNumber,

  // Texte & Identité
  formatFullName,
  formatInitials,
  truncate,
  capitalize,

  // Contact
  formatPhone,
  formatEmail,

  // Taille & Fichiers
  formatFileSize,

  // Genres & Rôles
  formatGender,
  formatRole,

  // Statuts
  formatPaymentStatus,
  formatOrderStatus,

  // Âge & Anniversaires
  formatAge,
  calculateAge,
} from './formatters';

// ═══════════════════════════════════════════════════════════════════════════
// ERRORS - Gestion des erreurs
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Types
  type ApiError,
  type ErrorType,

  // Extraction de messages
  getErrorMessage,
  getErrorCode,
  getErrorStatus,

  // Détection type d'erreur
  getErrorType,
  isNetworkError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isValidationError,
  isServerError,

  // Formatage messages
  formatErrorMessage,
  formatContextualError,

  // Erreurs de validation
  getValidationErrors,
  formatValidationErrors,

  // Logging
  logError,
  createErrorReport,
} from './errors';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATORS - Validations
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Email & Contact
  isValidEmail,
  isValidPhone,
  isValidUrl,

  // Mot de passe
  isStrongPassword,
  hasMinLength,
  hasLowerCase,
  hasUpperCase,
  hasNumber,
  hasSpecialChar,

  // Dates
  isValidDate,
  isFutureDate,
  isPastDate,
  isAdult,
  isMinor,
  isDateInRange,

  // Nombres
  isValidNumber,
  isPositive,
  isPositiveOrZero,
  isInRange,
  isInteger,

  // Texte
  isNotEmpty,
  hasMinTextLength,
  hasMaxTextLength,
  isAlphabetic,
  isAlphanumeric,

  // Identifiants français
  isValidPostalCode,
  isValidSiret,
  isValidSiren,
  isValidIban,

  // Fichiers
  isValidFileExtension,
  isValidFileSize,
  isImageFile,
  isPdfFile,

  // Helpers de validation composée
  validateAll,
  validateAny,
} from './validators';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS - Utilitaires divers
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Manipulation de tableaux
  removeDuplicates,
  removeDuplicatesByKey,
  chunk,
  shuffle,
  groupBy,
  sortBy,
  findFirst,
  findLast,

  // Manipulation d'objets
  removeEmpty,
  pick,
  omit,
  isEmpty,
  deepClone,

  // Classes CSS (Tailwind)
  cn,
  classNames,

  // Debounce & Throttle
  debounce,
  throttle,

  // Génération
  generateId,
  generateColor,
  getInitials,

  // Attente & Retry
  sleep,
  retry,

  // Navigation & URL
  parseQueryParams,
  buildQueryString,

  // Stockage local
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,

  // Clipboard
  copyToClipboard,

  // Calculs
  average,
  sum,
  min,
  max,
  round,
  clamp,

  // Détection navigateur
  isMobile,
  isIOS,
  isAndroid,

  // Divers
  downloadFile,
  scrollToElement,
  isDefined,
  defaultTo,
} from './helpers';
