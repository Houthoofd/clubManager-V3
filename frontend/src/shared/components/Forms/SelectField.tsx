/**
 * SelectField Component
 *
 * Composant réutilisable pour les champs de sélection (dropdown) avec label,
 * validation et messages d'erreur. Fournit une interface cohérente pour tous
 * les menus déroulants de l'application.
 *
 * @example
 * ```tsx
 * // Exemple 1 : Select simple
 * <SelectField
 *   id="role"
 *   label="Rôle"
 *   options={[
 *     { value: 'member', label: 'Membre' },
 *     { value: 'admin', label: 'Administrateur' },
 *   ]}
 *   value={role}
 *   onChange={setRole}
 * />
 *
 * // Exemple 2 : Avec placeholder et requis
 * <SelectField
 *   id="country"
 *   label="Pays"
 *   placeholder="Sélectionnez un pays"
 *   options={countries}
 *   required
 *   error={errors.country}
 * />
 *
 * // Exemple 3 : Avec options désactivées
 * <SelectField
 *   id="plan"
 *   label="Plan tarifaire"
 *   options={[
 *     { value: 'free', label: 'Gratuit' },
 *     { value: 'pro', label: 'Pro', disabled: true },
 *   ]}
 * />
 *
 * // Exemple 4 : Avec icône et aide
 * <SelectField
 *   id="category"
 *   label="Catégorie"
 *   icon={<TagIcon />}
 *   options={categories}
 *   helpText="Choisissez la catégorie appropriée"
 * />
 * ```
 */

import { ReactNode, SelectHTMLAttributes } from "react";
import { cn, FORM } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

/**
 * Option individuelle du select
 */
export interface SelectOption {
  /**
   * Valeur de l'option
   */
  value: string | number;

  /**
   * Label affiché pour l'option
   */
  label: string;

  /**
   * Option désactivée (non sélectionnable)
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props du composant SelectField
 */
export interface SelectFieldProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value" | "className"
> {
  /**
   * Identifiant unique du champ
   * Utilisé pour l'association label/select via htmlFor
   * @required
   */
  id: string;

  /**
   * Texte du label affiché au-dessus du select
   * @required
   */
  label: string;

  /**
   * Liste des options disponibles dans le select
   * @required
   */
  options: SelectOption[];

  /**
   * Valeur actuellement sélectionnée
   */
  value?: string | number;

  /**
   * Handler appelé lors du changement de valeur
   * Reçoit la nouvelle valeur sélectionnée (string ou number)
   */
  onChange?: (value: string | number) => void;

  /**
   * Indique si le champ est requis
   * Affiche un astérisque rouge (*) après le label
   * @default false
   */
  required?: boolean;

  /**
   * Message d'erreur à afficher sous le champ
   * Lorsque présent, remplace le texte d'aide et s'affiche en rouge
   * Change également le style du select (bordure rouge)
   */
  error?: string;

  /**
   * Texte d'aide descriptif affiché sous le champ en gris
   * N'est pas affiché si un message d'erreur est présent
   */
  helpText?: string;

  /**
   * Texte du placeholder (option vide par défaut)
   * Si fourni, ajoute une option vide en première position
   * @example "Sélectionnez une option"
   */
  placeholder?: string;

  /**
   * Désactive le champ (non éditable)
   * @default false
   */
  disabled?: boolean;

  /**
   * Icône à afficher à gauche du label
   * Peut être n'importe quel ReactNode (composant icône, SVG, etc.)
   */
  icon?: ReactNode;

  /**
   * Classes CSS additionnelles pour le container principal
   */
  className?: string;
}

// ─── ICÔNE CHEVRON DOWN ──────────────────────────────────────────────────────

interface ChevronDownIconProps {
  className?: string;
}

function ChevronDownIcon({ className = "" }: ChevronDownIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  required = false,
  error,
  helpText,
  placeholder,
  disabled = false,
  icon,
  className = "",
  ...props
}: SelectFieldProps) {
  // Handler pour le changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      const selectedValue = e.target.value;
      // Tenter de convertir en nombre si la valeur d'origine était un nombre
      const option = options.find((opt) => String(opt.value) === selectedValue);
      if (option && typeof option.value === "number") {
        onChange(Number(selectedValue));
      } else {
        onChange(selectedValue);
      }
    }
  };

  return (
    <div className={cn(FORM.field, className)}>
      {/* Label avec icône optionnelle et indicateur requis */}
      <label
        htmlFor={id}
        className={cn(FORM.label, icon ? "flex items-center" : undefined)}
      >
        {/* Icône optionnelle */}
        {icon && (
          <span className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Texte du label */}
        <span>{label}</span>

        {/* Astérisque pour champ requis */}
        {required && (
          <span className="ml-0.5 text-red-500" aria-label="requis">
            *
          </span>
        )}
      </label>

      {/* Container du select avec icône chevron */}
      <div className="relative">
        <select
          id={id}
          value={value !== undefined ? value : ""}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={cn(
            FORM.select,
            "pr-10 appearance-none",
            error && FORM.selectError,
            disabled &&
              "bg-gray-50 text-gray-500 cursor-not-allowed opacity-60",
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${id}-error` : helpText ? `${id}-help` : undefined
          }
          {...props}
        >
          {/* Option placeholder (vide) */}
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}

          {/* Options disponibles */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Icône chevron à droite */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDownIcon
            className={cn(
              "h-5 w-5",
              disabled ? "text-gray-400" : "text-gray-400",
            )}
          />
        </div>
      </div>

      {/* Messages de feedback (erreur ou aide) */}
      {(error || helpText) && (
        <div>
          {error ? (
            <p id={`${id}-error`} className={FORM.errorText} role="alert">
              {error}
            </p>
          ) : (
            <p id={`${id}-help`} className={FORM.helpText}>
              {helpText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SelectField;
