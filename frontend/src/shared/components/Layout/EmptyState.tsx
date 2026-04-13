/**
 * EmptyState Component
 *
 * Composant réutilisable pour afficher les états vides (no data) de manière cohérente.
 * Utilisé pour les listes vides, recherches sans résultats, boîtes de réception vides, etc.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<UsersIcon />}
 *   title="Aucun membre"
 *   description="Commencez par ajouter votre premier membre au club."
 *   action={{
 *     label: "Ajouter un membre",
 *     onClick: () => navigate('/members/new')
 *   }}
 * />
 * ```
 */

import { ReactNode } from "react";
import { cn } from "../../styles/designTokens";
import { Button } from "../Button";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /**
   * Icône à afficher en haut du composant
   * Recommandé : utiliser des icônes de @patternfly/react-icons
   */
  icon?: ReactNode;

  /**
   * Titre principal de l'état vide
   */
  title: string;

  /**
   * Description / sous-titre explicatif
   */
  description: string;

  /**
   * Action optionnelle sous forme de bouton
   */
  action?: {
    /** Texte du bouton */
    label: string;
    /** Fonction appelée au clic */
    onClick: () => void;
  };

  /**
   * Variant visuel du conteneur
   * - default: Bordure pleine (border-gray-200)
   * - dashed: Bordure en pointillés (border-dashed border-gray-300)
   * @default "default"
   */
  variant?: "default" | "dashed";

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  // Classes CSS selon le variant
  const variantClasses = {
    default: "border border-gray-200 bg-white",
    dashed: "border border-dashed border-gray-300 bg-white",
  };

  return (
    <div
      className={cn(
        "rounded-xl px-6 py-12 text-center",
        variantClasses[variant],
        className,
      )}
    >
      {/* Icône */}
      {icon && (
        <div className="flex justify-center mb-3">
          <div className="h-12 w-12 text-gray-300">{icon}</div>
        </div>
      )}

      {/* Titre */}
      <p className="text-sm font-semibold text-gray-700">{title}</p>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-500">{description}</p>

      {/* Action (Bouton) */}
      {action && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
