/**
 * SizeModal
 * Modal pour créer ou modifier une taille.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/shared/components/Modal/Modal";
import { cn, BUTTON } from "@/shared/styles/designTokens";
import type { Size } from "../api/storeApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: Size;
  onSubmit: (data: SizeFormData) => Promise<void>;
}

export interface SizeFormData {
  nom: string;
  ordre?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * SizeModal — Modal de création / modification d'une taille.
 *
 * - Si `size` est fourni  → mode édition (pré-remplit les champs)
 * - Si `size` est absent  → mode création
 * Fermeture sur Escape ou clic overlay gérée automatiquement par Modal.
 */
export const SizeModal: React.FC<SizeModalProps> = ({
  isOpen,
  onClose,
  size,
  onSubmit,
}) => {
  const isEditMode = !!size;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SizeFormData>({
    defaultValues: {
      nom: size?.nom ?? "",
      ordre: size?.ordre ?? undefined,
    },
  });

  // ── Synchronise les valeurs quand la taille change ou que la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: size?.nom ?? "",
        ordre: size?.ordre ?? ("" as unknown as number),
      });
    }
  }, [isOpen, size, reset]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: SizeFormData) => {
    const payload: SizeFormData = {
      nom: data.nom,
      ordre: data.ordre ? Number(data.ordre) : undefined,
    };
    await onSubmit(payload);
    onClose();
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title={isEditMode ? "Modifier la taille" : "Nouvelle taille"}
        subtitle={
          isEditMode
            ? "Modifiez les informations de la taille existante."
            : "Créez une nouvelle taille pour vos articles."
        }
        onClose={isSubmitting ? undefined : onClose}
      />

      <Modal.Body>
        <form
          id="size-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Nom */}
          <div>
            <label
              htmlFor="size-nom"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nom de la taille <span className="text-red-500">*</span>
            </label>
            <input
              id="size-nom"
              type="text"
              placeholder="Ex : XS, S, M, L, XL…"
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.nom ? "border-red-400" : "border-gray-300"
              }`}
              {...register("nom", {
                required: "Le nom de la taille est requis.",
                minLength: {
                  value: 1,
                  message: "Le nom doit comporter au moins 1 caractère.",
                },
                maxLength: {
                  value: 50,
                  message: "Le nom ne peut pas dépasser 50 caractères.",
                },
              })}
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
            )}
          </div>

          {/* Ordre */}
          <div>
            <label
              htmlFor="size-ordre"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Ordre d&apos;affichage
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <input
              id="size-ordre"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.ordre ? "border-red-400" : "border-gray-300"
              }`}
              {...register("ordre", {
                min: {
                  value: 0,
                  message: "L'ordre doit être supérieur ou égal à 0.",
                },
                valueAsNumber: true,
              })}
            />
            {errors.ordre && (
              <p className="mt-1 text-xs text-red-600">
                {errors.ordre.message}
              </p>
            )}
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className={cn(BUTTON.base, BUTTON.variant.secondary, BUTTON.size.md)}
        >
          Annuler
        </button>
        <button
          type="submit"
          form="size-form"
          disabled={isSubmitting}
          className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
        >
          {isSubmitting && (
            <span className="mr-2">
              <SpinnerIcon />
            </span>
          )}
          {isSubmitting
            ? "Enregistrement…"
            : isEditMode
              ? "Mettre à jour"
              : "Créer la taille"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};
