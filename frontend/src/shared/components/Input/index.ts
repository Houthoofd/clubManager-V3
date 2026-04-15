/**
 * Input Family - Barrel Export
 *
 * Exporte tous les composants et types de la famille Input
 */

export { Input } from "./Input";
export type {
  InputProps,
  TextareaProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  InputSize,
  InputType,
} from "./Input";

/**
 * @deprecated FormInput is deprecated. Use FormField + Input instead.
 *
 * Migration example:
 * ```tsx
 * // BEFORE (FormInput):
 * <FormInput
 *   label="Email"
 *   id="email"
 *   type="email"
 *   register={register("email")}
 *   error={errors.email?.message}
 *   required
 * />
 *
 * // AFTER (FormField + Input):
 * <FormField id="email" label="Email" required error={errors.email?.message}>
 *   <Input id="email" type="email" {...register("email")} />
 * </FormField>
 * ```
 *
 * @see docs/audits/migrations/003-deprecate-forminput.md
 */
export { FormInput } from "./FormInput";
export type { FormInputProps } from "./FormInput";

export { PasswordInput } from "./PasswordInput";
export type { PasswordInputProps } from "./PasswordInput";
