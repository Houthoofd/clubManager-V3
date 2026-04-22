/**
 * Hooks personnalisés pour le système i18n
 * Facilitent l'utilisation des traductions dans les composants React
 */

import { useTranslation as useI18nextTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import type {
  Namespace,
  LanguageCode,
  LanguageInfo,
  TranslationOptions,
  LocalizationPreferences,
} from "./types";
import { supportedLanguages, defaultLanguage } from "./index";

/**
 * Hook personnalisé pour la gestion de la langue
 * Fournit des fonctions pour changer de langue et obtenir la langue courante
 *
 * @example
 * const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
 *
 * // Changer la langue
 * changeLanguage('en');
 *
 * // Obtenir la langue courante
 * console.log(currentLanguage); // 'fr'
 */
export function useLanguage() {
  const { i18n } = useI18nextTranslation();

  const currentLanguage = useMemo<LanguageCode>(() => {
    return (i18n.language || defaultLanguage) as LanguageCode;
  }, [i18n.language]);

  const changeLanguage = useCallback(
    async (lng: LanguageCode) => {
      try {
        await i18n.changeLanguage(lng);
        localStorage.setItem("user-language", lng);
      } catch (error) {
        console.error("Failed to change language:", error);
      }
    },
    [i18n],
  );

  const availableLanguages = useMemo<readonly LanguageInfo[]>(() => {
    return supportedLanguages;
  }, []);

  const isRTL = useMemo(() => {
    // Pour l'instant, aucune langue RTL, mais préparé pour l'avenir (arabe, hébreu, etc.)
    return false;
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isRTL,
  };
}

/**
 * Hook pour obtenir les informations de la langue courante
 *
 * @example
 * const languageInfo = useLanguageInfo();
 * console.log(languageInfo.label); // 'Français'
 * console.log(languageInfo.flag); // '🇫🇷'
 */
export function useLanguageInfo(): LanguageInfo {
  const { currentLanguage } = useLanguage();

  return useMemo(() => {
    const info = supportedLanguages.find(
      (lang) => lang.code === currentLanguage,
    );
    return info || supportedLanguages[0];
  }, [currentLanguage]);
}

/**
 * Hook pour une traduction type-safe avec un namespace spécifique
 *
 * @param namespace - Le namespace à utiliser
 * @returns Fonction de traduction et instance i18n
 *
 * @example
 * const { t } = useTypedTranslation('auth');
 * const title = t('login.title'); // Autocomplétion disponible
 */
export function useTypedTranslation<N extends Namespace = "common">(
  namespace?: N,
) {
  const { t, i18n, ready } = useI18nextTranslation(namespace);

  const translate = useCallback(
    (key: string, options?: TranslationOptions): string => {
      return t(key, options);
    },
    [t],
  );

  return {
    t: translate,
    i18n,
    ready,
  };
}

/**
 * Hook pour vérifier si les traductions sont prêtes
 *
 * @param namespaces - Les namespaces à vérifier
 * @returns true si toutes les traductions sont chargées
 *
 * @example
 * const isReady = useTranslationReady(['common', 'auth']);
 * if (!isReady) return <Loader />;
 */
export function useTranslationReady(namespaces?: Namespace[]): boolean {
  const { ready } = useI18nextTranslation(namespaces);
  return ready;
}

/**
 * Hook pour formater les dates selon la langue courante
 *
 * @returns Fonction de formatage de date
 *
 * @example
 * const formatDate = useFormatDate();
 * const formatted = formatDate(new Date(), 'long'); // '1 janvier 2024'
 */
export function useFormatDate() {
  const { currentLanguage } = useLanguage();

  return useCallback(
    (
      date: Date | string,
      format: "short" | "medium" | "long" | "full" = "medium",
    ): string => {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
        medium: {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
        long: {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
        full: {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      };

      return new Intl.DateTimeFormat(
        currentLanguage,
        formatOptions[format],
      ).format(dateObj);
    },
    [currentLanguage],
  );
}

/**
 * Hook pour formater les heures selon la langue courante
 *
 * @returns Fonction de formatage d'heure
 *
 * @example
 * const formatTime = useFormatTime();
 * const formatted = formatTime(new Date()); // '14:30'
 */
export function useFormatTime() {
  const { currentLanguage } = useLanguage();

  return useCallback(
    (date: Date | string, format: "12h" | "24h" = "24h"): string => {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: format === "12h",
      };

      return new Intl.DateTimeFormat(currentLanguage, options).format(dateObj);
    },
    [currentLanguage],
  );
}

/**
 * Hook pour formater les nombres selon la langue courante
 *
 * @returns Fonction de formatage de nombre
 *
 * @example
 * const formatNumber = useFormatNumber();
 * const formatted = formatNumber(1234.56); // '1 234,56' (fr) ou '1,234.56' (en)
 */
export function useFormatNumber() {
  const { currentLanguage } = useLanguage();

  return useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(currentLanguage, options).format(value);
    },
    [currentLanguage],
  );
}

/**
 * Hook pour formater les devises selon la langue courante
 *
 * @param currency - Code de la devise (EUR, USD, etc.)
 * @returns Fonction de formatage de devise
 *
 * @example
 * const formatCurrency = useFormatCurrency('EUR');
 * const formatted = formatCurrency(99.99); // '99,99 €' (fr) ou '€99.99' (en)
 */
export function useFormatCurrency(currency: string = "EUR") {
  const { currentLanguage } = useLanguage();

  return useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(currentLanguage, {
        style: "currency",
        currency,
      }).format(value);
    },
    [currentLanguage, currency],
  );
}

/**
 * Hook pour obtenir les préférences de localisation
 *
 * @returns Les préférences de localisation courantes
 *
 * @example
 * const preferences = useLocalizationPreferences();
 * console.log(preferences.language); // 'fr'
 * console.log(preferences.dateFormat); // 'medium'
 */
export function useLocalizationPreferences(): LocalizationPreferences {
  const { currentLanguage } = useLanguage();

  return useMemo<LocalizationPreferences>(() => {
    // Valeurs par défaut, peuvent être récupérées depuis les settings
    return {
      language: currentLanguage,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: "medium",
      timeFormat: "24h",
      firstDayOfWeek: currentLanguage === "fr" ? 1 : 0, // Lundi pour FR, Dimanche pour EN
      numberFormat: {
        decimalSeparator: currentLanguage === "fr" ? "," : ".",
        thousandSeparator: currentLanguage === "fr" ? " " : ",",
      },
    };
  }, [currentLanguage]);
}

/**
 * Hook pour traduire avec des valeurs plurielles
 *
 * @param namespace - Le namespace à utiliser
 * @returns Fonction de traduction avec support de pluralisation
 *
 * @example
 * const { tPlural } = usePluralTranslation('common');
 * const text = tPlural('items', 5); // '5 éléments'
 */
export function usePluralTranslation<N extends Namespace = "common">(
  namespace?: N,
) {
  const { t } = useI18nextTranslation(namespace);

  const tPlural = useCallback(
    (key: string, count: number, options?: TranslationOptions): string => {
      return t(key, { count, ...options });
    },
    [t],
  );

  return { tPlural };
}

/**
 * Hook pour traduire avec un contexte spécifique
 *
 * @param namespace - Le namespace à utiliser
 * @returns Fonction de traduction avec support de contexte
 *
 * @example
 * const { tContext } = useContextTranslation('common');
 * const text = tContext('friend', 'male'); // 'Un ami'
 */
export function useContextTranslation<N extends Namespace = "common">(
  namespace?: N,
) {
  const { t } = useI18nextTranslation(namespace);

  const tContext = useCallback(
    (key: string, context: string, options?: TranslationOptions): string => {
      return t(key, { context, ...options });
    },
    [t],
  );

  return { tContext };
}

/**
 * Hook pour obtenir une traduction formatée avec interpolation
 *
 * @param namespace - Le namespace à utiliser
 * @returns Fonction de traduction avec interpolation simplifiée
 *
 * @example
 * const { tFormat } = useFormatTranslation('errors');
 * const text = tFormat('validation.minValue', { min: 10 }); // 'La valeur doit être supérieure ou égale à 10'
 */
export function useFormatTranslation<N extends Namespace = "common">(
  namespace?: N,
) {
  const { t } = useI18nextTranslation(namespace);

  const tFormat = useCallback(
    (key: string, params: Record<string, string | number>): string => {
      return t(key, params);
    },
    [t],
  );

  return { tFormat };
}

/**
 * Hook pour vérifier si une clé de traduction existe
 *
 * @param namespace - Le namespace à vérifier
 * @returns Fonction de vérification d'existence
 *
 * @example
 * const { exists } = useTranslationExists('common');
 * const hasKey = exists('buttons.save'); // true
 */
export function useTranslationExists(namespace?: Namespace) {
  const { i18n } = useI18nextTranslation(namespace);

  const exists = useCallback(
    (key: string): boolean => {
      return i18n.exists(key, { ns: namespace });
    },
    [i18n, namespace],
  );

  return { exists };
}

/**
 * Hook combiné pour toutes les fonctionnalités de traduction
 * Utiliser ce hook pour avoir accès à toutes les fonctionnalités en une fois
 *
 * @param namespace - Le namespace principal à utiliser
 * @returns Objet avec toutes les fonctions de traduction
 *
 * @example
 * const {
 *   t,
 *   currentLanguage,
 *   changeLanguage,
 *   formatDate,
 *   formatNumber,
 *   formatCurrency
 * } = useI18n('common');
 */
export function useI18n<N extends Namespace = "common">(namespace?: N) {
  const { t, i18n, ready } = useTypedTranslation(namespace);
  const { currentLanguage, changeLanguage, availableLanguages, isRTL } =
    useLanguage();
  const formatDate = useFormatDate();
  const formatTime = useFormatTime();
  const formatNumber = useFormatNumber();
  const formatCurrency = useFormatCurrency();
  const preferences = useLocalizationPreferences();

  return {
    // Traduction de base
    t,
    i18n,
    ready,

    // Gestion de la langue
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isRTL,

    // Formatage
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,

    // Préférences
    preferences,
  };
}

/**
 * Export par défaut : hook principal recommandé
 */
export default useI18n;
