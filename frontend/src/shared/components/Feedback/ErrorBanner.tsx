/**
 * ErrorBanner Component
 *
 * Composant réutilisable pour afficher des messages d'erreur, d'alerte,
 * d'information ou de succès. Conçu pour donner un feedback visuel clair
 * aux utilisateurs.
 *
 * @example
 * ```tsx
 * <ErrorBanner
 *   variant="error"
 *   message="Une erreur s'est produite lors de la sauvegarde."
 * />
 *
 * <ErrorBanner
 *   variant="success"
 *   title="Opération réussie"
 *   message="Vos modifications ont été enregistrées."
 *   dismissible
 *   onDismiss={() => console.log('Dismissed')}
 * />
 * ```
 */

import { ReactNode } from 'react';
import { cn } from '../../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ErrorBannerProps {
  /**
   * Type de message
   * - error: Erreur (rouge)
   * - warning: Avertissement (jaune)
   * - info: Information (bleu)
   * - success: Succès (vert)
   * @default "error"
   */
  variant?: 'error' | 'warning' | 'info' | 'success';

  /**
   * Titre du message (optionnel)
   */
  title?: string;

  /**
   * Message principal à afficher
   */
  message: string;

  /**
   * Icône personnalisée (optionnel)
   * Si non fourni, une icône par défaut est affichée selon le variant
   */
  icon?: ReactNode;

  /**
   * Afficher un bouton de fermeture
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback appelé lors de la fermeture
   */
  onDismiss?: () => void;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── ICÔNES PAR DÉFAUT ───────────────────────────────────────────────────────

function ExclamationCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ExclamationTriangleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function InformationCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ─── CONFIGURATION PAR VARIANT ───────────────────────────────────────────────

const VARIANT_STYLES = {
  error: {
    container: 'border-l-red-500 bg-red-50',
    icon: 'text-red-400',
    title: 'text-red-800 font-medium',
    message: 'text-red-700',
    defaultIcon: <ExclamationCircleIcon />,
  },
  warning: {
    container: 'border-l-yellow-500 bg-yellow-50',
    icon: 'text-yellow-400',
    title: 'text-yellow-800 font-medium',
    message: 'text-yellow-700',
    defaultIcon: <ExclamationTriangleIcon />,
  },
  info: {
    container: 'border-l-blue-500 bg-blue-50',
    icon: 'text-blue-400',
    title: 'text-blue-800 font-medium',
    message: 'text-blue-700',
    defaultIcon: <InformationCircleIcon />,
  },
  success: {
    container: 'border-l-green-500 bg-green-50',
    icon: 'text-green-400',
    title: 'text-green-800 font-medium',
    message: 'text-green-700',
    defaultIcon: <CheckCircleIcon />,
  },
} as const;

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function ErrorBanner({
  variant = 'error',
  title,
  message,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}: ErrorBannerProps) {
  const styles = VARIANT_STYLES[variant];

  // Accessibilité : role="alert" pour les erreurs, aria-live pour les autres
  const ariaProps =
    variant === 'error'
      ? { role: 'alert' }
      : { 'aria-live': 'polite' as const };

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4',
        styles.container,
        className
      )}
      {...ariaProps}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <div className={cn('flex-shrink-0', styles.icon)}>
          {icon || styles.defaultIcon}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('text-sm mb-1', styles.title)}>
              {title}
            </h3>
          )}
          <p className={cn('text-sm', title ? styles.message : styles.title)}>
            {message}
          </p>
        </div>

        {/* Bouton de fermeture */}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded transition-colors"
            aria-label="Fermer le message"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBanner;
