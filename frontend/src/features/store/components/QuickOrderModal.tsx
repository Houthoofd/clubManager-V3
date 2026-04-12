/**
 * QuickOrderModal
 * Modal pour passer une commande rapide sur un article.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ArticleWithImages, Size, Stock } from "../api/storeApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleWithImages;
  sizes: Size[];
  stocks: Stock[];
  onSubmit: (data: {
    items: Array<{
      article_id: number;
      taille_id: number;
      quantite: number;
      prix: number;
    }>;
  }) => Promise<void>;
}

interface QuickOrderFormData {
  taille_id: number;
  quantite: number;
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
 * QuickOrderModal — Modal de commande rapide pour un article.
 *
 * Permet de sélectionner une taille, une quantité et passer commande rapidement.
 * Affiche le stock disponible et calcule le total en temps réel.
 */
export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  article,
  sizes,
  stocks,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuickOrderFormData>({
    defaultValues: {
      taille_id: undefined,
      quantite: 1,
    },
  });

  const [selectedTailleId, setSelectedTailleId] = useState<number | null>(null);

  // Surveiller la taille sélectionnée
  const watchedTailleId = watch("taille_id");

  // Mettre à jour la taille sélectionnée pour afficher le stock
  useEffect(() => {
    if (watchedTailleId) {
      setSelectedTailleId(Number(watchedTailleId));
    } else {
      setSelectedTailleId(null);
    }
  }, [watchedTailleId]);

  // Trouver le stock disponible pour la taille sélectionnée
  const selectedStock = selectedTailleId
    ? stocks.find((s) => s.taille_id === selectedTailleId)
    : null;

  const stockDisponible = selectedStock?.stock_disponible ?? 0;
  const watchedQuantite = watch("quantite") || 1;

  // Calcul du total
  const total = article.prix * watchedQuantite;

  // ── Synchronise les valeurs quand la modal s'ouvre ────────────────────────
  useEffect(() => {
    if (isOpen) {
      reset({
        taille_id: undefined,
        quantite: 1,
      });
      setSelectedTailleId(null);
    }
  }, [isOpen, reset]);

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
  const handleFormSubmit = async (data: QuickOrderFormData) => {
    const payload = {
      items: [
        {
          article_id: article.id,
          taille_id: Number(data.taille_id),
          quantite: Number(data.quantite),
          prix: article.prix,
        },
      ],
    };
    await onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  // Image principale de l'article
  const mainImage = article.images?.[0]?.url || article.image_url;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-order-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2
              id="quick-order-title"
              className="text-xl font-semibold text-gray-900"
            >
              Commande rapide
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
        </div>

        {/* ── Contenu ── */}
        <div className="px-6 py-5">
          {/* Image de l'article */}
          {mainImage && (
            <div className="mb-5 rounded-lg overflow-hidden bg-gray-50">
              <img
                src={mainImage}
                alt={article.nom}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Informations article */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {article.nom}
            </h3>
            {article.description && (
              <p className="text-sm text-gray-600 mb-3">
                {article.description}
              </p>
            )}
            <p className="text-2xl font-bold text-blue-600">
              {article.prix.toFixed(2)} €
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            {/* Sélection de la taille */}
            <div>
              <label
                htmlFor="order-taille"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Taille <span className="text-red-500">*</span>
              </label>
              <select
                id="order-taille"
                disabled={isSubmitting}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                            transition-colors
                            ${errors.taille_id ? "border-red-400" : "border-gray-300"}`}
                {...register("taille_id", {
                  required: "Veuillez sélectionner une taille.",
                  valueAsNumber: true,
                })}
              >
                <option value="">-- Sélectionner une taille --</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.nom}
                  </option>
                ))}
              </select>
              {errors.taille_id && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.taille_id.message}
                </p>
              )}

              {/* Affichage du stock disponible */}
              {selectedTailleId && (
                <div className="mt-2">
                  {selectedStock ? (
                    <p className="text-sm text-gray-600">
                      Stock disponible :{" "}
                      <span
                        className={`font-semibold ${
                          stockDisponible > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stockDisponible}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      Aucun stock disponible pour cette taille
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantité */}
            <div>
              <label
                htmlFor="order-quantite"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Quantité <span className="text-red-500">*</span>
              </label>
              <input
                id="order-quantite"
                type="number"
                min="1"
                max={stockDisponible}
                step="1"
                disabled={
                  isSubmitting || !selectedTailleId || stockDisponible === 0
                }
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                            transition-colors
                            ${errors.quantite ? "border-red-400" : "border-gray-300"}`}
                {...register("quantite", {
                  required: "La quantité est requise.",
                  min: {
                    value: 1,
                    message: "La quantité doit être d'au moins 1.",
                  },
                  max: {
                    value: stockDisponible,
                    message: `La quantité ne peut pas dépasser le stock disponible (${stockDisponible}).`,
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.quantite && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.quantite.message}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {total.toFixed(2)} €
                </span>
              </div>
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
                disabled={
                  isSubmitting || !selectedTailleId || stockDisponible === 0
                }
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                           bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm
                           transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <SpinnerIcon />}
                {isSubmitting ? "Commande en cours…" : "Commander"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
