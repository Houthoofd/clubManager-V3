/**
 * Types TypeScript pour le système i18n
 * Fournit une autocomplétion et une type-safety pour les traductions
 *
 * Namespaces supportés :
 * - common: Éléments communs (navigation, boutons, labels)
 * - auth: Authentification (login, register, passwords)
 * - settings: Paramètres (configuration, préférences)
 * - errors: Messages d'erreur (validation, network, database)
 * - courses: Gestion des cours (création, inscription, planning)
 * - store: Boutique (produits, commandes, panier)
 * - payments: Paiements (cotisations, factures, historique)
 * - statistics: Statistiques (tableaux de bord, rapports)
 * - messages: Messagerie (conversations, notifications)
 */

import "react-i18next";

/**
 * Type pour les codes de langue supportés
 */
export type LanguageCode = "fr" | "en";

/**
 * Type pour les namespaces disponibles
 */
export type Namespace =
  | "common"
  | "auth"
  | "settings"
  | "errors"
  | "courses"
  | "store"
  | "payments"
  | "statistics"
  | "messages";

/**
 * Type pour les informations d'une langue
 */
export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  flag: string;
}

/**
 * Type pour les paramètres d'interpolation
 */
export interface InterpolationParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Type pour les options de traduction
 */
export interface TranslationOptions {
  count?: number;
  context?: string;
  defaultValue?: string;
  ns?: Namespace;
  [key: string]: any;
}

/**
 * Type helper pour extraire les clés imbriquées d'un objet
 */
export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

/**
 * Type pour le retour du hook useTranslation
 */
export interface UseTranslationReturn<N extends Namespace = "common"> {
  t: (key: string, options?: TranslationOptions) => string;
  i18n: {
    language: LanguageCode;
    changeLanguage: (lng: LanguageCode) => Promise<void>;
    exists: (key: string, options?: { ns?: N }) => boolean;
    getFixedT: (lng?: LanguageCode, ns?: N) => (key: string) => string;
  };
  ready: boolean;
}

/**
 * Type pour les ressources de traduction
 */
export interface TranslationResources {
  [key: string]: {
    [namespace: string]: Record<string, any>;
  };
}

/**
 * Type pour la configuration i18next
 */
export interface I18nConfig {
  fallbackLng: LanguageCode;
  defaultNS: Namespace;
  ns: Namespace[];
  supportedLngs: LanguageCode[];
  interpolation: {
    escapeValue: boolean;
    formatSeparator?: string;
  };
  detection?: {
    order: string[];
    lookupLocalStorage: string;
    caches: string[];
  };
  react?: {
    useSuspense: boolean;
    bindI18n?: string;
    bindI18nStore?: string;
  };
  debug?: boolean;
}

/**
 * Type pour les erreurs de validation
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Type pour les erreurs réseau
 */
export interface NetworkError {
  status: number;
  message: string;
  code: string;
}

/**
 * Type pour les paramètres de date/heure
 */
export interface DateTimeParams {
  date?: Date | string;
  format?: string;
  locale?: LanguageCode;
}

/**
 * Type pour les formats de date
 */
export type DateFormat =
  | "short" // 01/01/2024
  | "medium" // 1 jan. 2024
  | "long" // 1 janvier 2024
  | "full"; // lundi 1 janvier 2024

/**
 * Type pour les formats d'heure
 */
export type TimeFormat =
  | "12h" // 2:30 PM
  | "24h"; // 14:30

/**
 * Type pour les préférences de localisation
 */
export interface LocalizationPreferences {
  language: LanguageCode;
  timezone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  firstDayOfWeek: 0 | 1; // 0 = dimanche, 1 = lundi
  numberFormat: {
    decimalSeparator: "." | ",";
    thousandSeparator: "," | "." | " ";
  };
}

/**
 * Type pour le contexte de langue
 */
export interface LanguageContext {
  currentLanguage: LanguageCode;
  availableLanguages: readonly LanguageInfo[];
  changeLanguage: (lng: LanguageCode) => Promise<void>;
  isRTL: boolean;
}

/**
 * Type guard pour vérifier si une valeur est un LanguageCode valide
 */
export function isValidLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && ["fr", "en"].includes(value);
}

/**
 * Type guard pour vérifier si une valeur est un Namespace valide
 */
export function isValidNamespace(value: unknown): value is Namespace {
  return (
    typeof value === "string" &&
    [
      "common",
      "auth",
      "settings",
      "errors",
      "courses",
      "store",
      "payments",
      "statistics",
      "messages",
    ].includes(value)
  );
}

/**
 * Type pour les métadonnées de traduction
 */
export interface TranslationMetadata {
  key: string;
  namespace: Namespace;
  language: LanguageCode;
  value: string;
  lastUpdated?: Date;
}

/**
 * Type pour les statistiques de traduction
 */
export interface TranslationStats {
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  coverage: number; // Pourcentage
}

/**
 * Export de types utilitaires
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Flatten<T> = T extends object
  ? { [K in keyof T]: Flatten<T[K]> }
  : T;

/**
 * Type pour le retour du hook useLanguage
 */
export interface UseLanguageReturn {
  language: string;
  changeLanguage: (newLang: string) => Promise<void>;
  availableLanguages: readonly LanguageInfo[];
  isChanging: boolean;
}
