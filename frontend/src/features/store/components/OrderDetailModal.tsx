/**
 * OrderDetailModal
 * Modal pour afficher les détails d'une commande (lecture seule).
 * Avec actions admin optionnelles pour changer le statut.
 * Utilise le composant Modal partagé pour la structure et la gestion des interactions.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/shared/components/Modal/Modal";
import { BUTTON, cn } from "@/shared/styles/designTokens";
import type { OrderWithItems } from "../api/storeApi";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  useStatutsCommande,
  useTransitionsStatutCommande,
  getAvailableTransitions,
} from "../../../shared/hooks/useReferences";
import { formatDate } from "./orderUtils";
import { OrderDetailItemsTable } from "./OrderDetailItemsTable";
import { OrderAdminActions } from "./OrderAdminActions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithItems;
  onUpdateStatus?: (id: number, statut: string) => Promise<void>;
  canManage: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  canManage,
}) => {
  const { t } = useTranslation("store");
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Références DB pour les transitions dynamiques ─────────────────────────
  const statutsQuery = useStatutsCommande();
  const transitionsQuery = useTransitionsStatutCommande();

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

  // ── Transitions dynamiques depuis la DB ───────────────────────────────────
  const currentStatut = statutsQuery.find((s) => s.code === order.statut);
  const dynamicTransitions =
    currentStatut && statutsQuery.length > 0 && transitionsQuery.data
      ? getAvailableTransitions(
          transitionsQuery.data,
          statutsQuery,
          currentStatut.id,
        )
      : null;

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
            <OrderDetailItemsTable items={order.items} total={total} />
          </div>

          {/* Actions admin */}
          {canManage && onUpdateStatus && (
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("orderDetailModal.admin.title")}
              </h3>
              <OrderAdminActions
                order={order}
                isUpdating={isUpdating}
                onStatusChange={handleStatusChange}
                dynamicTransitions={dynamicTransitions}
              />
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
