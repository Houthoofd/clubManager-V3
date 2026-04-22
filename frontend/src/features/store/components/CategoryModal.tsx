/**
 * CategoryModal
 * Modal pour créer ou modifier une catégorie.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button } from "../../../shared/components";
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

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * CategoryModal — Modal de création / modification d'une catégorie.
 *
 * - Si `category` est fourni  → mode édition (pré-remplit les champs)
 * - Si `category` est absent  → mode création
 * Fermeture sur Escape ou clic overlay gérée automatiquement par Modal.
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
        title={isEditMode ? "Modifier la catégorie" : "Nouvelle catégorie"}
        subtitle={
          isEditMode
            ? "Modifiez les informations de la catégorie existante."
            : "Créez une nouvelle catégorie pour organiser vos articles."
        }
        onClose={isSubmitting ? undefined : onClose}
      />

      <Modal.Body>
        <form
          id="category-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
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
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
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
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors resize-y"
              {...register("description")}
            />
          </div>

          {/* Ordre */}
          <div>
            <label
              htmlFor="category-ordre"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Ordre d'affichage
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
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="category-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditMode ? "Mettre à jour" : "Créer la catégorie"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
