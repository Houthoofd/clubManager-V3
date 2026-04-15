import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { cn } from '../../styles/designTokens';

interface SearchBarProps {
  /** Valeur actuelle */
  value: string;
  /** Callback changement (appelé après debounce si défini) */
  onChange: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Debounce en ms (0 = pas de debounce) */
  debounce?: number;
  /** Taille */
  size?: 'sm' | 'md' | 'lg';
  /** Afficher bouton clear (X) */
  showClear?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Callback sur Enter (optionnel) */
  onEnter?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounce = 0,
  size = 'md',
  showClear = false,
  disabled = false,
  className,
  onEnter,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Synchroniser localValue avec value externe
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Gérer le debounce
  useEffect(() => {
    if (debounce && debounce > 0) {
      const timer = setTimeout(() => {
        onChange(localValue);
      }, debounce);

      return () => clearTimeout(timer);
    } else {
      onChange(localValue);
    }
  }, [localValue, debounce, onChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  // Classes conditionnelles selon la taille
  const sizeClasses = {
    sm: {
      input: 'py-2 text-sm',
      icon: 'h-4 w-4',
      paddingLeft: 'pl-9',
      paddingRight: showClear && value ? 'pr-9' : 'pr-3',
    },
    md: {
      input: 'py-2.5 text-sm',
      icon: 'h-5 w-5',
      paddingLeft: 'pl-10',
      paddingRight: showClear && value ? 'pr-10' : 'pr-3',
    },
    lg: {
      input: 'py-3 text-base',
      icon: 'h-6 w-6',
      paddingLeft: 'pl-11',
      paddingRight: showClear && value ? 'pr-11' : 'pr-3',
    },
  };

  const currentSize = sizeClasses[size];
  const iconSize = currentSize.icon;

  const inputClasses = cn(
    'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
    currentSize.input,
    currentSize.paddingLeft,
    currentSize.paddingRight,
    disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
  );

  return (
    <div className={cn('relative', className)}>
      {/* Icône de recherche (gauche) */}
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
        <svg
          className={iconSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </span>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        aria-label={placeholder}
      />

      {/* Bouton Clear (droite, si showClear && value) */}
      {showClear && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors',
            'focus:outline-none focus:text-gray-600'
          )}
          aria-label="Effacer la recherche"
        >
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
