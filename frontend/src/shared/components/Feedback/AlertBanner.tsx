/**
 * AlertBanner Component
 *
 * Composant de bannière d'alerte réutilisable pour afficher des messages avec
 * variants de couleur, icônes et bouton de fermeture optionnel.
 * Utilise les Design Tokens pour garantir la cohérence visuelle.
 *
 * @example
 * ```tsx
 * // Simple
 * <AlertBanner variant="success" message="Opération réussie !" />
 *
 * // Avec titre
 * <AlertBanner
 *   variant="danger"
 *   title="Erreur"
 *   message="Une erreur est survenue."
 * />
 *
 * // Dismissible
 * <AlertBanner
 *   variant="info"
 *   message="Nouvelle mise à jour disponible"
 *   dismissible
 *   onDismiss={() => console.log('Fermé')}
 * />
 *
 * // Icône custom
 * <AlertBanner
 *   variant="warning"
 *   message="Attention"
 *   icon={<CustomIcon />}
 * />
 * ```
 */

import { ReactNode } from 'react';
import { cn, ALERT } from '../../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AlertBannerProps {
  /**
   * Type d'alerte (définit la couleur et l'icône par défaut)
   * - success: Vert avec icône de validation
   * - warning: Orange avec icône d'avertissement
   * - danger: Rouge avec icône d'erreur
   * - info: Bleu avec icône d'information
   */
  variant: 'success' | 'warning' | 'danger' | 'info';

  /**
   * Titre de l'alerte (optionnel, affiché en gras)
   */
  title?: string;

  /**
   * Message principal de l'alerte
   */
  message: string;

  /**
   * Icône personnalisée (sinon icône par défaut selon variant)
   */
  icon?: ReactNode;

  /**
   * Afficher le bouton de fermeture
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback lors du clic sur le bouton de fermeture
   */
  onDismiss?: () => void;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── ICÔNES SVG (HEROICONS STYLE) ────────────────────────────────────────────

interface IconProps {
  className?: string;
}

/**
 * Icône de succès (cercle avec checkmark)
 */
function CheckCircleIcon({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Icône d'avertissement (triangle avec point d'exclamation)
 */
function ExclamationTriangleIcon({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Icône d'erreur (cercle avec X)
 */
function XCircleIcon({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Icône d'information (cercle avec i)
 */
function InformationCircleIcon({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Icône de fermeture (X)
 */
function XMarkIcon({ className = '' }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      />
    </svg>
  );
}

// ─── MAPPING ICÔNES PAR VARIANT ──────────────────────────────────────────────

const VARIANT_ICONS = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  danger: XCircleIcon,
  info: InformationCircleIcon,
} as const;

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function AlertBanner({
  variant,
  title,
  message,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertBannerProps) {
  // Icône par défaut selon le variant
  const DefaultIcon = VARIANT_ICONS[variant];

  return (
    <div
      className={cn(ALERT.base, ALERT.variant[variant], className)}
      role="alert"
    >
      <div className="flex">
        {/* Icône */}
        <div className="flex-shrink-0">
          {icon || <DefaultIcon className={ALERT.icon} />}
        </div>

        {/* Contenu */}
        <div className="ml-3 flex-1">
          {title && <h3 className={ALERT.title}>{title}</h3>}
          <p className={ALERT.message}>{message}</p>
        </div>

        {/* Bouton de fermeture */}
        {dismissible && (
          <div className="ml-auto flex-shrink-0 pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black/5 transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default AlertBanner;
