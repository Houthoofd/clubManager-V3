/**
 * CategoryModal
 * Modal pour créer ou modifier une catégorie.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Category } from "../api/storeApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

export interface CategoryFormData {
  nom: string;
  description?: string;
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
 * CategoryModal — Modal de création / modification d'une catégorie.
 *
 * - Si `category` est fourni  → mode édition (pré-remplit les champs)
 * - Si `category` est absent  → mode création
 * Fermeture sur Escape ou clic overlay (hors chargement).
 */
export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  const isEditMode = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      nom: category?.nom ?? "",
      description: category?.description ?? "",
      ordre: category?.ordre ?? undefined,
    },
  });

  // ── Synchronise les valeurs quand la catégorie change ou que la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: category?.nom ?? "",
        description: category?.description ?? "",
        ordre: category?.ordre ?? ("" as unknown as number),
      });
    }
  }, [isOpen, category, reset]);

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: CategoryFormData) => {
    const payload: CategoryFormData = {
      nom: data.nom,
      description: data.description || undefined,
      ordre: data.ordre ? Number(data.ordre) : undefined,
    };
    await onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-form-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2
              id="category-form-title"
              className="text-xl font-semibold text-gray-900"
            >
              {isEditMode ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fermer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Modifiez les informations de la catégorie existante."
              : "Créez une nouvelle catégorie pour organiser vos articles."}
          </p>
        </div>

        {/* ── Formulaire ── */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="px-6 py-5 space-y-5"
        >
          {/* Nom */}
          <div>
            <label
              htmlFor="category-nom"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nom de la catégorie <span className="text-red-500">*</span>
            </label>
            <input
              id="category-nom"
              type="text"
              placeholder="Ex : Vêtements, Équipements, Accessoires…"
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.nom ? "border-red-400" : "border-gray-300"
              }`}
              {...register("nom", {
                required: "Le nom de la catégorie est requis.",
                minLength: {
                  value: 2,
                  message: "Le nom doit comporter au moins 2 caractères.",
                },
                maxLength: {
                  value: 100,
                  message: "Le nom ne peut pas dépasser 100 caractères.",
                },
              })}
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="category-description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <textarea
              id="category-description"
              rows={3}
              placeholder="Décrivez le type d'articles dans cette catégorie…"
              disabled={isSubmitting}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors resize-none"
              {...register("description")}
            />
          </div>

          {/* Ordre */}
          <div>
            <label
              htmlFor="category-ordre"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Ordre d&apos;affichage
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <input
              id="category-ordre"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
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

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <SpinnerIcon />}
              {isSubmitting
                ? "Enregistrement…"
                : isEditMode
                  ? "Mettre à jour"
                  : "Créer la catégorie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
