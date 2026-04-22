/**
 * PricingPlanFormModal
 * Modal pour créer ou modifier un plan tarifaire.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { PricingPlan } from "@clubmanager/types";
import { Modal, Button } from "../../../shared/components";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: PricingPlan;
  onSubmit: (data: PricingPlanFormData) => Promise<void>;
}

export interface PricingPlanFormData {
  nom: string;
  description?: string;
  prix: number;
  duree_mois: number;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * PricingPlanFormModal — Modal de création / modification d'un plan tarifaire.
 *
 * - Si `plan` est fourni  → mode édition (pré-remplit les champs)
 * - Si `plan` est absent  → mode création
 */
export const PricingPlanFormModal: React.FC<PricingPlanFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan,
  onSubmit,
}) => {
  const isEditMode = !!plan;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PricingPlanFormData>({
    defaultValues: {
      nom: plan?.nom ?? "",
      description: plan?.description ?? "",
      prix: plan?.prix ?? undefined,
      duree_mois: plan?.duree_mois ?? 1,
    },
  });

  // ── Synchronise les valeurs quand le plan change ou que la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: plan?.nom ?? "",
        description: plan?.description ?? "",
        prix: plan?.prix ?? ("" as unknown as number),
        duree_mois: plan?.duree_mois ?? 1,
      });
    }
  }, [isOpen, plan, reset]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: PricingPlanFormData) => {
    const payload: PricingPlanFormData = {
      ...data,
      prix: Number(data.prix),
      duree_mois: Number(data.duree_mois),
      description: data.description || undefined,
    };
    await onSubmit(payload);
    onSuccess();
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
        title={
          isEditMode ? "Modifier le plan tarifaire" : "Nouveau plan tarifaire"
        }
        subtitle={
          isEditMode
            ? "Modifiez les informations du plan tarifaire existant."
            : "Définissez un nouveau plan tarifaire pour les membres du club."
        }
        showCloseButton
        onClose={onClose}
      />

      <Modal.Body>
        <form
          id="plan-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Nom */}
          <div>
            <label
              htmlFor="plan-nom"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nom du plan <span className="text-red-500">*</span>
            </label>
            <input
              id="plan-nom"
              type="text"
              placeholder="Ex : Abonnement mensuel, Pass annuel…"
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.nom ? "border-red-400" : "border-gray-300"}`}
              {...register("nom", {
                required: "Le nom du plan est requis.",
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

          {/* Prix + Durée (2 colonnes) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Prix */}
            <div>
              <label
                htmlFor="plan-prix"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Prix (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="plan-prix"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                disabled={isSubmitting}
                className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                            transition-colors
                            ${errors.prix ? "border-red-400" : "border-gray-300"}`}
                {...register("prix", {
                  required: "Le prix est requis.",
                  min: {
                    value: 0.01,
                    message: "Le prix doit être supérieur à 0.",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.prix && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.prix.message}
                </p>
              )}
            </div>

            {/* Durée en mois */}
            <div>
              <label
                htmlFor="plan-duree"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Durée (mois) <span className="text-red-500">*</span>
              </label>
              <input
                id="plan-duree"
                type="number"
                min="1"
                step="1"
                placeholder="1"
                disabled={isSubmitting}
                className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                            transition-colors
                            ${errors.duree_mois ? "border-red-400" : "border-gray-300"}`}
                {...register("duree_mois", {
                  required: "La durée est requise.",
                  min: {
                    value: 1,
                    message: "La durée doit être d'au moins 1 mois.",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.duree_mois && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.duree_mois.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="plan-description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <textarea
              id="plan-description"
              rows={3}
              placeholder="Décrivez les avantages ou conditions de ce plan…"
              disabled={isSubmitting}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                         transition-colors resize-none"
              {...register("description")}
            />
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          form="plan-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditMode ? "Mettre à jour" : "Créer le plan"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
