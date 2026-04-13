/**
 * SubmitButton Component
 *
 * Composant de bouton de soumission optimisé pour les formulaires.
 * Wrapper spécialisé du composant Button avec une API simplifiée pour gérer
 * les états de chargement et la soumission de formulaires.
 *
 * @example
 * ```tsx
 * <SubmitButton
 *   isLoading={isSubmitting}
 *   loadingText="Connexion en cours..."
 * >
 *   Se connecter
 * </SubmitButton>
 * ```
 */

import { ReactNode, forwardRef } from 'react';
import { Button } from './Button';
import type { ButtonProps } from './Button';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface SubmitButtonProps {
  /**
   * État de chargement
   * Désactive automatiquement le bouton et affiche un spinner
   */
  isLoading: boolean;

  /**
   * Texte à afficher pendant le chargement
   * Si non fourni, utilise le contenu children
   * @default children
   */
  loadingText?: string;

  /**
   * Contenu du bouton (texte ou éléments React)
   */
  children: ReactNode;

  /**
   * Variant visuel du bouton
   * - primary: Action principale (bleu) - défaut pour submit
   * - secondary: Action secondaire (gris)
   * - danger: Action destructive (rouge)
   * - success: Action positive (vert)
   * - outline: Bordure sans fond
   * - ghost: Sans fond
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';

  /**
   * Taille du bouton
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Largeur pleine (recommandé pour les formulaires)
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Type de bouton HTML
   * @default "submit"
   */
  type?: 'submit' | 'button';

  /**
   * Désactiver le bouton (en plus de l'état loading)
   * @default false
   */
  disabled?: boolean;

  /**
   * Classes CSS additionnelles
   */
  className?: string;

  /**
   * Callback onClick optionnel
   */
  onClick?: () => void;

  /**
   * Icône à afficher (gauche par défaut)
   */
  icon?: ReactNode;

  /**
   * Position de l'icône
   * @default "left"
   */
  iconPosition?: 'left' | 'right';
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

/**
 * SubmitButton - Bouton de soumission de formulaire avec état de chargement
 *
 * Wrapper spécialisé du composant Button optimisé pour les formulaires.
 * Gère automatiquement l'affichage du spinner et le changement de texte
 * pendant le chargement.
 *
 * @example
 * // Bouton de formulaire simple
 * <SubmitButton isLoading={isSubmitting}>
 *   Enregistrer
 * </SubmitButton>
 *
 * @example
 * // Avec texte de chargement personnalisé
 * <SubmitButton
 *   isLoading={isLoading}
 *   loadingText="Connexion en cours..."
 *   fullWidth
 * >
 *   Se connecter
 * </SubmitButton>
 *
 * @example
 * // Action de suppression
 * <SubmitButton
 *   isLoading={isDeleting}
 *   loadingText="Suppression..."
 *   variant="danger"
 *   type="button"
 *   onClick={handleDelete}
 * >
 *   Supprimer
 * </SubmitButton>
 */
export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    {
      isLoading,
      loadingText,
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      type = 'submit',
      disabled = false,
      className = '',
      onClick,
      icon,
      iconPosition = 'left',
    },
    ref
  ) => {
    // Déterminer le texte à afficher
    const displayText = isLoading && loadingText ? loadingText : children;

    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={isLoading}
        disabled={disabled}
        className={className}
        onClick={onClick}
        icon={icon}
        iconPosition={iconPosition}
      >
        {displayText}
      </Button>
    );
  }
);

SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
