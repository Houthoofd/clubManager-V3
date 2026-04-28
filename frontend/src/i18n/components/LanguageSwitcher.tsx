/**
 * LanguageSwitcher Component
 * Composant pour changer la langue de l'application
 * Supporte plusieurs variantes d'affichage
 */

import { useLanguage } from '../hooks';
import type { LanguageCode } from '../types';

/**
 * Props du composant LanguageSwitcher
 */
interface LanguageSwitcherProps {
  /** Variante d'affichage */
  variant?: 'dropdown' | 'toggle' | 'buttons';
  /** Afficher le drapeau */
  showFlag?: boolean;
  /** Afficher le label complet */
  showLabel?: boolean;
  /** Classes CSS personnalisées */
  className?: string;
  /** Style inline personnalisé */
  style?: React.CSSProperties;
  /** Callback après changement de langue */
  onLanguageChange?: (language: LanguageCode) => void;
}

/**
 * Composant LanguageSwitcher
 *
 * @example
 * // Dropdown simple
 * <LanguageSwitcher />
 *
 * @example
 * // Toggle avec drapeaux
 * <LanguageSwitcher variant="toggle" showFlag />
 *
 * @example
 * // Boutons avec labels
 * <LanguageSwitcher variant="buttons" showLabel />
 */
export function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showLabel = false,
  className = '',
  style,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  const handleChange = async (lng: LanguageCode) => {
    await changeLanguage(lng);
    onLanguageChange?.(lng);
  };

  // Variante Dropdown
  if (variant === 'dropdown') {
    return (
      <div className={`language-switcher-dropdown ${className}`} style={style}>
        <select
          value={currentLanguage}
          onChange={(e) => handleChange(e.target.value as LanguageCode)}
          className="language-select"
          aria-label="Select language"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {showFlag && `${lang.flag} `}
              {showLabel ? lang.label : lang.code.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Variante Toggle (2 langues uniquement)
  if (variant === 'toggle') {
    return (
      <div className={`language-switcher-toggle ${className}`} style={style}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`language-toggle-btn ${
              currentLanguage === lang.code ? 'active' : ''
            }`}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={currentLanguage === lang.code}
          >
            {showFlag && <span className="flag">{lang.flag}</span>}
            {showLabel && <span className="label">{lang.label}</span>}
            {!showLabel && !showFlag && (
              <span className="code">{lang.code.toUpperCase()}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Variante Buttons
  if (variant === 'buttons') {
    return (
      <div className={`language-switcher-buttons ${className}`} style={style}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`language-btn ${
              currentLanguage === lang.code ? 'active' : ''
            }`}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={currentLanguage === lang.code}
          >
            {showFlag && <span className="flag">{lang.flag}</span>}
            {showLabel && <span className="label">{lang.label}</span>}
            {!showLabel && <span className="code">{lang.code.toUpperCase()}</span>}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Export des styles CSS par défaut (optionnel)
 * À inclure dans votre fichier CSS global ou module CSS
 */
export const languageSwitcherStyles = `
/* Dropdown variant */
.language-switcher-dropdown {
  display: inline-block;
}

.language-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.language-select:hover {
  border-color: #cbd5e0;
}

.language-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

/* Toggle variant */
.language-switcher-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
}

.language-toggle-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background-color: transparent;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.language-toggle-btn:hover {
  background-color: #edf2f7;
}

.language-toggle-btn.active {
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Buttons variant */
.language-switcher-buttons {
  display: inline-flex;
  gap: 0.5rem;
}

.language-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.language-btn:hover {
  border-color: #cbd5e0;
  background-color: #f7fafc;
}

.language-btn.active {
  border-color: #4299e1;
  background-color: #ebf8ff;
  color: #2b6cb0;
}

.language-btn .flag {
  font-size: 1.25rem;
}
`;

/**
 * Export par défaut
 */
export default LanguageSwitcher;
