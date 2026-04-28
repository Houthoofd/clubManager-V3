/**
 * CartModal
 * Modal pour afficher et gérer le panier d'achat.
 * Permet de modifier les quantités, supprimer des articles et finaliser la commande.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "../../../shared/components";
import type { CartItem } from "../stores/storeStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (
    articleId: number,
    tailleId: number,
    newQuantity: number,
  ) => void;
  onRemoveItem: (articleId: number, tailleId: number) => void;
  onClearCart: () => void;
  onCheckout: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * CartModal — Modal du panier d'achat.
 *
 * Affiche tous les articles du panier avec possibilité de :
 * - Modifier les quantités
 * - Supprimer des articles
 * - Vider le panier
 * - Finaliser la commande
 */
export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const { t } = useTranslation("store");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Calcul du total ───────────────────────────────────────────────────────
  const total = cartItems.reduce(
    (sum, item) => sum + item.prix * item.quantite,
    0,
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantite, 0);

  // ── Handler pour passer commande ──────────────────────────────────────────
  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await onCheckout();
      onClose();
    } catch (error) {
      // L'erreur est gérée par le parent (toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handler pour vider le panier ──────────────────────────────────────────
  const handleClearCart = () => {
    if (window.confirm(t("cartModal.actions.confirmClear"))) {
      onClearCart();
    }
  };

  // ── Handler pour fermer (avec vérification de soumission) ─────────────────
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
      size="xl"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title={t("cartModal.title")}
        subtitle={
          cartItems.length === 0
            ? t("cartModal.subtitle.empty")
            : totalItems > 1
              ? t("cartModal.subtitle.countPlural", { count: totalItems })
              : t("cartModal.subtitle.count", { count: totalItems })
        }
        showCloseButton
        onClose={handleClose}
      />

      <Modal.Body>
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-900">
              {t("cartModal.empty.title")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t("cartModal.empty.description")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={`${item.article_id}-${item.taille_id}`}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                {/* Image */}
                <div className="flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.article_nom}
                      className="h-20 w-20 rounded-lg object-cover bg-white border border-gray-200"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Détails */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.article_nom}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {t("cartModal.item.size")} {item.taille_nom}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {formatCurrency(item.prix)}
                  </p>

                  {/* Contrôles quantité */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(
                          item.article_id,
                          item.taille_id,
                          item.quantite - 1,
                        )
                      }
                      disabled={item.quantite <= 1 || isSubmitting}
                      className="h-7 w-7 rounded-lg border border-gray-300 bg-white text-gray-600
                               hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center"
                      aria-label={t("cartModal.item.decreaseQuantity")}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                      {item.quantite}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(
                          item.article_id,
                          item.taille_id,
                          item.quantite + 1,
                        )
                      }
                      disabled={isSubmitting}
                      className="h-7 w-7 rounded-lg border border-gray-300 bg-white text-gray-600
                               hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center"
                      aria-label={t("cartModal.item.increaseQuantity")}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onRemoveItem(item.article_id, item.taille_id)
                      }
                      disabled={isSubmitting}
                      className="ml-auto text-xs text-red-600 hover:text-red-700 font-medium
                               disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t("cartModal.item.remove")}
                    </button>
                  </div>
                </div>

                {/* Sous-total */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.prix * item.quantite)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-gray-50" align="between">
        {cartItems.length > 0 ? (
          <>
            {/* Total */}
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-gray-900">
                {t("cartModal.total")}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={isSubmitting}
              >
                {t("cartModal.actions.clear")}
              </Button>

              <Button
                variant="primary"
                onClick={handleCheckout}
                loading={isSubmitting}
              >
                {t("cartModal.actions.checkout")}
              </Button>
            </div>
          </>
        ) : (
          <Button variant="outline" onClick={onClose} fullWidth>
            {t("cartModal.actions.close")}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
