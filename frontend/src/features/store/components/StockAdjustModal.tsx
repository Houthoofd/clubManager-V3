/**
 * StockAdjustModal
 * Modal pour ajuster le stock d'un article.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Modal } from "@/shared/components/Modal/Modal";
import { BUTTON, cn } from "@/shared/styles/designTokens";

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
 * Utilise le composant Modal partagé pour la structure et la gestion des interactions.
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
      motif: "",
    },
  });

  // Surveiller la valeur de quantite pour calculer le nouveau stock
  const quantite = useWatch({
    control,
    name: "quantite",
    defaultValue: 0,
  });

  const nouveauStock = stock.quantite + (Number(quantite) || 0);

  // ── Synchronise les valeurs quand la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        quantite: 0,
        motif: "",
      });
    }
  }, [isOpen, reset]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: StockAdjustFormData) => {
    const payload: { quantite: number; motif?: string } = {
      quantite: Number(data.quantite),
      motif: data.motif || undefined,
    };
    await onSubmit(payload);
    onClose();
  };

  // ── Handler de fermeture (bloque si en soumission) ────────────────────────
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title="Ajuster le stock"
        subtitle="Ajoutez ou retirez du stock pour cet article."
        showCloseButton
        onClose={handleClose}
      />

      <Modal.Body padding="px-0 py-0">
        {/* ── Informations du stock ── */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Article :
              </span>
              <span className="text-sm text-gray-900">
                {stock.article_nom || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Taille :
              </span>
              <span className="text-sm text-gray-900">
                {stock.taille_nom || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Stock actuel :
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stock.quantite}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Nouveau stock :
              </span>
              <span
                className={`text-sm font-bold ${
                  nouveauStock < 0
                    ? "text-red-600"
                    : nouveauStock < stock.quantite_minimum
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                {nouveauStock}
              </span>
            </div>
          </div>
        </div>

        {/* ── Formulaire ── */}
        <form
          id="stock-adjust-form"
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
                          ${errors.quantite ? "border-red-400" : "border-gray-300"}`}
              {...register("quantite", {
                required: "L'ajustement est requis.",
                valueAsNumber: true,
                validate: (value) => {
                  if (value === 0) {
                    return "L'ajustement ne peut pas être 0.";
                  }
                  if (!Number.isInteger(value)) {
                    return "L'ajustement doit être un nombre entier.";
                  }
                  return true;
                },
              })}
            />
            {errors.quantite && (
              <p className="mt-1 text-xs text-red-600">
                {errors.quantite.message}
              </p>
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
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
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
              {...register("motif")}
            />
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className={cn(BUTTON.base, BUTTON.variant.secondary, BUTTON.size.md)}
        >
          Annuler
        </button>
        <button
          type="submit"
          form="stock-adjust-form"
          disabled={isSubmitting}
          className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
        >
          {isSubmitting && (
            <span className="mr-2">
              <SpinnerIcon />
            </span>
          )}
          {isSubmitting ? "Enregistrement…" : "Ajuster le stock"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};
