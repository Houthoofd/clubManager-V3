/**
 * PasswordInput Component
 *
 * Champ de saisie pour mot de passe avec toggle visibilité et indicateur de force optionnel.
 * Permet à l'utilisateur de basculer entre l'affichage masqué et visible du mot de passe.
 *
 * @example
 * ```tsx
 * // Exemple 1 : Simple
 * <PasswordInput
 *   id="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 *
 * // Exemple 2 : Avec indicateur de force
 * <PasswordInput
 *   id="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   showStrengthIndicator
 * />
 *
 * // Exemple 3 : Avec erreur
 * <PasswordInput
 *   id="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   hasError
 *   placeholder="Entrez votre mot de passe"
 * />
 * ```
 */

import { useState, ChangeEvent, InputHTMLAttributes } from 'react';
import { cn, INPUT } from '../../styles/designTokens';

// ─── ICONS (SVG inline) ──────────────────────────────────────────────────────

interface IconProps {
  className?: string;
}

function EyeIcon({ className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeSlashIcon({ className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * ID du champ (requis pour l'accessibilité)
   */
  id: string;

  /**
   * Valeur contrôlée du champ
   */
  value: string;

  /**
   * Handler onChange
   */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;

  /**
   * Afficher l'indicateur de force du mot de passe
   * @default false
   */
  showStrengthIndicator?: boolean;

  /**
   * État d'erreur (bordure rouge)
   * @default false
   */
  hasError?: boolean;

  /**
   * Placeholder
   */
  placeholder?: string;

  /**
   * Autocomplétion (recommandé: "current-password" ou "new-password")
   * @default "current-password"
   */
  autoComplete?: string;

  /**
   * Classes CSS additionnelles pour le champ
   */
  className?: string;

  /**
   * Classes CSS additionnelles pour le conteneur
   */
  containerClassName?: string;
}

interface PasswordStrength {
  score: number; // 0-100
  label: string; // 'Faible' | 'Moyen' | 'Fort' | 'Très fort'
  color: string; // Couleur Tailwind
  bgColor: string; // Couleur de fond
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Calcule la force d'un mot de passe selon des critères définis
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'text-gray-400',
      bgColor: 'bg-gray-300',
    };
  }

  let score = 0;

  // Longueur >= 8 caractères
  if (password.length >= 8) score += 25;

  // Longueur >= 12 caractères
  if (password.length >= 12) score += 25;

  // Contient minuscules ET majuscules
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;

  // Contient des chiffres
  if (/\d/.test(password)) score += 12.5;

  // Contient des caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) score += 12.5;

  // Déterminer le label et la couleur selon le score
  if (score < 25) {
    return {
      score,
      label: 'Faible',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
    };
  } else if (score < 50) {
    return {
      score,
      label: 'Moyen',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
    };
  } else if (score < 75) {
    return {
      score,
      label: 'Fort',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
    };
  } else {
    return {
      score,
      label: 'Très fort',
      color: 'text-green-600',
      bgColor: 'bg-green-500',
    };
  }
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function PasswordInput({
  id,
  value,
  onChange,
  showStrengthIndicator = false,
  hasError = false,
  placeholder = 'Entrez votre mot de passe',
  autoComplete = 'current-password',
  className = '',
  containerClassName = '',
  disabled,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Calculer la force du mot de passe si l'indicateur est activé
  const strength = showStrengthIndicator ? calculatePasswordStrength(value) : null;

  // Classes du champ input
  const inputClasses = cn(
    INPUT.base,
    INPUT.withIconRight, // Padding right pour le bouton toggle
    hasError && INPUT.error,
    disabled && INPUT.disabled,
    className
  );

  // Classes du conteneur
  const containerClasses = cn('relative', containerClassName);

  return (
    <div className={containerClasses}>
      {/* Champ input */}
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={hasError}
        aria-describedby={
          showStrengthIndicator && value.length > 0
            ? `${id}-strength`
            : undefined
        }
        {...props}
      />

      {/* Bouton toggle visibilité */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>

      {/* Indicateur de force du mot de passe */}
      {showStrengthIndicator && value.length > 0 && strength && (
        <div
          id={`${id}-strength`}
          className="mt-2 space-y-1"
          role="status"
          aria-live="polite"
        >
          {/* Barre de progression */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', strength.bgColor)}
              style={{ width: `${strength.score}%` }}
              role="progressbar"
              aria-valuenow={strength.score}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Label de force */}
          <div className="flex items-center justify-between">
            <span className={cn('text-xs font-medium', strength.color)}>
              {strength.label}
            </span>
            <span className="text-xs text-gray-500">
              {strength.score.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
