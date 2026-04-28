/**
 * Input Component
 *
 * Composant de champ de saisie réutilisable avec support d'icônes.
 * Compatible avec React Hook Form via forwardRef.
 *
 * @example
 * ```tsx
 * // Input simple
 * <Input
 *   type="text"
 *   placeholder="Entrez votre nom"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 *
 * // Input avec icône à gauche
 * <Input
 *   type="search"
 *   placeholder="Rechercher..."
 *   value={search}
 *   onChange={(e) => setSearch(e.target.value)}
 *   leftIcon={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
 * />
 *
 * // Input avec icône à droite
 * <Input
 *   type="email"
 *   placeholder="email@example.com"
 *   rightIcon={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
 * />
 *
 * // Input avec erreur
 * <Input
 *   type="text"
 *   placeholder="Nom d'utilisateur"
 *   error="Ce champ est requis"
 * />
 * ```
 */

import { forwardRef, ReactNode, InputHTMLAttributes } from "react";
import { cn, INPUT, FORM } from "../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /**
   * Icône à afficher à gauche du champ
   */
  leftIcon?: ReactNode;

  /**
   * Icône à afficher à droite du champ
   */
  rightIcon?: ReactNode;

  /**
   * Message d'erreur (affiche le champ en rouge)
   */
  error?: string;

  /**
   * Taille du champ
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftIcon,
      rightIcon,
      error,
      size = "md",
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative">
        {/* Icône gauche */}
        {leftIcon && <span className={INPUT.iconLeft}>{leftIcon}</span>}

        {/* Input */}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            INPUT.base,
            INPUT.size[size],
            leftIcon ? INPUT.withIconLeft : undefined,
            rightIcon ? INPUT.withIconRight : undefined,
            error ? INPUT.error : undefined,
            disabled ? INPUT.disabled : undefined,
            className,
          )}
          {...props}
        />

        {/* Icône droite */}
        {rightIcon && <span className={INPUT.iconRight}>{rightIcon}</span>}

        {/* Message d'erreur */}
        {error && (
          <p className={FORM.errorText} role="alert">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default Input;
