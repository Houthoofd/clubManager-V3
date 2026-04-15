/**
 * FormInput Component
 *
 * Composant de champ de formulaire réutilisable avec support react-hook-form.
 * Conçu pour une intégration transparente avec react-hook-form et la validation.
 *
 * @example
 * ```tsx
 * import { useForm } from "react-hook-form";
 * import { FormInput } from "./FormInput";
 *
 * function LoginForm() {
 *   const { register, handleSubmit, formState: { errors } } = useForm();
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <FormInput
 *         label="Email"
 *         id="email"
 *         type="email"
 *         register={register("email", { required: "Email requis" })}
 *         error={errors.email?.message}
 *         required
 *       />
 *     </form>
 *   );
 * }
 * ```
 */

import { InputHTMLAttributes, useEffect } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface FormInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className"
> {
  /**
   * Label du champ
   * Affiché au-dessus de l'input
   */
  label: string;

  /**
   * ID unique du champ
   * Utilisé pour lier le label à l'input (htmlFor)
   */
  id: string;

  /**
   * Type d'input HTML
   * @default "text"
   */
  type?: "text" | "email" | "password" | "number" | "tel" | "url";

  /**
   * Icône à afficher à gauche de l'input
   * Recommandé: h-5 w-5 pour la taille
   */
  leftIcon?: React.ReactNode;

  /**
   * Élément à afficher à droite de l'input
   * Peut être un bouton (ex: toggle password) ou une icône
   */
  rightElement?: React.ReactNode;

  /**
   * Message d'erreur à afficher sous l'input
   * Change automatiquement le style de l'input en rouge
   */
  error?: string;

  /**
   * Register de react-hook-form
   * Contient les props onChange, onBlur, ref, name
   */
  register?: UseFormRegisterReturn;

  /**
   * Placeholder de l'input
   */
  placeholder?: string;

  /**
   * Marque le champ comme requis
   * Affiche un astérisque rouge (*) après le label
   * @default false
   */
  required?: boolean;

  /**
   * Désactive l'input
   * @default false
   */
  disabled?: boolean;

  /**
   * Classes CSS additionnelles pour le conteneur principal
   */
  className?: string;
}

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

/**
 * Combine plusieurs classes CSS conditionnellement
 */
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function FormInput({
  label,
  id,
  type = "text",
  leftIcon,
  rightElement,
  error,
  register,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  ...props
}: FormInputProps) {
  // ⚠️ DEPRECATION WARNING
  useEffect(() => {
    console.warn(
      "⚠️ DEPRECATED: FormInput is deprecated and will be removed in a future version.\n" +
        "Please use FormField + Input instead.\n\n" +
        "Migration example:\n" +
        "  // BEFORE (FormInput):\n" +
        "  <FormInput\n" +
        '    label="Email"\n' +
        '    id="email"\n' +
        '    type="email"\n' +
        '    register={register("email")}\n' +
        "    error={errors.email?.message}\n" +
        "    required\n" +
        "  />\n\n" +
        "  // AFTER (FormField + Input):\n" +
        '  <FormField id="email" label="Email" required error={errors.email?.message}>\n' +
        "    <Input\n" +
        '      id="email"\n' +
        '      type="email"\n' +
        '      {...register("email")}\n' +
        "    />\n" +
        "  </FormField>\n\n" +
        "See: docs/audits/migrations/003-deprecate-forminput.md",
    );
  }, []);

  // Classes de base de l'input
  const baseInputClasses =
    "block w-full py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors";

  // Padding gauche selon la présence de leftIcon
  const leftPaddingClass = leftIcon ? "pl-10" : "pl-3";

  // Padding droit selon la présence de rightElement
  const rightPaddingClass = rightElement ? "pr-10" : "pr-3";

  // Classes de couleur selon l'état (erreur ou normal)
  const stateClasses = error
    ? "border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300"
    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

  // Classes pour l'état disabled
  const disabledClasses = disabled
    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
    : "";

  // Combiner toutes les classes de l'input
  const inputClasses = cn(
    baseInputClasses,
    leftPaddingClass,
    rightPaddingClass,
    stateClasses,
    disabledClasses,
  );

  // Classes pour les icônes (couleur selon l'état)
  const iconClasses = error ? "text-red-400" : "text-gray-400";

  // Props aria pour l'accessibilité
  const ariaProps = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };

  return (
    <div className={className}>
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={iconClasses}>{leftIcon}</span>
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          type={type}
          {...register}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          {...ariaProps}
          {...props}
        />

        {/* Right element */}
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;
