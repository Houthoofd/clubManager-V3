import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { cn, INPUT, FORM } from "../../styles/designTokens";

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
  size?: "sm" | "md" | "lg";
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
  placeholder = "Rechercher...",
  debounce = 0,
  size = "md",
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
    setLocalValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      onEnter();
    }
  };

  // Adapter la taille des icônes selon la prop size
  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Adapter le padding right si bouton clear visible
  const paddingRightClasses = {
    sm: showClear && value ? "pr-9" : "pr-4",
    md: showClear && value ? "pr-10" : "pr-4",
    lg: showClear && value ? "pr-12" : "pr-4",
  };

  return (
    <div className={cn(FORM.searchWrapper, className)}>
      {/* Icône de recherche (gauche) */}
      <span className={cn(FORM.searchIcon, iconSizeClasses[size])}>
        <svg
          className="h-full w-full"
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
        className={cn(
          INPUT.base,
          INPUT.size[size],
          FORM.searchInput,
          paddingRightClasses[size],
          disabled && INPUT.disabled,
        )}
        aria-label={placeholder}
      />

      {/* Bouton Clear (droite, si showClear && value) */}
      {showClear && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={FORM.searchClearButton}
          aria-label="Effacer la recherche"
        >
          <svg
            className={iconSizeClasses[size]}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
