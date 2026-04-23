/**
 * LoadingSpinner Component
 *
 * Composant de spinner de chargement réutilisable avec tailles configurables
 * et texte optionnel. Remplace tous les spinners dupliqués du projet.
 *
 * @example
 * ```tsx
 * <LoadingSpinner />
 *
 * <LoadingSpinner size="lg" text="Chargement..." />
 *
 * <LoadingSpinner size="sm" className="py-0" />
 * ```
 */

import { cn } from "../../styles/designTokens";
import { useTranslation } from "react-i18next";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface LoadingSpinnerProps {
  /**
   * Taille du spinner
   * - sm: h-4 w-4 (petit, pour utilisation inline)
   * - md: h-5 w-5 (défaut, usage standard)
   * - lg: h-8 w-8 (grand, pour pages principales)
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Texte optionnel à afficher à côté du spinner
   * @example "Chargement des données..."
   */
  text?: string;

  /**
   * Classes CSS additionnelles
   * @example "py-0" pour désactiver le padding vertical
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function LoadingSpinner({
  size = "md",
  text,
  className,
}: LoadingSpinnerProps) {
  const { t } = useTranslation("common");

  // Mapping des tailles
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div
      className={cn("flex items-center justify-center py-12 gap-3", className)}
      role="status"
      aria-live="polite"
    >
      <svg
        className={cn(spinnerSize, "animate-spin text-blue-600")}
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {text && <span className="text-sm text-gray-500">{text}</span>}
      {/* Screen reader text */}
      <span className="sr-only">{text || t("messages.loading")}</span>
    </div>
  );
}

export default LoadingSpinner;
