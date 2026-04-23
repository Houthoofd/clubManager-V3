/**
 * QuickOrderModal
 * Modal pour passer une commande rapide sur un article.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal } from "@/shared/components/Modal/Modal";
import { BUTTON, cn } from "@/shared/styles/designTokens";
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
 * Utilise le composant Modal partagé pour la structure et la gestion des interactions.
 */
export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  article,
  sizes,
  stocks,
  onSubmit,
}) => {
  const { t } = useTranslation("store");
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

  // ── Handler de fermeture (bloque si en soumission) ────────────────────────
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Image principale de l'article
  const mainImage = article.images?.[0]?.url || article.image_url;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title={t("quickOrderModal.title")}
        showCloseButton
        onClose={handleClose}
      />

      <Modal.Body>
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
            <p className="text-sm text-gray-600 mb-3">{article.description}</p>
          )}
          <p className="text-2xl font-bold text-blue-600">
            {article.prix.toFixed(2)} €
          </p>
        </div>

        {/* Formulaire */}
        <form
          id="quick-order-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Sélection de la taille */}
          <div>
            <label
              htmlFor="order-taille"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              {t("quickOrderModal.fields.size.label")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              id="order-taille"
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.taille_id ? "border-red-400" : "border-gray-300"}`}
              {...register("taille_id", {
                required: t("quickOrderModal.fields.size.required"),
                valueAsNumber: true,
              })}
            >
              <option value="">
                {t("quickOrderModal.fields.size.placeholder")}
              </option>
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
                    {t("quickOrderModal.fields.stock.available")}{" "}
                    <span
                      className={`font-semibold ${
                        stockDisponible > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stockDisponible}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    {t("quickOrderModal.fields.stock.none")}
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
              {t("quickOrderModal.fields.quantity.label")}{" "}
              <span className="text-red-500">*</span>
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
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.quantite ? "border-red-400" : "border-gray-300"}`}
              {...register("quantite", {
                required: t("quickOrderModal.fields.quantity.required"),
                min: {
                  value: 1,
                  message: t("quickOrderModal.fields.quantity.min"),
                },
                max: {
                  value: stockDisponible,
                  message: t("quickOrderModal.fields.quantity.max", {
                    stockDisponible,
                  }),
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
              <span className="text-sm font-medium text-gray-700">
                {t("quickOrderModal.total")}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {total.toFixed(2)} €
              </span>
            </div>
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
          {t("quickOrderModal.actions.cancel")}
        </button>
        <button
          type="submit"
          form="quick-order-form"
          disabled={isSubmitting || !selectedTailleId || stockDisponible === 0}
          className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
        >
          {isSubmitting && (
            <span className="mr-2">
              <SpinnerIcon />
            </span>
          )}
          {isSubmitting
            ? t("quickOrderModal.actions.ordering")
            : t("quickOrderModal.actions.order")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};
