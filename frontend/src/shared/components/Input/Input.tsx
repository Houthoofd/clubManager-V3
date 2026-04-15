/**
 * Input Component - ClubManager V3
 *
 * Composants de formulaire réutilisables : Input, Textarea, Select, Checkbox, Radio.
 * Supporte plusieurs tailles, états (error, success), icônes, prefix/suffix.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="vous@example.com"
 *   error={errors.email?.message}
 * />
 * ```
 *
 * @see Input.md pour la documentation complète
 * @see Input.examples.tsx pour des exemples d'utilisation
 */

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import type React from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type InputSize = "sm" | "md" | "lg";
export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "date"
  | "time"
  | "datetime-local";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Libellé du champ */
  label?: string;
  /** Taille du champ */
  size?: InputSize;
  /** Message d'erreur (affiche l'état error) */
  error?: string;
  /** Message de succès (affiche l'état success) */
  success?: string;
  /** Texte d'aide sous le champ */
  helperText?: string;
  /** Icône à gauche */
  iconLeft?: React.ReactNode;
  /** Icône à droite */
  iconRight?: React.ReactNode;
  /** Préfixe textuel (ex: "https://") */
  prefix?: string;
  /** Suffixe textuel (ex: "@example.com") */
  suffix?: string;
  /** Affiche le compteur de caractères (nécessite maxLength) */
  showCharCount?: boolean;
  /** Le champ est requis (affiche *) */
  required?: boolean;
  /** Classe CSS additionnelle pour le conteneur */
  containerClassName?: string;
  /** Classe CSS additionnelle pour le label */
  labelClassName?: string;
}

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  /** Libellé du champ */
  label?: string;
  /** Taille du champ */
  size?: InputSize;
  /** Message d'erreur */
  error?: string;
  /** Message de succès */
  success?: string;
  /** Texte d'aide */
  helperText?: string;
  /** Affiche le compteur de caractères */
  showCharCount?: boolean;
  /** Le champ est requis */
  required?: boolean;
  /** Classe CSS additionnelle pour le conteneur */
  containerClassName?: string;
  /** Classe CSS additionnelle pour le label */
  labelClassName?: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  /** Libellé du champ */
  label?: string;
  /** Taille du champ */
  size?: InputSize;
  /** Message d'erreur */
  error?: string;
  /** Message de succès */
  success?: string;
  /** Texte d'aide */
  helperText?: string;
  /** Le champ est requis */
  required?: boolean;
  /** Classe CSS additionnelle pour le conteneur */
  containerClassName?: string;
  /** Classe CSS additionnelle pour le label */
  labelClassName?: string;
  /** Options du select (alternative à children) */
  options?: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
}

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  /** Libellé du checkbox */
  label: string;
  /** Message d'erreur */
  error?: string;
  /** Texte d'aide */
  helperText?: string;
  /** Classe CSS additionnelle pour le conteneur */
  containerClassName?: string;
}

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  /** Libellé du radio */
  label: string;
  /** Message d'erreur */
  error?: string;
  /** Texte d'aide */
  helperText?: string;
  /** Classe CSS additionnelle pour le conteneur */
  containerClassName?: string;
}

// ─── INTERFACE COMPOSANT COMPOSÉ ─────────────────────────────────────────────

interface InputComponent extends React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
> {
  Textarea: React.ForwardRefExoticComponent<
    TextareaProps & React.RefAttributes<HTMLTextAreaElement>
  >;
  Select: React.ForwardRefExoticComponent<
    SelectProps & React.RefAttributes<HTMLSelectElement>
  >;
  Checkbox: React.ForwardRefExoticComponent<
    CheckboxProps & React.RefAttributes<HTMLInputElement>
  >;
  Radio: React.ForwardRefExoticComponent<
    RadioProps & React.RefAttributes<HTMLInputElement>
  >;
}

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<InputSize, { input: string; text: string }> = {
  sm: {
    input: "px-3 py-1.5 text-xs",
    text: "text-xs",
  },
  md: {
    input: "px-3 py-2.5 text-sm",
    text: "text-sm",
  },
  lg: {
    input: "px-4 py-3 text-base",
    text: "text-base",
  },
};

const BASE_INPUT_CLASSES =
  "block w-full border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500";

const getInputStateClasses = (error?: string, success?: string) => {
  if (error) {
    return "border-red-400 focus:ring-red-500 focus:border-red-500";
  }
  if (success) {
    return "border-green-400 focus:ring-green-500 focus:border-green-500";
  }
  return "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
};

// ─── COMPOSANT INPUT PRINCIPAL ───────────────────────────────────────────────

/**
 * Input — Champ de saisie principal.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="vous@example.com"
 *   error="Email invalide"
 *   required
 * />
 * ```
 */
const InputBase = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      size = "md",
      error,
      success,
      helperText,
      iconLeft,
      iconRight,
      prefix,
      suffix,
      showCharCount,
      required,
      containerClassName = "",
      labelClassName = "",
      className = "",
      maxLength,
      value,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState("");
    const currentValue = value !== undefined ? String(value) : internalValue;
    const charCount = currentValue.length;

    const hasLeftAddon = !!iconLeft || !!prefix;
    const hasRightAddon = !!iconRight || !!suffix || type === "password";

    return (
      <div className={containerClassName}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Icon Left */}
          {iconLeft && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {iconLeft}
            </div>
          )}

          {/* Prefix */}
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={`text-gray-500 ${SIZE_CLASSES[size].text}`}>
                {prefix}
              </span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            maxLength={maxLength}
            value={value}
            onChange={(e) => {
              setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            className={`
              ${BASE_INPUT_CLASSES}
              ${SIZE_CLASSES[size].input}
              ${getInputStateClasses(error, success)}
              ${hasLeftAddon ? "pl-10" : ""}
              ${hasRightAddon ? "pr-10" : ""}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${props.id}-error`
                : success
                  ? `${props.id}-success`
                  : helperText
                    ? `${props.id}-helper`
                    : undefined
            }
            {...props}
          />

          {/* Icon Right */}
          {iconRight && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {iconRight}
            </div>
          )}

          {/* Suffix */}
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={`text-gray-500 ${SIZE_CLASSES[size].text}`}>
                {suffix}
              </span>
            </div>
          )}
        </div>

        {/* Helper Text / Error / Success */}
        {(helperText || error || success) && (
          <div className="mt-1.5">
            {error && (
              <p id={`${props.id}-error`} className="text-xs text-red-600">
                {error}
              </p>
            )}
            {!error && success && (
              <p id={`${props.id}-success`} className="text-xs text-green-600">
                {success}
              </p>
            )}
            {!error && !success && helperText && (
              <p id={`${props.id}-helper`} className="text-xs text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className="mt-1.5 text-right">
            <span
              className={`text-xs ${charCount > maxLength ? "text-red-600" : "text-gray-500"}`}
            >
              {charCount} / {maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);

InputBase.displayName = "Input";

// ─── EXPORT AVEC TYPE COMPOSÉ ────────────────────────────────────────────────

export const Input = InputBase as unknown as InputComponent;

// ─── TEXTAREA ────────────────────────────────────────────────────────────────

/**
 * Input.Textarea — Zone de texte multi-lignes.
 *
 * @example
 * ```tsx
 * <Input.Textarea
 *   label="Description"
 *   rows={4}
 *   maxLength={500}
 *   showCharCount
 * />
 * ```
 */
Input.Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      size = "md",
      error,
      success,
      helperText,
      showCharCount,
      required,
      containerClassName = "",
      labelClassName = "",
      className = "",
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState("");
    const currentValue = value !== undefined ? String(value) : internalValue;
    const charCount = currentValue.length;

    return (
      <div className={containerClassName}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={(e) => {
            setInternalValue(e.target.value);
            props.onChange?.(e);
          }}
          className={`
            ${BASE_INPUT_CLASSES}
            ${SIZE_CLASSES[size].input}
            ${getInputStateClasses(error, success)}
            resize-none
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${props.id}-error`
              : success
                ? `${props.id}-success`
                : helperText
                  ? `${props.id}-helper`
                  : undefined
          }
          {...props}
        />

        {/* Helper Text / Error / Success */}
        {(helperText || error || success) && (
          <div className="mt-1.5">
            {error && (
              <p id={`${props.id}-error`} className="text-xs text-red-600">
                {error}
              </p>
            )}
            {!error && success && (
              <p id={`${props.id}-success`} className="text-xs text-green-600">
                {success}
              </p>
            )}
            {!error && !success && helperText && (
              <p id={`${props.id}-helper`} className="text-xs text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className="mt-1.5 text-right">
            <span
              className={`text-xs ${charCount > maxLength ? "text-red-600" : "text-gray-500"}`}
            >
              {charCount} / {maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Input.Textarea.displayName = "Input.Textarea";

// ─── SELECT ──────────────────────────────────────────────────────────────────

/**
 * Input.Select — Liste déroulante.
 *
 * @example
 * ```tsx
 * <Input.Select
 *   label="Rôle"
 *   options={[
 *     { value: 'admin', label: 'Administrateur' },
 *     { value: 'user', label: 'Utilisateur' }
 *   ]}
 * />
 * ```
 */
Input.Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      size = "md",
      error,
      success,
      helperText,
      required,
      containerClassName = "",
      labelClassName = "",
      className = "",
      options,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          className={`
            ${BASE_INPUT_CLASSES}
            ${SIZE_CLASSES[size].input}
            ${getInputStateClasses(error, success)}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${props.id}-error`
              : success
                ? `${props.id}-success`
                : helperText
                  ? `${props.id}-helper`
                  : undefined
          }
          {...props}
        >
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>

        {/* Helper Text / Error / Success */}
        {(helperText || error || success) && (
          <div className="mt-1.5">
            {error && (
              <p id={`${props.id}-error`} className="text-xs text-red-600">
                {error}
              </p>
            )}
            {!error && success && (
              <p id={`${props.id}-success`} className="text-xs text-green-600">
                {success}
              </p>
            )}
            {!error && !success && helperText && (
              <p id={`${props.id}-helper`} className="text-xs text-gray-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Input.Select.displayName = "Input.Select";

// ─── CHECKBOX ────────────────────────────────────────────────────────────────

/**
 * Input.Checkbox — Case à cocher.
 *
 * @example
 * ```tsx
 * <Input.Checkbox
 *   label="J'accepte les conditions"
 *   error={errors.terms}
 * />
 * ```
 */
Input.Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              type="checkbox"
              className={`
                h-4 w-4 text-blue-600 border-gray-300 rounded
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? "border-red-400" : ""}
                ${className}
              `}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${props.id}-error`
                  : helperText
                    ? `${props.id}-helper`
                    : undefined
              }
              {...props}
            />
          </div>
          <div className="ml-2">
            <label
              htmlFor={props.id}
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              {label}
            </label>
            {(helperText || error) && (
              <div className="mt-0.5">
                {error && (
                  <p id={`${props.id}-error`} className="text-xs text-red-600">
                    {error}
                  </p>
                )}
                {!error && helperText && (
                  <p
                    id={`${props.id}-helper`}
                    className="text-xs text-gray-500"
                  >
                    {helperText}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Input.Checkbox.displayName = "Input.Checkbox";

// ─── RADIO ───────────────────────────────────────────────────────────────────

/**
 * Input.Radio — Bouton radio.
 *
 * @example
 * ```tsx
 * <Input.Radio
 *   name="role"
 *   value="admin"
 *   label="Administrateur"
 * />
 * ```
 */
Input.Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div className={containerClassName}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              type="radio"
              className={`
                h-4 w-4 text-blue-600 border-gray-300
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? "border-red-400" : ""}
                ${className}
              `}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${props.id}-error`
                  : helperText
                    ? `${props.id}-helper`
                    : undefined
              }
              {...props}
            />
          </div>
          <div className="ml-2">
            <label
              htmlFor={props.id}
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              {label}
            </label>
            {(helperText || error) && (
              <div className="mt-0.5">
                {error && (
                  <p id={`${props.id}-error`} className="text-xs text-red-600">
                    {error}
                  </p>
                )}
                {!error && helperText && (
                  <p
                    id={`${props.id}-helper`}
                    className="text-xs text-gray-500"
                  >
                    {helperText}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Input.Radio.displayName = "Input.Radio";
