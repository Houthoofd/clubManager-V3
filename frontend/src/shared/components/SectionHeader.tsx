/**
 * SectionHeader Component
 *
 * Composant d'en-tête de section réutilisable pour les sous-sections à l'intérieur des pages.
 * Utilise h2 ou h3 selon la hiérarchie sémantique (contrairement à PageHeader qui utilise h1).
 *
 * @example
 * ```tsx
 * // Section simple avec badge
 * <SectionHeader title="Membres de la famille" badge={3} />
 *
 * // Section complète avec actions
 * <SectionHeader
 *   title="Articles disponibles"
 *   badge={12}
 *   description="Produits actuellement en stock"
 *   actions={<Button size="sm">Ajouter</Button>}
 *   divider
 * />
 *
 * // Sous-section (h3)
 * <SectionHeader
 *   title="Coordonnées"
 *   level={3}
 *   description="Informations de contact"
 * />
 * ```
 */

import { ReactNode } from 'react';
import { cn } from '../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface SectionHeaderProps {
  /**
   * Titre de la section
   * @required
   */
  title: string;

  /**
   * Description optionnelle (sous-titre)
   * Affichée sous le titre en texte plus petit et grisé
   */
  description?: string;

  /**
   * Badge optionnel (ex: nombre d'items)
   * Peut être un nombre ou une chaîne de caractères
   * Affiché à droite du titre dans une pastille grise
   */
  badge?: number | string;

  /**
   * Actions à droite (boutons, etc.)
   * Typiquement des boutons d'ajout ou de modification
   */
  actions?: ReactNode;

  /**
   * Niveau de heading (h2 ou h3)
   * - h2: Section principale (text-xl)
   * - h3: Sous-section (text-lg)
   * @default 2
   */
  level?: 2 | 3;

  /**
   * Afficher un divider en dessous
   * Ajoute une ligne horizontale pour séparer visuellement les sections
   * @default false
   */
  divider?: boolean;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  description,
  badge,
  actions,
  level = 2,
  divider = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Container principal : Titre/Badge + Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Gauche : Titre + Badge */}
        <div className="flex items-center gap-2">
          {/* Titre (h2 ou h3) */}
          {level === 2 ? (
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}

          {/* Badge optionnel */}
          {badge !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {badge}
            </span>
          )}
        </div>

        {/* Droite : Actions */}
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Description optionnelle */}
      {description && (
        <p className="text-sm text-gray-600">
          {description}
        </p>
      )}

      {/* Divider optionnel */}
      {divider && (
        <div className="border-t border-gray-200 mt-3" />
      )}
    </div>
  );
}

export default SectionHeader;
