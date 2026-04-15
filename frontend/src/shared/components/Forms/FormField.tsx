/**
 * FormField Component
 *
 * Composant wrapper réutilisable pour gérer les champs de formulaire avec label,
 * validation et messages d'erreur. Fournit une structure cohérente et accessible
 * pour tous les inputs, selects et textareas.
 *
 * @example
 * ```tsx
 * // Exemple 1 : Champ simple
 * <FormField id="email" label="Email" required>
 *   <Input type="email" id="email" />
 * </FormField>
 *
 * // Exemple 2 : Avec erreur
 * <FormField id="password" label="Mot de passe" required error="Mot de passe trop court">
 *   <Input type="password" id="password" />
 * </FormField>
 *
 * // Exemple 3 : Avec texte d'aide
 * <FormField id="username" label="Nom d'utilisateur" helpText="3-20 caractères alphanumériques">
 *   <Input id="username" />
 * </FormField>
 *
 * // Exemple 4 : Avec icône
 * <FormField id="email" label="Email" icon={<MailIcon />}>
 *   <Input type="email" id="email" />
 * </FormField>
 *
 * // Exemple 5 : Avec Select
 * <FormField id="country" label="Pays" required>
 *   <select id="country" className={FORM.select}>
 *     <option>France</option>
 *     <option>Belgique</option>
 *   </select>
 * </FormField>
 * ```
 */

import { ReactNode } from "react";
import { cn, FORM } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface FormFieldProps {
  /**
   * Identifiant unique du champ
   * Utilisé pour l'association label/input via htmlFor
   * @required
   */
  id: string;

  /**
   * Texte du label affiché au-dessus du champ
   * @required
   */
  label: string;

  /**
   * Indique si le champ est requis
   * Affiche un astérisque rouge (*) après le label
   * @default false
   */
  required?: boolean;

  /**
   * Indique si le champ est optionnel
   * Affiche "(optionnel)" après le label
   * @default false
   */
  optional?: boolean;

  /**
   * Message d'erreur à afficher sous le champ
   * Lorsque présent, remplace le texte d'aide et s'affiche en rouge
   */
  error?: string;

  /**
   * Texte d'aide descriptif affiché sous le champ en gris
   * N'est pas affiché si un message d'erreur est présent
   */
  helpText?: string;

  /**
   * Icône à afficher à gauche du label
   * Peut être n'importe quel ReactNode (composant icône, SVG, etc.)
   */
  icon?: ReactNode;

  /**
   * Composant enfant à wrapper (Input, Select, Textarea, etc.)
   * @required
   */
  children: ReactNode;

  /**
   * Classes CSS additionnelles pour le container principal
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function FormField({
  id,
  label,
  required = false,
  optional = false,
  error,
  helpText,
  icon,
  children,
  className = "",
}: FormFieldProps) {
  // Déterminer la classe du label selon les props
  const getLabelClass = () => {
    if (icon) {
      // Si icône présente, on compose manuellement avec flex
      return cn(FORM.label, "flex items-center");
    }

    // Sans icône, utiliser les tokens directement
    if (required) return FORM.labelRequired;
    if (optional) return FORM.labelOptional;
    return FORM.label;
  };

  return (
    <div className={cn(FORM.field, className)}>
      {/* Label avec icône optionnelle et indicateur requis */}
      <label htmlFor={id} className={getLabelClass()}>
        {/* Icône optionnelle */}
        {icon && (
          <span className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Texte du label */}
        <span>{label}</span>

        {/* Astérisque pour champ requis (seulement si icône présente) */}
        {icon && required && (
          <span className="ml-0.5 text-red-500" aria-label="requis">
            *
          </span>
        )}
      </label>

      {/* Wrapper du champ input/select/textarea */}
      <div className="mt-1">{children}</div>

      {/* Messages de feedback (erreur ou aide) */}
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

      {!error && helpText && <p className={FORM.helpText}>{helpText}</p>}
    </div>
  );
}

export default FormField;
