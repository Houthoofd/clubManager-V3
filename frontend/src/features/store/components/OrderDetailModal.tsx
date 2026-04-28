/**
 * OrderDetailModal
 * Modal pour afficher les détails d'une commande (lecture seule).
 * Avec actions admin optionnelles pour changer le statut.
 * Utilise le composant Modal partagé pour la structure et la gestion des interactions.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../statistics/utils/formatting";
import { Modal } from "@/shared/components/Modal/Modal";
import { BUTTON, cn } from "@/shared/styles/designTokens";
import type { OrderWithItems } from "../api/storeApi";
import { OrderStatusBadge } from "./OrderStatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithItems;
  onUpdateStatus?: (id: number, statut: string) => Promise<void>;
  canManage: boolean;
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * OrderDetailModal — Affiche les détails d'une commande.
 *
 * Mode lecture seule avec actions admin optionnelles pour gérer le statut.
 */
export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  canManage,
}) => {
  const { t } = useTranslation("store");
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Gestion du changement de statut ───────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Handler de fermeture (bloque si en mise à jour) ───────────────────────
  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  // Calcul du total
  const total = order.items.reduce(
    (sum, item) => sum + item.prix * item.quantite,
    0,
  );

  // Vérifier si on peut afficher certains boutons selon le statut
  const canMarkAsPaid = order.statut === "en_attente";
  const canMarkAsShipped = order.statut === "payee";
  const canMarkAsDelivered = order.statut === "expediee";
  const canCancel = order.statut !== "annulee" && order.statut !== "livree";

  // Nom complet du client
  const clientName =
    order.user_first_name && order.user_last_name
      ? `${order.user_first_name} ${order.user_last_name}`
      : t("orderDetailModal.client.unknown");

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      closeOnOverlayClick={!isUpdating}
      closeOnEscape={!isUpdating}
    >
      <Modal.Header
        title={t("orderDetailModal.title")}
        subtitle={order.numero_commande}
        showCloseButton
        onClose={handleClose}
      />

      <Modal.Body>
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {t("orderDetailModal.status")}
              </p>
              <OrderStatusBadge statut={order.statut} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {t("orderDetailModal.orderDate")}
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(order.date_commande)}
              </p>
            </div>
          </div>

          {/* Informations client */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {t("orderDetailModal.client.title")}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("orderDetailModal.client.name")}
                </p>
                <p className="text-sm text-gray-900">{clientName}</p>
              </div>
              {order.user_email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("orderDetailModal.client.email")}
                  </p>
                  <p className="text-sm text-gray-900">{order.user_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Articles commandés */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {t("orderDetailModal.items.title")}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("orderDetailModal.items.article")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("orderDetailModal.items.size")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("orderDetailModal.items.quantity")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("orderDetailModal.items.unitPrice")}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("orderDetailModal.items.subtotal")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.article_image_url && (
                            <img
                              src={item.article_image_url}
                              alt={
                                item.article_nom ||
                                t("orderDetailModal.items.altFallback")
                              }
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {item.article_nom ||
                              t("orderDetailModal.items.unknown")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.taille_nom ||
                          t("orderDetailModal.items.unknownSize")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantite}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.prix)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.prix * item.quantite)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                    >
                      {t("orderDetailModal.items.total")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-lg font-bold text-blue-600">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions admin */}
          {canManage && onUpdateStatus && (
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("orderDetailModal.admin.title")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {canMarkAsPaid && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("payee")}
                    disabled={isUpdating}
                    className={cn(
                      BUTTON.base,
                      BUTTON.variant.primary,
                      BUTTON.size.md,
                    )}
                  >
                    {isUpdating && (
                      <span className="mr-2">
                        <SpinnerIcon />
                      </span>
                    )}
                    {t("orderDetailModal.admin.markAsPaid")}
                  </button>
                )}
                {canMarkAsShipped && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("expediee")}
                    disabled={isUpdating}
                    className={cn(
                      BUTTON.base,
                      "text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 shadow-sm",
                      BUTTON.size.md,
                    )}
                  >
                    {isUpdating && (
                      <span className="mr-2">
                        <SpinnerIcon />
                      </span>
                    )}
                    {t("orderDetailModal.admin.markAsShipped")}
                  </button>
                )}
                {canMarkAsDelivered && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("livree")}
                    disabled={isUpdating}
                    className={cn(
                      BUTTON.base,
                      BUTTON.variant.success,
                      BUTTON.size.md,
                    )}
                  >
                    {isUpdating && (
                      <span className="mr-2">
                        <SpinnerIcon />
                      </span>
                    )}
                    {t("orderDetailModal.admin.markAsDelivered")}
                  </button>
                )}
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("annulee")}
                    disabled={isUpdating}
                    className={cn(
                      BUTTON.base,
                      BUTTON.variant.danger,
                      BUTTON.size.md,
                    )}
                  >
                    {isUpdating && (
                      <span className="mr-2">
                        <SpinnerIcon />
                      </span>
                    )}
                    {t("orderDetailModal.admin.cancelOrder")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-gray-50">
        <button
          type="button"
          onClick={handleClose}
          disabled={isUpdating}
          className={cn(BUTTON.base, BUTTON.variant.outline, BUTTON.size.md)}
        >
          {t("orderDetailModal.actions.close")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};
