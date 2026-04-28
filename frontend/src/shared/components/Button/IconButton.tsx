/**
 * IconButton Component
 *
 * Composant de bouton réutilisable spécialisé pour les boutons contenant uniquement une icône.
 * Optimisé pour les actions rapides (edit, delete, view, etc.) avec padding équilibré.
 *
 * @example
 * // Exemple 1 : Bouton edit
 * <IconButton
 *   icon={<PencilIcon className="h-5 w-5" />}
 *   ariaLabel="Modifier"
 *   variant="ghost"
 *   onClick={handleEdit}
 * />
 *
 * @example
 * // Exemple 2 : Bouton delete (cercle)
 * <IconButton
 *   icon={<TrashIcon className="h-5 w-5" />}
 *   ariaLabel="Supprimer"
 *   variant="danger"
 *   shape="circle"
 *   onClick={handleDelete}
 * />
 *
 * @example
 * // Exemple 3 : Avec tooltip
 * <IconButton
 *   icon={<InfoIcon className="h-4 w-4" />}
 *   ariaLabel="Plus d'informations"
 *   tooltip="Cliquez pour plus de détails"
 *   variant="outline"
 *   size="sm"
 * />
 *
 * @example
 * // Exemple 4 : Loading state
 * <IconButton
 *   icon={<SaveIcon className="h-5 w-5" />}
 *   ariaLabel="Enregistrer"
 *   variant="primary"
 *   loading={isSaving}
 * />
 *
 * @example
 * // Exemple 5 : Groupe d'actions
 * <div className="flex gap-2">
 *   <IconButton icon={<EyeIcon />} ariaLabel="Voir" variant="ghost" />
 *   <IconButton icon={<PencilIcon />} ariaLabel="Modifier" variant="ghost" />
 *   <IconButton icon={<TrashIcon />} ariaLabel="Supprimer" variant="danger" />
 * </div>
 */

import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";
import { cn, BUTTON } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
> {
  /**
   * Icône à afficher (ReactNode)
   */
  icon: ReactNode;

  /**
   * Label accessible (pour screen readers) - OBLIGATOIRE
   * Utilisé pour l'attribut aria-label
   */
  ariaLabel: string;

  /**
   * Variant de style
   * - primary: Bouton principal (bleu)
   * - secondary: Bouton secondaire (gris)
   * - outline: Bouton avec bordure
   * - danger: Action destructive (rouge)
   * - success: Action positive (vert)
   * - ghost: Bouton sans fond
   * @default "ghost"
   */
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "ghost"
    | "outline";

  /**
   * Taille du bouton
   * - xs: p-1 (icône h-3 w-3)
   * - sm: p-1.5 (icône h-4 w-4)
   * - md: p-2 (icône h-5 w-5) - défaut
   * - lg: p-2.5 (icône h-6 w-6)
   * - xl: p-3 (icône h-7 w-7)
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * Forme du bouton
   * - square: Coins arrondis (rounded-lg)
   * - circle: Circulaire (rounded-full)
   * @default "square"
   */
  shape?: "square" | "circle";

  /**
   * Afficher un spinner de chargement
   * Remplace l'icône et désactive automatiquement le bouton
   * @default false
   */
  loading?: boolean;

  /**
   * Désactivé
   * @default false
   */
  disabled?: boolean;

  /**
   * Tooltip optionnel (utilise l'attribut HTML title natif)
   */
  tooltip?: string;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── LOADING SPINNER ─────────────────────────────────────────────────────────

interface SpinnerProps {
  className?: string;
}

function LoadingSpinner({ className = "" }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin", className)}
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

// ─── VARIANT CLASSES ─────────────────────────────────────────────────────────

// Les classes de taille d'icône sont conservées pour le spinner de chargement

const iconSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
} as const;

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      ariaLabel,
      variant = "ghost",
      size = "md",
      shape = "square",
      loading = false,
      disabled,
      tooltip,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    // Déterminer si le bouton doit être désactivé
    const isDisabled = disabled || loading;

    // Adapter BUTTON.base pour gérer le shape (circle vs square)
    const baseClasses =
      shape === "circle"
        ? BUTTON.base.replace("rounded-lg", "rounded-full")
        : BUTTON.base;

    // Classes combinées avec tokens BUTTON
    const buttonClasses = cn(
      baseClasses,
      BUTTON.variant[variant],
      BUTTON.icon[size],
      className,
    );

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        title={tooltip}
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        {loading ? (
          <LoadingSpinner className={iconSizeClasses[size]} />
        ) : (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

// ─── ICÔNES SVG INLINE ───────────────────────────────────────────────────────

interface IconProps {
  className?: string;
}

/**
 * Icône Crayon (Edit)
 */
export function PencilIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

/**
 * Icône Poubelle (Delete)
 */
export function TrashIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

/**
 * Icône Œil (View)
 */
export function EyeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/**
 * Icône Info (Information)
 */
export function InfoIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
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

/**
 * Icône Plus (Add)
 */
export function PlusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default IconButton;
