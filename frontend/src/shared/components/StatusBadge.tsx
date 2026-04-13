/**
 * StatusBadge Component
 *
 * Composant spécialisé pour afficher des badges de statut colorés.
 * Extension du Badge générique avec des statuts prédéfinis.
 *
 * **Différence avec Badge :**
 * - Badge : composant générique avec variants personnalisables et children
 * - StatusBadge : composant spécialisé avec statuts prédéfinis et labels automatiques
 *
 * @example
 * ```tsx
 * // Statut simple
 * <StatusBadge status="active" />
 *
 * // Avec point coloré
 * <StatusBadge status="success" showDot />
 *
 * // Label personnalisé
 * <StatusBadge status="pending" label="En cours de validation" showDot />
 *
 * // Taille personnalisée
 * <StatusBadge status="error" size="lg" />
 * ```
 */

import { cn } from "../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  /**
   * Statut à afficher
   * - active: Actif (vert)
   * - inactive: Inactif (gris)
   * - pending: En attente (jaune)
   * - success: Payé / Validé (vert)
   * - error: Erreur / Rejeté (rouge)
   * - warning: Attention (orange)
   * - archived: Archivé (gris)
   */
  status:
    | "active"
    | "inactive"
    | "pending"
    | "success"
    | "error"
    | "warning"
    | "archived";

  /**
   * Label custom (override le label par défaut)
   */
  label?: string;

  /**
   * Afficher un point coloré
   * @default false
   */
  showDot?: boolean;

  /**
   * Taille du badge
   * - sm: Small (px-2 py-0.5 text-xs)
   * - md: Medium (px-2.5 py-0.5 text-xs) - défaut
   * - lg: Large (px-3 py-1 text-sm)
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── CONFIGURATION DES STATUTS ──────────────────────────────────────────────

const STATUS_CONFIG = {
  active: {
    label: "Actif",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  inactive: {
    label: "Inactif",
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  },
  pending: {
    label: "En attente",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  success: {
    label: "Payé / Validé",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  error: {
    label: "Erreur / Rejeté",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  warning: {
    label: "Attention",
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  archived: {
    label: "Archivé",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
} as const;

// ─── CLASSES DE TAILLE ──────────────────────────────────────────────────────

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
} as const;

const DOT_SIZE_CLASSES = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
} as const;

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  label,
  showDot = false,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = SIZE_CLASSES[size];
  const dotSizeClasses = DOT_SIZE_CLASSES[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses,
        config.bg,
        config.text,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn("rounded-full", dotSizeClasses, config.dot)}
          aria-hidden="true"
        />
      )}
      {label || config.label}
    </span>
  );
}

export default StatusBadge;
