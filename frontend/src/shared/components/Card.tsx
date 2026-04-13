/**
 * Card Component
 *
 * Composant de carte réutilisable avec variants et options configurables.
 * Utilise les Design Tokens pour garantir la cohérence visuelle.
 *
 * @example
 * ```tsx
 * <Card variant="standard">
 *   <h2>Titre</h2>
 *   <p>Contenu de la carte</p>
 * </Card>
 *
 * <Card variant="compact" hover>
 *   Carte compacte avec effet hover
 * </Card>
 * ```
 */

import { ReactNode, HTMLAttributes } from 'react';
import { cn, CARD } from '../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Contenu de la carte
   */
  children: ReactNode;

  /**
   * Variant de padding
   * - compact: p-4 (pour grilles/listes)
   * - standard: p-6 (défaut, pages normales)
   * - emphasis: p-8 (auth, landing pages)
   * @default "standard"
   */
  variant?: 'compact' | 'standard' | 'emphasis';

  /**
   * Ajouter un effet hover (shadow augmentée)
   * @default false
   */
  hover?: boolean;

  /**
   * Override du shadow (optionnel)
   * @default "sm"
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * Classes CSS additionnelles
   */
  className?: string;

  /**
   * Désactiver le padding (utile pour les cartes custom)
   * @default false
   */
  noPadding?: boolean;

  /**
   * Désactiver la bordure
   * @default false
   */
  noBorder?: boolean;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function Card({
  children,
  variant = 'standard',
  hover = false,
  shadow = 'sm',
  className = '',
  noPadding = false,
  noBorder = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles (toujours présents)
        'bg-white rounded-xl',

        // Shadow
        !noBorder && CARD.shadow[shadow],

        // Border
        !noBorder && 'border border-gray-100',

        // Padding (si non désactivé)
        !noPadding && CARD.padding[variant],

        // Hover effect
        hover && CARD.hover,

        // Classes additionnelles
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── SOUS-COMPOSANTS ─────────────────────────────────────────────────────────

/**
 * Header de carte avec bordure inférieure
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={cn(CARD.header, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Body de carte (pour séparer header/body/footer)
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

/**
 * Footer de carte avec bordure supérieure
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /**
   * Ajouter un background gris
   * @default false
   */
  gray?: boolean;
}

export function CardFooter({ children, className = '', gray = false, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'border-t border-gray-200 pt-4 mt-4',
        gray && 'bg-gray-50 -mx-6 -mb-6 px-6 pb-6 mt-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
