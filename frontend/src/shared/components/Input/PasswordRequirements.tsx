/**
 * PasswordRequirements Component
 *
 * Affiche les exigences de validation du mot de passe avec des indicateurs visuels.
 * Utile pour les formulaires d'inscription et de changement de mot de passe.
 *
 * @example
 * ```tsx
 * <PasswordRequirements password={passwordValue} />
 * ```
 */

import { cn } from '../../styles/designTokens';

// ─── ICONS ───────────────────────────────────────────────────────────────────

interface IconProps {
  className?: string;
}

function CheckCircleIcon({ className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XCircleIcon({ className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface PasswordRequirementsProps {
  /**
   * Valeur actuelle du mot de passe à valider
   */
  password: string;

  /**
   * Classes CSS additionnelles pour le conteneur
   */
  className?: string;
}

interface Requirement {
  id: string;
  label: string;
  validate: (password: string) => boolean;
}

// ─── CONFIGURATION ───────────────────────────────────────────────────────────

const REQUIREMENTS: Requirement[] = [
  {
    id: 'length',
    label: 'Au moins 8 caractères',
    validate: (pwd) => pwd.length >= 8,
  },
  {
    id: 'case',
    label: 'Majuscules et minuscules',
    validate: (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'Au moins un chiffre',
    validate: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: 'special',
    label: 'Caractère spécial (!@#$%^&*()_+-=[]{}; etc.)',
    validate: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  },
];

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function PasswordRequirements({
  password,
  className = '',
}: PasswordRequirementsProps) {
  // Ne rien afficher si le mot de passe est vide
  if (!password || password.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-1', className)} role="list" aria-label="Exigences du mot de passe">
      {REQUIREMENTS.map((requirement) => {
        const isValid = requirement.validate(password);

        return (
          <div
            key={requirement.id}
            className="flex items-center gap-2 text-xs"
            role="listitem"
          >
            {isValid ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            <span
              className={cn(
                'transition-colors',
                isValid ? 'text-green-600 font-medium' : 'text-gray-500'
              )}
            >
              {requirement.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default PasswordRequirements;
