/**
 * PageHeader Component
 *
 * Composant d'en-tête de page réutilisable pour garantir la cohérence
 * visuelle à travers toutes les pages de l'application.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
 *   title="Cours"
 *   description="Gestion du planning, des séances et des professeurs"
 *   actions={
 *     <Button variant="primary">Ajouter un cours</Button>
 *   }
 * />
 * ```
 */

import { ReactNode, HTMLAttributes } from "react";
import { cn, LAYOUT } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "className"
> {
  /**
   * Icône optionnelle affichée à gauche du titre
   * Taille recommandée : h-8 w-8
   */
  icon?: ReactNode;

  /**
   * Titre de la page
   * @required
   */
  title: string;

  /**
   * Description optionnelle affichée sous le titre
   */
  description?: string;

  /**
   * Actions (boutons, etc.) affichées à droite
   * Exemple : boutons d'ajout, filtres, etc.
   */
  actions?: ReactNode;

  /**
   * Breadcrumb optionnel affiché au-dessus du titre
   * Exemple : Accueil > Cours > Planning
   */
  breadcrumb?: ReactNode;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function PageHeader({
  icon,
  title,
  description,
  actions,
  breadcrumb,
  className = "",
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(LAYOUT.pageHeader.container, "space-y-4", className)}
      {...props}
    >
      {/* Breadcrumb (optionnel) */}
      {breadcrumb && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {breadcrumb}
        </div>
      )}

      {/* Header principal */}
      <div
        className={cn(
          LAYOUT.pageHeader.wrapper,
          "gap-4 flex-wrap sm:flex-nowrap",
        )}
      >
        {/* Gauche : Icône + Titre + Description */}
        <div className={cn(LAYOUT.pageHeader.left, "min-w-0 flex-1")}>
          {/* Icône */}
          {icon && <div className="flex-shrink-0">{icon}</div>}

          {/* Titre et Description */}
          <div className="min-w-0 flex-1">
            <h1 className={cn(LAYOUT.pageHeader.title, "truncate")}>{title}</h1>
            {description && (
              <p className={LAYOUT.pageHeader.subtitle}>{description}</p>
            )}
          </div>
        </div>

        {/* Droite : Actions */}
        {actions && (
          <div
            className={cn(
              LAYOUT.pageHeader.right,
              "flex-shrink-0 w-full sm:w-auto",
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
