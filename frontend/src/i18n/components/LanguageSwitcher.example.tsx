/**
 * LanguageSwitcher - Composant exemple pour le changement de langue
 *
 * Ce fichier contient plusieurs variantes de sélecteur de langue.
 * Choisissez celle qui convient le mieux à votre interface.
 *
 * Usage:
 * import { LanguageSwitcherDropdown } from '@/i18n/components/LanguageSwitcher.example';
 *
 * <LanguageSwitcherDropdown />
 */

import React, { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { toast } from "sonner"; // Utilise sonner pour les notifications

/**
 * VARIANTE 1: Dropdown classique
 * Simple select HTML stylisé
 */
export const LanguageSwitcherDropdown: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newLang: string) => {
    if (newLang === language) return;

    setIsChanging(true);
    try {
      await changeLanguage(newLang);
      toast.success(
        `Langue changée vers ${newLang === "fr" ? "Français" : "English"}`,
      );
    } catch (error) {
      toast.error("Erreur lors du changement de langue");
      console.error("Language change error:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isChanging}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

/**
 * VARIANTE 2: Boutons avec drapeaux
 * Affichage horizontal des langues disponibles
 */
export const LanguageSwitcherButtons: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newLang: string) => {
    if (newLang === language) return;

    setIsChanging(true);
    try {
      await changeLanguage(newLang);
      toast.success(
        `Langue changée vers ${newLang === "fr" ? "Français" : "English"}`,
      );
    } catch (error) {
      toast.error("Erreur lors du changement de langue");
      console.error("Language change error:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      {availableLanguages.map((lang, index) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          disabled={isChanging}
          className={`
            px-4 py-2 text-sm font-medium transition-colors
            ${index > 0 ? "border-l border-gray-300 dark:border-gray-600" : ""}
            ${
              language === lang.code
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="mr-2">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * VARIANTE 3: Menu déroulant personnalisé
 * Dropdown avec animation et design moderne
 */
export const LanguageSwitcherMenu: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLang = availableLanguages.find(
    (lang) => lang.code === language,
  ) ||
    availableLanguages[0] || { code: "fr", label: "Français", flag: "🇫🇷" };

  const handleChange = async (newLang: string) => {
    if (newLang === language) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      await changeLanguage(newLang);
      toast.success(
        `Langue changée vers ${newLang === "fr" ? "Français" : "English"}`,
      );
      setIsOpen(false);
    } catch (error) {
      toast.error("Erreur lors du changement de langue");
      console.error("Language change error:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Bouton déclencheur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="inline-flex items-center justify-center w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="mr-2">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Liste des langues */}
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  disabled={isChanging}
                  className={`
                    w-full text-left px-4 py-2 text-sm flex items-center transition-colors
                    ${
                      language === lang.code
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="mr-3">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {language === lang.code && (
                    <svg
                      className="ml-auto h-5 w-5 text-blue-600 dark:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * VARIANTE 4: Mini bouton avec icône
 * Compact, idéal pour une navbar
 */
export const LanguageSwitcherCompact: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const currentLang = availableLanguages.find(
    (lang) => lang.code === language,
  ) ||
    availableLanguages[0] || { code: "fr", label: "Français", flag: "🇫🇷" };
  const otherLang = availableLanguages.find((lang) => lang.code !== language) ||
    availableLanguages[1] ||
    availableLanguages[0] || { code: "en", label: "English", flag: "🇬🇧" };

  const handleToggle = async () => {
    setIsChanging(true);
    try {
      await changeLanguage(otherLang.code);
      toast.success(`Langue changée vers ${otherLang.label}`);
    } catch (error) {
      toast.error("Erreur lors du changement de langue");
      console.error("Language change error:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isChanging}
      title={`Changer vers ${otherLang.label}`}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className="text-xl">{currentLang.flag}</span>
    </button>
  );
};

/**
 * VARIANTE 5: Avec label
 * Version complète avec texte explicatif
 */
export const LanguageSwitcherWithLabel: React.FC = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newLang: string) => {
    if (newLang === language) return;

    setIsChanging(true);
    try {
      await changeLanguage(newLang);
      toast.success(
        `Langue changée vers ${newLang === "fr" ? "Français" : "English"}`,
      );
    } catch (error) {
      toast.error("Erreur lors du changement de langue");
      console.error("Language change error:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Langue / Language
      </label>
      <div className="relative">
        <select
          value={language}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isChanging}
          className="block w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 dark:text-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {isChanging && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Changement de langue en cours...
        </p>
      )}
    </div>
  );
};

/**
 * Export par défaut: Menu déroulant
 */
export default LanguageSwitcherMenu;
