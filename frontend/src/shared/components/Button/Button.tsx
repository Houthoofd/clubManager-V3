/**
 * Button Component
 *
 * Composant de bouton réutilisable avec variants, tailles et états configurables.
 * Utilise les Design Tokens pour garantir la cohérence visuelle.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Cliquez ici
 * </Button>
 *
 * <Button variant="danger" size="lg" loading>
 *   Suppression en cours...
 * </Button>
 *
 * <Button variant="outline" icon={<PlusIcon />}>
 *   Ajouter
 * </Button>
 * ```
 */

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn, BUTTON } from '../../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /**
   * Contenu du bouton
   */
  children: ReactNode;

  /**
   * Variant de style
   * - primary: Bouton principal (bleu)
   * - secondary: Bouton secondaire (gris)
   * - outline: Bouton avec bordure
   * - danger: Action destructive (rouge)
   * - success: Action positive (vert)
   * - ghost: Bouton sans fond
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';

  /**
   * Taille du bouton
   * - xs: Extra small (px-2.5 py-1.5 text-xs)
   * - sm: Small (px-3 py-1.5 text-xs)
   * - md: Medium (px-4 py-2 text-sm) - défaut
   * - lg: Large (px-5 py-2.5 text-base)
   * - xl: Extra large (px-6 py-3 text-base)
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Afficher un spinner de chargement
   * Désactive automatiquement le bouton pendant le chargement
   * @default false
   */
  loading?: boolean;

  /**
   * Icône à afficher (gauche par défaut)
   */
  icon?: ReactNode;

  /**
   * Position de l'icône
   * @default "left"
   */
  iconPosition?: 'left' | 'right';

  /**
   * Bouton pleine largeur
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Bouton icône uniquement (sans texte)
   * Ajuste le padding pour un carré parfait
   * @default false
   */
  iconOnly?: boolean;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── LOADING SPINNER ─────────────────────────────────────────────────────────

interface SpinnerProps {
  className?: string;
}

function LoadingSpinner({ className = '' }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      iconOnly = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Déterminer si le bouton doit être désactivé
    const isDisabled = disabled || loading;

    // Classes de base et variant
    const baseClasses = cn(
      BUTTON.base,
      BUTTON.variant[variant],
      iconOnly ? BUTTON.icon[size] : BUTTON.size[size],
      fullWidth && 'w-full',
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={baseClasses}
        {...props}
      >
        {/* Spinner de chargement (gauche) */}
        {loading && !iconOnly && (
          <LoadingSpinner className="h-4 w-4 mr-2" />
        )}

        {/* Spinner pour bouton icon-only */}
        {loading && iconOnly && (
          <LoadingSpinner className="h-4 w-4" />
        )}

        {/* Icône (gauche) - pas affichée si loading */}
        {!loading && icon && iconPosition === 'left' && !iconOnly && (
          <span className="mr-2 flex-shrink-0">{icon}</span>
        )}

        {/* Icône uniquement - pas affichée si loading */}
        {!loading && icon && iconOnly && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        {/* Contenu textuel - pas affiché si iconOnly */}
        {!iconOnly && <span>{children}</span>}

        {/* Icône (droite) - pas affichée si loading ou iconOnly */}
        {!loading && icon && iconPosition === 'right' && !iconOnly && (
          <span className="ml-2 flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ─── SOUS-COMPOSANTS / VARIANTES ─────────────────────────────────────────────

/**
 * Bouton groupe - Pour grouper plusieurs boutons ensemble
 */
export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={cn('inline-flex rounded-lg shadow-sm', className)} role="group">
      {children}
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

Button.Group = ButtonGroup;

export default Button;
