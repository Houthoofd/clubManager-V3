/**
 * Errors - Gestion centralisée des erreurs
 * ClubManager V3
 *
 * Utilitaires pour extraire, formater et gérer les erreurs de manière cohérente.
 *
 * @module shared/utils/errors
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Structure d'une erreur API
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Types d'erreurs possibles
 */
export type ErrorType =
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server'
  | 'unknown';

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACTION DE MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extrait un message d'erreur lisible depuis n'importe quel type d'erreur
 *
 * Gère les différents formats d'erreurs :
 * - Erreurs Axios avec response.data.message
 * - Erreurs standard Error
 * - Chaînes de caractères
 * - Objets quelconques
 *
 * @param error - Erreur à traiter
 * @param defaultMessage - Message par défaut si extraction impossible
 * @returns Message d'erreur lisible
 *
 * @example
 * getErrorMessage(new Error("Test")) // "Test"
 * getErrorMessage({ response: { data: { message: "API Error" } } }) // "API Error"
 * getErrorMessage("Something wrong") // "Something wrong"
 * getErrorMessage(null) // "Une erreur inattendue s'est produite."
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "Une erreur inattendue s'est produite."
): string {
  // Vérifier si c'est une erreur Axios
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  // Vérifier si c'est une instance d'Error
  if (error instanceof Error) {
    return error.message;
  }

  // Vérifier si c'est une chaîne
  if (typeof error === "string") {
    return error;
  }

  // Vérifier si c'est un objet avec une propriété message
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * Extrait le code d'erreur depuis une erreur API
 *
 * @param error - Erreur à traiter
 * @returns Code d'erreur ou null
 *
 * @example
 * getErrorCode(axiosError) // "VALIDATION_ERROR"
 */
export function getErrorCode(error: unknown): string | null {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "code" in error.response.data &&
    typeof error.response.data.code === "string"
  ) {
    return error.response.data.code;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

/**
 * Extrait le status HTTP depuis une erreur
 *
 * @param error - Erreur à traiter
 * @returns Status HTTP ou null
 *
 * @example
 * getErrorStatus(axiosError) // 404
 */
export function getErrorStatus(error: unknown): number | null {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// DÉTECTION TYPE D'ERREUR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Détermine le type d'erreur basé sur le status HTTP ou le message
 *
 * @param error - Erreur à analyser
 * @returns Type d'erreur identifié
 *
 * @example
 * getErrorType(404Error) // "not_found"
 * getErrorType(401Error) // "authentication"
 * getErrorType(networkError) // "network"
 */
export function getErrorType(error: unknown): ErrorType {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error).toLowerCase();
  const code = getErrorCode(error);

  // Erreurs réseau
  if (
    message.includes("network") ||
    message.includes("réseau") ||
    code === "NETWORK_ERROR" ||
    code === "ERR_NETWORK"
  ) {
    return "network";
  }

  // Erreurs basées sur le status HTTP
  if (status) {
    if (status === 401) return "authentication";
    if (status === 403) return "authorization";
    if (status === 404) return "not_found";
    if (status === 422) return "validation";
    if (status >= 500) return "server";
  }

  // Erreurs de validation
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("invalide") ||
    code === "VALIDATION_ERROR"
  ) {
    return "validation";
  }

  return "unknown";
}

/**
 * Vérifie si l'erreur est une erreur réseau
 */
export function isNetworkError(error: unknown): boolean {
  return getErrorType(error) === "network";
}

/**
 * Vérifie si l'erreur est une erreur d'authentification (401)
 */
export function isAuthenticationError(error: unknown): boolean {
  return getErrorType(error) === "authentication";
}

/**
 * Vérifie si l'erreur est une erreur d'autorisation (403)
 */
export function isAuthorizationError(error: unknown): boolean {
  return getErrorType(error) === "authorization";
}

/**
 * Vérifie si l'erreur est une erreur 404
 */
export function isNotFoundError(error: unknown): boolean {
  return getErrorType(error) === "not_found";
}

/**
 * Vérifie si l'erreur est une erreur de validation
 */
export function isValidationError(error: unknown): boolean {
  return getErrorType(error) === "validation";
}

/**
 * Vérifie si l'erreur est une erreur serveur (5xx)
 */
export function isServerError(error: unknown): boolean {
  return getErrorType(error) === "server";
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATAGE MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un message d'erreur pour l'affichage utilisateur
 *
 * Remplace les messages techniques par des messages compréhensibles
 *
 * @param error - Erreur à formater
 * @returns Message formaté pour l'utilisateur
 *
 * @example
 * formatErrorMessage(networkError) // "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
 */
export function formatErrorMessage(error: unknown): string {
  const type = getErrorType(error);
  const status = getErrorStatus(error);
  const originalMessage = getErrorMessage(error);

  // Messages personnalisés par type
  switch (type) {
    case "network":
      return "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";

    case "authentication":
      return "Session expirée. Veuillez vous reconnecter.";

    case "authorization":
      return "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";

    case "not_found":
      return "La ressource demandée est introuvable.";

    case "validation":
      return originalMessage || "Les données fournies sont invalides.";

    case "server":
      return "Une erreur serveur s'est produite. Veuillez réessayer plus tard.";

    default:
      // Garder le message original s'il est informatif
      if (originalMessage && originalMessage !== "Une erreur inattendue s'est produite.") {
        return originalMessage;
      }

      // Message générique avec status si disponible
      if (status) {
        return `Une erreur est survenue (${status}). Veuillez réessayer.`;
      }

      return "Une erreur inattendue s'est produite.";
  }
}

/**
 * Génère un message d'erreur contextualisé
 *
 * @param error - Erreur à traiter
 * @param context - Contexte de l'erreur (action en cours)
 * @returns Message d'erreur avec contexte
 *
 * @example
 * formatContextualError(error, "la création de l'utilisateur")
 * // "Erreur lors de la création de l'utilisateur : Session expirée."
 */
export function formatContextualError(error: unknown, context: string): string {
  const message = formatErrorMessage(error);
  return `Erreur lors de ${context} : ${message}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERREURS DE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extrait les erreurs de validation champ par champ depuis une réponse API
 *
 * @param error - Erreur à analyser
 * @returns Objet avec erreurs par champ
 *
 * @example
 * getValidationErrors(apiError)
 * // { email: ["L'email est invalide"], password: ["Le mot de passe est trop court"] }
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "errors" in error.response.data &&
    typeof error.response.data.errors === "object"
  ) {
    return error.response.data.errors as Record<string, string[]>;
  }

  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    typeof error.errors === "object"
  ) {
    return error.errors as Record<string, string[]>;
  }

  return {};
}

/**
 * Formate les erreurs de validation pour l'affichage
 *
 * @param errors - Erreurs de validation
 * @returns Texte formaté avec toutes les erreurs
 *
 * @example
 * formatValidationErrors({ email: ["Invalide"], password: ["Trop court"] })
 * // "• Email : Invalide\n• Password : Trop court"
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages: string[] = [];

  for (const [field, fieldErrors] of Object.entries(errors)) {
    const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
    fieldErrors.forEach(error => {
      messages.push(`• ${capitalizedField} : ${error}`);
    });
  }

  return messages.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log une erreur dans la console en mode développement
 *
 * @param error - Erreur à logger
 * @param context - Contexte optionnel
 *
 * @example
 * logError(error, "Création utilisateur")
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.group(
      `%c❌ Error${context ? ` - ${context}` : ''}`,
      'color: #ef4444; font-weight: bold;'
    );
    console.error('Message:', getErrorMessage(error));
    console.error('Type:', getErrorType(error));
    console.error('Status:', getErrorStatus(error));
    console.error('Code:', getErrorCode(error));
    console.error('Original:', error);
    console.groupEnd();
  }
}

/**
 * Crée un objet d'erreur structuré pour l'envoi à un service de monitoring
 *
 * @param error - Erreur à structurer
 * @param context - Contexte optionnel
 * @returns Objet structuré pour monitoring (Sentry, etc.)
 *
 * @example
 * const errorData = createErrorReport(error, "API Call");
 * Sentry.captureException(errorData);
 */
export function createErrorReport(error: unknown, context?: string): ApiError {
  return {
    message: getErrorMessage(error),
    code: getErrorCode(error) || undefined,
    status: getErrorStatus(error) || undefined,
    errors: isValidationError(error) ? getValidationErrors(error) : undefined,
    ...(context && { context })
  };
}
