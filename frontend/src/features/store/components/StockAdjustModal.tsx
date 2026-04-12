/**
 * StockAdjustModal
 * Modal pour ajuster le stock d'un article.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stock {
  id: number;
  article_id: number;
  taille_id: number;
  quantite: number;
  quantite_minimum: number;
  stock_disponible: number;
  article_nom?: string;
  taille_nom?: string;
  en_rupture?: boolean;
  stock_bas?: boolean;
}

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock;
  onSubmit: (data: { quantite: number; motif?: string }) => Promise<void>;
}

interface StockAdjustFormData {
  quantite: number;
  motif?: string;
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
 * StockAdjustModal — Modal d'ajustement de stock.
 *
 * Permet d'ajouter ou de retirer du stock avec un motif optionnel.
 * Fermeture sur Escape ou clic overlay (hors chargement).
 */
export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  stock,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustFormData>({
    defaultValues: {
      quantite: 0,
      motif: '',
    },
  });

  // Surveiller la valeur de quantite pour calculer le nouveau stock
  const quantite = useWatch({
    control,
    name: 'quantite',
    defaultValue: 0,
  });

  const nouveauStock = stock.quantite + (Number(quantite) || 0);

  // ── Synchronise les valeurs quand la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        quantite: 0,
        motif: '',
      });
    }
  }, [isOpen, reset]);

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
  const handleFormSubmit = async (data: StockAdjustFormData) => {
    const payload: { quantite: number; motif?: string } = {
      quantite: Number(data.quantite),
      motif: data.motif || undefined,
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
      aria-labelledby="stock-adjust-title"
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
              id="stock-adjust-title"
              className="text-xl font-semibold text-gray-900"
            >
              Ajuster le stock
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
            Ajoutez ou retirez du stock pour cet article.
          </p>
        </div>

        {/* ── Informations du stock ── */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Article :</span>
              <span className="text-sm text-gray-900">{stock.article_nom || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Taille :</span>
              <span className="text-sm text-gray-900">{stock.taille_nom || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Stock actuel :</span>
              <span className="text-sm font-semibold text-gray-900">{stock.quantite}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Nouveau stock :</span>
              <span
                className={`text-sm font-bold ${
                  nouveauStock < 0
                    ? 'text-red-600'
                    : nouveauStock < stock.quantite_minimum
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {nouveauStock}
              </span>
            </div>
          </div>
        </div>

        {/* ── Formulaire ── */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="px-6 py-5 space-y-5"
        >
          {/* Quantité */}
          <div>
            <label
              htmlFor="stock-quantite"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Ajustement <span className="text-red-500">*</span>
            </label>
            <input
              id="stock-quantite"
              type="number"
              step="1"
              placeholder="Ex : +10, -5"
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.quantite ? 'border-red-400' : 'border-gray-300'}`}
              {...register('quantite', {
                required: 'L\'ajustement est requis.',
                valueAsNumber: true,
                validate: (value) => {
                  if (value === 0) {
                    return 'L\'ajustement ne peut pas être 0.';
                  }
                  if (!Number.isInteger(value)) {
                    return 'L\'ajustement doit être un nombre entier.';
                  }
                  return true;
                },
              })}
            />
            {errors.quantite && (
              <p className="mt-1 text-xs text-red-600">{errors.quantite.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Nombre positif pour ajouter, négatif pour retirer
            </p>
          </div>

          {/* Motif */}
          <div>
            <label
              htmlFor="stock-motif"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Motif
              <span className="ml-1 text-xs text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              id="stock-motif"
              rows={3}
              placeholder="Ex : Inventaire, Perte, Réception commande…"
              disabled={isSubmitting}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                         transition-colors resize-none"
              {...register('motif')}
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
              {isSubmitting ? 'Enregistrement…' : 'Ajuster le stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
