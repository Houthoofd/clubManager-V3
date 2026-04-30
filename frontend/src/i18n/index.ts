/**
 * i18n Configuration
 * Configuration complète de react-i18next pour le multilingue
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import des traductions FR
import commonFr from "./locales/fr/common.json";
import authFr from "./locales/fr/auth.json";
import settingsFr from "./locales/fr/settings.json";
import errorsFr from "./locales/fr/errors.json";
import coursesFr from "./locales/fr/courses.json";
import storeFr from "./locales/fr/store.json";
import paymentsFr from "./locales/fr/payments.json";
import statisticsFr from "./locales/fr/statistics.json";
import messagesFr from "./locales/fr/messages.json";
import familiesFr from "./locales/fr/families.json";
import usersFr from "./locales/fr/users.json";
import dashboardFr from "./locales/fr/dashboard.json";
import groupsFr from "./locales/fr/groups.json";

// Import des traductions EN
import commonEn from "./locales/en/common.json";
import authEn from "./locales/en/auth.json";
import settingsEn from "./locales/en/settings.json";
import errorsEn from "./locales/en/errors.json";
import coursesEn from "./locales/en/courses.json";
import storeEn from "./locales/en/store.json";
import paymentsEn from "./locales/en/payments.json";
import statisticsEn from "./locales/en/statistics.json";
import messagesEn from "./locales/en/messages.json";
import familiesEn from "./locales/en/families.json";
import usersEn from "./locales/en/users.json";
import dashboardEn from "./locales/en/dashboard.json";
import groupsEn from "./locales/en/groups.json";

/**
 * Namespaces disponibles pour l'application
 * Chaque namespace correspond à une section de l'application
 */
export const namespaces = [
  "common", // Éléments communs (navigation, boutons, labels génériques)
  "auth", // Authentification (login, register, forgot password)
  "settings", // Paramètres de l'application
  "errors", // Messages d'erreur
  "courses", // Gestion des cours
  "store", // Boutique/magasin
  "payments", // Paiements
  "statistics", // Statistiques
  "messages", // Messagerie
  "families", // Gestion des familles
  "users", // Gestion des utilisateurs
  "dashboard", // Tableau de bord
  "groups", // Gestion des groupes
] as const;

/**
 * Type pour les namespaces
 */
export type Namespace = (typeof namespaces)[number];

/**
 * Langues supportées par l'application
 */
export const supportedLanguages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  // Langues futures extensibles
  // { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  // { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  // { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const;

/**
 * Codes de langues supportées
 */
export const languageCodes = supportedLanguages.map((lang) => lang.code);

/**
 * Langue par défaut
 */
export const defaultLanguage = "fr";

/**
 * Configuration du détecteur de langue
 * Ordre de détection :
 * 1. localStorage ('user-language')
 * 2. Langue du navigateur
 */
const languageDetectorOptions = {
  // Ordre de détection
  order: ["localStorage", "navigator"],

  // Clés pour le stockage
  lookupLocalStorage: "user-language",

  // Cache la langue détectée
  caches: ["localStorage"],

  // Exclure les cookies pour la détection (on utilise uniquement localStorage)
  excludeCacheFor: ["cookie"],
};

/**
 * Configuration i18next
 */
i18n
  // Détection automatique de la langue
  .use(LanguageDetector)

  // Passer l'instance i18n à react-i18next
  .use(initReactI18next)

  // Initialiser i18next
  .init({
    // Ressources de traduction
    resources: {
      fr: {
        common: commonFr,
        auth: authFr,
        settings: settingsFr,
        errors: errorsFr,
        courses: coursesFr,
        store: storeFr,
        payments: paymentsFr,
        statistics: statisticsFr,
        messages: messagesFr,
        families: familiesFr,
        users: usersFr,
        dashboard: dashboardFr,
        groups: groupsFr,
      },
      en: {
        common: commonEn,
        auth: authEn,
        settings: settingsEn,
        errors: errorsEn,
        courses: coursesEn,
        store: storeEn,
        payments: paymentsEn,
        statistics: statisticsEn,
        messages: messagesEn,
        families: familiesEn,
        users: usersEn,
        dashboard: dashboardEn,
        groups: groupsEn,
      },
    },

    // Langue de fallback si la traduction n'existe pas
    fallbackLng: defaultLanguage,

    // Langues supportées
    supportedLngs: languageCodes,

    // Namespace par défaut
    defaultNS: "common",

    // Tous les namespaces
    ns: namespaces,

    // Options de détection de langue
    detection: languageDetectorOptions,

    // Interpolation
    interpolation: {
      // React échappe déjà les valeurs par défaut
      escapeValue: false,

      // Format pour les valeurs
      formatSeparator: ",",
    },

    // Support de la pluralisation
    pluralSeparator: "_",

    // Options React
    react: {
      // Utiliser Suspense pour le lazy loading
      useSuspense: true,

      // Bind les événements de changement de langue
      bindI18n: "languageChanged loaded",

      // Bind les événements de changement de namespace
      bindI18nStore: "added removed",

      // Transcode les clés manquantes
      transEmptyNodeValue: "",

      // Garde les clés dans le DOM si non traduites (utile pour le debug)
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "em", "span"],
    },

    // En développement, afficher les warnings
    debug: (import.meta as any).env?.DEV ?? false,

    // Mode de chargement des traductions
    // 'lazy' : charge les traductions à la demande (recommandé pour production)
    load: "languageOnly",

    // Clé par défaut si la traduction n'existe pas
    saveMissing: false,

    // Retourner un objet vide si le namespace n'existe pas
    returnEmptyString: false,

    // Retourner null si la clé n'existe pas
    returnNull: false,

    // Options de cache
    cache: {
      enabled: true,
    },
  });

/**
 * Fonction helper pour charger dynamiquement les traductions d'un namespace
 * Cette fonction sera utilisée pour le lazy loading des traductions
 *
 * @param language - Code de la langue (fr, en, etc.)
 * @param namespace - Namespace à charger
 */
export const loadNamespaceTranslations = async (
  language: string,
  namespace: string,
): Promise<void> => {
  try {
    // Import dynamique des traductions
    const translations = await import(
      `./locales/${language}/${namespace}.json`
    );

    // Ajouter les traductions au namespace
    i18n.addResourceBundle(
      language,
      namespace,
      translations.default,
      true,
      true,
    );
  } catch (error) {
    console.warn(`Translations not found for ${language}/${namespace}`, error);
  }
};

/**
 * Fonction helper pour changer la langue
 *
 * @param language - Code de la langue
 */
export const changeLanguage = async (language: string): Promise<void> => {
  if (languageCodes.includes(language as any)) {
    await i18n.changeLanguage(language);

    // Sauvegarder dans localStorage
    localStorage.setItem("user-language", language);
  } else {
    console.warn(`Language ${language} is not supported`);
  }
};

/**
 * Fonction helper pour obtenir la langue courante
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || defaultLanguage;
};

/**
 * Fonction helper pour obtenir les informations de la langue courante
 */
export const getCurrentLanguageInfo = () => {
  const currentLang = getCurrentLanguage();
  return (
    supportedLanguages.find((lang) => lang.code === currentLang) ||
    supportedLanguages[0]
  );
};

// Export de l'instance i18n configurée
export default i18n;
