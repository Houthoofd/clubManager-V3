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
 * ```
 */

import { forwardRef, ReactNode, InputHTMLAttributes } from 'react';
import { cn } from '../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        {/* Icône gauche */}
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {leftIcon}
          </span>
        )}

        {/* Input */}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles
            'block w-full rounded-lg text-sm transition-colors',
            'placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',

            // Padding selon les icônes
            leftIcon ? 'pl-9' : 'pl-3',
            rightIcon ? 'pr-9' : 'pr-3',
            'py-2.5',

            // États
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500',

            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-60',

            // Classes additionnelles
            className
          )}
          {...props}
        />

        {/* Icône droite */}
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {rightIcon}
          </span>
        )}

        {/* Message d'erreur */}
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default Input;
