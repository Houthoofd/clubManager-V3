/**
 * PricingPlanFormModal
 * Modal pour créer ou modifier un plan tarifaire.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { PricingPlan } from '@clubmanager/types';

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
 * PricingPlanFormModal — Modal de création / modification d'un plan tarifaire.
 *
 * - Si `plan` est fourni  → mode édition (pré-remplit les champs)
 * - Si `plan` est absent  → mode création
 * Fermeture sur Escape ou clic overlay (hors chargement).
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
      nom: plan?.nom ?? '',
      description: plan?.description ?? '',
      prix: plan?.prix ?? undefined,
      duree_mois: plan?.duree_mois ?? 1,
    },
  });

  // ── Synchronise les valeurs quand le plan change ou que la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: plan?.nom ?? '',
        description: plan?.description ?? '',
        prix: plan?.prix ?? ('' as unknown as number),
        duree_mois: plan?.duree_mois ?? 1,
      });
    }
  }, [isOpen, plan, reset]);

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-form-title"
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
              id="plan-form-title"
              className="text-xl font-semibold text-gray-900"
            >
              {isEditMode ? 'Modifier le plan tarifaire' : 'Nouveau plan tarifaire'}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? 'Modifiez les informations du plan tarifaire existant.'
              : 'Définissez un nouveau plan tarifaire pour les membres du club.'}
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
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.nom ? 'border-red-400' : 'border-gray-300'}`}
              {...register('nom', {
                required: 'Le nom du plan est requis.',
                minLength: {
                  value: 2,
                  message: 'Le nom doit comporter au moins 2 caractères.',
                },
                maxLength: {
                  value: 100,
                  message: 'Le nom ne peut pas dépasser 100 caractères.',
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
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                            transition-colors
                            ${errors.prix ? 'border-red-400' : 'border-gray-300'}`}
                {...register('prix', {
                  required: 'Le prix est requis.',
                  min: {
                    value: 0.01,
                    message: 'Le prix doit être supérieur à 0.',
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.prix && (
                <p className="mt-1 text-xs text-red-600">{errors.prix.message}</p>
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
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                            transition-colors
                            ${errors.duree_mois ? 'border-red-400' : 'border-gray-300'}`}
                {...register('duree_mois', {
                  required: 'La durée est requise.',
                  min: {
                    value: 1,
                    message: 'La durée doit être d\'au moins 1 mois.',
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.duree_mois && (
                <p className="mt-1 text-xs text-red-600">{errors.duree_mois.message}</p>
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
              <span className="ml-1 text-xs text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              id="plan-description"
              rows={3}
              placeholder="Décrivez les avantages ou conditions de ce plan…"
              disabled={isSubmitting}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                         transition-colors resize-none"
              {...register('description')}
            />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200
                         active:bg-gray-300 rounded-lg transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <SpinnerIcon />}
              {isSubmitting
                ? 'Enregistrement…'
                : isEditMode
                  ? 'Mettre à jour'
                  : 'Créer le plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
